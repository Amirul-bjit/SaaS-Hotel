using System.Text;
using HotelBooking.Infrastructure;
using HotelBooking.Infrastructure.Persistence;
using HotelBooking.Infrastructure.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// --- Infrastructure (DB, Repos, Services) ---
builder.Services.AddInfrastructure(builder.Configuration);

// --- JWT Authentication ---
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// --- Authorization Policies ---
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanManageHotel", policy =>
        policy.RequireAssertion(ctx =>
            ctx.User.HasClaim("role", "HOTEL_OWNER") || ctx.User.HasClaim("role", "SUPER_ADMIN")));

    options.AddPolicy("CanViewBookings", policy =>
        policy.RequireAssertion(ctx =>
            ctx.User.HasClaim("role", "CUSTOMER") ||
            ctx.User.HasClaim("role", "HOTEL_OWNER") ||
            ctx.User.HasClaim("role", "SUPER_ADMIN")));

    options.AddPolicy("IsSuperAdmin", policy =>
        policy.RequireAssertion(ctx => ctx.User.HasClaim("role", "SUPER_ADMIN")));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy
            .WithOrigins("http://localhost:3000", "http://localhost:3001")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();

// --- Swagger with JWT support ---
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Hotel Booking SaaS API",
        Version = "v1",
        Description = "Multi-tenant Hotel Booking platform. Use /auth/login to get a JWT token, then click 'Authorize' and paste it as: Bearer {token}"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token (without 'Bearer' prefix). Example: eyJhbGci..."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// --- Auto-migrate and seed (with retry for Docker startup) ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    for (int attempt = 1; attempt <= 10; attempt++)
    {
        try
        {
            db.Database.Migrate();
            await DataSeeder.SeedAsync(db);
            break;
        }
        catch (Exception ex)
        {
            logger.LogWarning("DB not ready (attempt {Attempt}/10): {Message}", attempt, ex.Message);
            if (attempt == 10) throw;
            await Task.Delay(3000);
        }
    }
}

// --- Middleware Pipeline ---
app.UseCors("AllowFrontend");
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel Booking SaaS API v1");
    c.RoutePrefix = string.Empty; // Swagger at root: http://localhost:8080/
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

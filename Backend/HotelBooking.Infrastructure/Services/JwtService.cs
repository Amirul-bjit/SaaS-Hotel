using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HotelBooking.Infrastructure.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration) => _configuration = configuration;

    public string GenerateToken(User user, Guid? hotelId = null)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new("user_id", user.Id.ToString()),
            new("role", user.Role.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.Name)
        };

        if (hotelId.HasValue)
            claims.Add(new Claim("hotel_id", hotelId.Value.ToString()));

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

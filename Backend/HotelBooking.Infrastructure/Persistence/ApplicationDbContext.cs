using HotelBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Hotel> Hotels => Set<Hotel>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<SubscriptionPlanConfig> SubscriptionPlanConfigs => Set<SubscriptionPlanConfig>();
    public DbSet<RoomType> RoomTypes => Set<RoomType>();
    public DbSet<RoomFeature> RoomFeatures => Set<RoomFeature>();
    public DbSet<RoomTypeFeature> RoomTypeFeatures => Set<RoomTypeFeature>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<Hotel>(e =>
        {
            e.HasKey(h => h.Id);
            e.HasOne(h => h.Owner)
             .WithOne(u => u.OwnedHotel)
             .HasForeignKey<Hotel>(h => h.OwnerId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Room>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Price).HasColumnType("decimal(18,2)");
            e.HasOne(r => r.Hotel)
             .WithMany(h => h.Rooms)
             .HasForeignKey(r => r.HotelId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.RoomType)
             .WithMany(rt => rt.Rooms)
             .HasForeignKey(r => r.RoomTypeId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<RoomType>(e =>
        {
            e.HasKey(rt => rt.Id);
            e.Property(rt => rt.BasePrice).HasColumnType("decimal(18,2)");
            e.HasOne(rt => rt.Hotel)
             .WithMany(h => h.RoomTypes)
             .HasForeignKey(rt => rt.HotelId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RoomFeature>(e =>
        {
            e.HasKey(f => f.Id);
            e.HasIndex(f => f.Name).IsUnique();
        });

        modelBuilder.Entity<RoomTypeFeature>(e =>
        {
            e.HasKey(rtf => new { rtf.RoomTypeId, rtf.RoomFeatureId });
            e.HasOne(rtf => rtf.RoomType)
             .WithMany(rt => rt.RoomTypeFeatures)
             .HasForeignKey(rtf => rtf.RoomTypeId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(rtf => rtf.RoomFeature)
             .WithMany(f => f.RoomTypeFeatures)
             .HasForeignKey(rtf => rtf.RoomFeatureId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Inventory>(e =>
        {
            e.HasKey(i => i.Id);
            e.HasIndex(i => new { i.RoomId, i.Date }).IsUnique();
            e.HasOne(i => i.Room)
             .WithMany(r => r.Inventories)
             .HasForeignKey(i => i.RoomId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Booking>(e =>
        {
            e.HasKey(b => b.Id);
            e.Property(b => b.Status).HasConversion<string>();
            e.HasOne(b => b.User)
             .WithMany(u => u.Bookings)
             .HasForeignKey(b => b.UserId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(b => b.Hotel)
             .WithMany(h => h.Bookings)
             .HasForeignKey(b => b.HotelId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(b => b.Room)
             .WithMany(r => r.Bookings)
             .HasForeignKey(b => b.RoomId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Subscription>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.PlanType).HasConversion<string>();
            e.Property(s => s.BillingCycle).HasConversion<string>();
            e.Property(s => s.LastPaymentAmount).HasColumnType("decimal(18,2)");
            e.HasOne(s => s.Hotel)
             .WithOne(h => h.Subscription)
             .HasForeignKey<Subscription>(s => s.HotelId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SubscriptionPlanConfig>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasIndex(p => p.PlanType).IsUnique();
            e.Property(p => p.PlanType).HasConversion<string>();
            e.Property(p => p.MonthlyPrice).HasColumnType("decimal(18,2)");
            e.Property(p => p.YearlyPrice).HasColumnType("decimal(18,2)");
        });

        // Seed global room features
        var features = new[]
        {
            new RoomFeature { Id = Guid.Parse("a1000000-0000-0000-0000-000000000001"), Name = "WiFi", Icon = "wifi" },
            new RoomFeature { Id = Guid.Parse("a1000000-0000-0000-0000-000000000002"), Name = "Private Pool", Icon = "pool" },
            new RoomFeature { Id = Guid.Parse("a1000000-0000-0000-0000-000000000003"), Name = "Sea View", Icon = "waves" },
            new RoomFeature { Id = Guid.Parse("a1000000-0000-0000-0000-000000000004"), Name = "Air Conditioning", Icon = "snowflake" },
            new RoomFeature { Id = Guid.Parse("a1000000-0000-0000-0000-000000000005"), Name = "Parking", Icon = "car" },
            new RoomFeature { Id = Guid.Parse("a1000000-0000-0000-0000-000000000006"), Name = "Breakfast", Icon = "coffee" },
            new RoomFeature { Id = Guid.Parse("a1000000-0000-0000-0000-000000000007"), Name = "Gym", Icon = "dumbbell" },
            new RoomFeature { Id = Guid.Parse("a1000000-0000-0000-0000-000000000008"), Name = "Spa", Icon = "sparkles" },
            new RoomFeature { Id = Guid.Parse("a1000000-0000-0000-0000-000000000009"), Name = "Room Service", Icon = "bell" },
            new RoomFeature { Id = Guid.Parse("a1000000-0000-0000-0000-00000000000a"), Name = "Mini Bar", Icon = "wine" },
            new RoomFeature { Id = Guid.Parse("a1000000-0000-0000-0000-00000000000b"), Name = "Balcony", Icon = "sun" },
            new RoomFeature { Id = Guid.Parse("a1000000-0000-0000-0000-00000000000c"), Name = "Kitchen", Icon = "utensils" },
        };
        modelBuilder.Entity<RoomFeature>().HasData(features);
    }
}

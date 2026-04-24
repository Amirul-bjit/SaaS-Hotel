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
    }
}

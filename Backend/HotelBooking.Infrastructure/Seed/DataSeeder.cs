using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Seed;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.Users.AnyAsync()) return;
        await InsertSeedData(context);
    }

    public static async Task ResetAndSeedAsync(ApplicationDbContext context)
    {
        // Delete all data in dependency order
        context.Inventories.RemoveRange(context.Inventories);
        context.Bookings.RemoveRange(context.Bookings);
        context.Rooms.RemoveRange(context.Rooms);
        context.Subscriptions.RemoveRange(context.Subscriptions);
        context.Hotels.RemoveRange(context.Hotels);
        context.SubscriptionPlanConfigs.RemoveRange(context.SubscriptionPlanConfigs);
        context.Users.RemoveRange(context.Users);
        await context.SaveChangesAsync();

        await InsertSeedData(context);
    }

    private static async Task InsertSeedData(ApplicationDbContext context)
    {
        var superAdminId = Guid.NewGuid();
        var hotelOwner1Id = Guid.NewGuid();
        var hotelOwner2Id = Guid.NewGuid();
        var hotelOwner3Id = Guid.NewGuid();
        var customerId = Guid.NewGuid();

        var hotel1Id = Guid.NewGuid();
        var hotel2Id = Guid.NewGuid();
        var hotel3Id = Guid.NewGuid();

        // --- Users ---
        var superAdmin = new User
        {
            Id = superAdminId,
            Name = "Super Admin",
            Email = "superadmin@hotelbooking.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = UserRole.SUPER_ADMIN
        };
        var hotelOwner1 = new User
        {
            Id = hotelOwner1Id,
            Name = "Alice Johnson",
            Email = "owner@hotelbooking.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner@123"),
            Role = UserRole.HOTEL_OWNER
        };
        var hotelOwner2 = new User
        {
            Id = hotelOwner2Id,
            Name = "Bob Martinez",
            Email = "owner2@hotelbooking.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner@123"),
            Role = UserRole.HOTEL_OWNER
        };
        var hotelOwner3 = new User
        {
            Id = hotelOwner3Id,
            Name = "Carol Lee",
            Email = "owner3@hotelbooking.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner@123"),
            Role = UserRole.HOTEL_OWNER
        };
        var customer = new User
        {
            Id = customerId,
            Name = "Customer One",
            Email = "customer@hotelbooking.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
            Role = UserRole.CUSTOMER
        };

        // --- Hotels ---
        var hotel1 = new Hotel
        {
            Id = hotel1Id,
            Name = "Grand Horizon Hotel",
            OwnerId = hotelOwner1Id,
            Location = "New York, USA"
        };
        var hotel2 = new Hotel
        {
            Id = hotel2Id,
            Name = "Azure Beach Resort",
            OwnerId = hotelOwner2Id,
            Location = "Miami, USA"
        };
        var hotel3 = new Hotel
        {
            Id = hotel3Id,
            Name = "Mountain View Lodge",
            OwnerId = hotelOwner3Id,
            Location = "Denver, USA"
        };

        // --- Rooms ---
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var rooms = new List<(Room Room, int Count)>
        {
            (new Room { Id = Guid.NewGuid(), HotelId = hotel1Id, Name = "Deluxe Suite", Price = 199.99m, TotalRooms = 5, MaxGuests = 2 }, 5),
            (new Room { Id = Guid.NewGuid(), HotelId = hotel1Id, Name = "Executive Room", Price = 149.99m, TotalRooms = 8, MaxGuests = 2 }, 8),
            (new Room { Id = Guid.NewGuid(), HotelId = hotel1Id, Name = "Family Suite", Price = 299.99m, TotalRooms = 3, MaxGuests = 4 }, 3),
            (new Room { Id = Guid.NewGuid(), HotelId = hotel2Id, Name = "Ocean View Room", Price = 249.99m, TotalRooms = 10, MaxGuests = 2 }, 10),
            (new Room { Id = Guid.NewGuid(), HotelId = hotel2Id, Name = "Beachfront Villa", Price = 499.99m, TotalRooms = 2, MaxGuests = 6 }, 2),
            (new Room { Id = Guid.NewGuid(), HotelId = hotel2Id, Name = "Standard Room", Price = 99.99m, TotalRooms = 15, MaxGuests = 2 }, 15),
            (new Room { Id = Guid.NewGuid(), HotelId = hotel3Id, Name = "Mountain Cabin", Price = 179.99m, TotalRooms = 6, MaxGuests = 3 }, 6),
            (new Room { Id = Guid.NewGuid(), HotelId = hotel3Id, Name = "Luxury Chalet", Price = 349.99m, TotalRooms = 4, MaxGuests = 5 }, 4),
        };

        var inventories = rooms.SelectMany(rt =>
            Enumerable.Range(0, 60).Select(i => new Inventory
            {
                Id = Guid.NewGuid(),
                RoomId = rt.Room.Id,
                Date = today.AddDays(i),
                AvailableCount = rt.Count
            })).ToList();

        // --- Subscriptions ---
        var subscriptions = new List<Subscription>
        {
            new() { Id = Guid.NewGuid(), HotelId = hotel1Id, PlanType = SubscriptionPlan.Premium, ExpiryDate = DateTime.UtcNow.AddYears(1) },
            new() { Id = Guid.NewGuid(), HotelId = hotel2Id, PlanType = SubscriptionPlan.Standard, ExpiryDate = DateTime.UtcNow.AddMonths(6) },
            new() { Id = Guid.NewGuid(), HotelId = hotel3Id, PlanType = SubscriptionPlan.Basic, ExpiryDate = DateTime.UtcNow.AddMonths(3) },
        };

        await context.Users.AddRangeAsync(superAdmin, hotelOwner1, hotelOwner2, hotelOwner3, customer);
        await context.Hotels.AddRangeAsync(hotel1, hotel2, hotel3);
        await context.Rooms.AddRangeAsync(rooms.Select(r => r.Room));
        await context.Inventories.AddRangeAsync(inventories);
        await context.Subscriptions.AddRangeAsync(subscriptions);
        await context.SaveChangesAsync();
    }
}

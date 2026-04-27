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
        context.Bookings.RemoveRange(context.Bookings);
        context.Rooms.RemoveRange(context.Rooms);
        context.RoomTypeFeatures.RemoveRange(context.RoomTypeFeatures);
        context.RoomTypes.RemoveRange(context.RoomTypes);
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
        var hotel1 = new Hotel { Id = hotel1Id, Name = "Grand Horizon Hotel", OwnerId = hotelOwner1Id, Location = "New York, USA" };
        var hotel2 = new Hotel { Id = hotel2Id, Name = "Azure Beach Resort", OwnerId = hotelOwner2Id, Location = "Miami, USA" };
        var hotel3 = new Hotel { Id = hotel3Id, Name = "Mountain View Lodge", OwnerId = hotelOwner3Id, Location = "Denver, USA" };

        // --- Feature IDs (must match HasData in DbContext) ---
        var wifiId = Guid.Parse("a1000000-0000-0000-0000-000000000001");
        var poolId = Guid.Parse("a1000000-0000-0000-0000-000000000002");
        var seaViewId = Guid.Parse("a1000000-0000-0000-0000-000000000003");
        var acId = Guid.Parse("a1000000-0000-0000-0000-000000000004");
        var parkingId = Guid.Parse("a1000000-0000-0000-0000-000000000005");
        var breakfastId = Guid.Parse("a1000000-0000-0000-0000-000000000006");
        var gymId = Guid.Parse("a1000000-0000-0000-0000-000000000007");
        var spaId = Guid.Parse("a1000000-0000-0000-0000-000000000008");
        var roomServiceId = Guid.Parse("a1000000-0000-0000-0000-000000000009");
        var miniBarId = Guid.Parse("a1000000-0000-0000-0000-00000000000a");
        var balconyId = Guid.Parse("a1000000-0000-0000-0000-00000000000b");
        var kitchenId = Guid.Parse("a1000000-0000-0000-0000-00000000000c");

        // --- Room Types ---
        var rt1 = new RoomType { Id = Guid.NewGuid(), HotelId = hotel1Id, Name = "Deluxe Suite", Description = "Premium suite with city views", Price = 199.99m, MaxGuests = 2 };
        var rt2 = new RoomType { Id = Guid.NewGuid(), HotelId = hotel1Id, Name = "Executive Room", Description = "Business-ready room", Price = 149.99m, MaxGuests = 2 };
        var rt3 = new RoomType { Id = Guid.NewGuid(), HotelId = hotel1Id, Name = "Family Suite", Description = "Spacious family accommodation", Price = 299.99m, MaxGuests = 4 };
        var rt4 = new RoomType { Id = Guid.NewGuid(), HotelId = hotel2Id, Name = "Ocean View Room", Description = "Room with stunning ocean views", Price = 249.99m, MaxGuests = 2 };
        var rt5 = new RoomType { Id = Guid.NewGuid(), HotelId = hotel2Id, Name = "Beachfront Villa", Description = "Luxury villa on the beach", Price = 499.99m, MaxGuests = 6 };
        var rt6 = new RoomType { Id = Guid.NewGuid(), HotelId = hotel2Id, Name = "Standard Room", Description = "Comfortable standard room", Price = 99.99m, MaxGuests = 2 };
        var rt7 = new RoomType { Id = Guid.NewGuid(), HotelId = hotel3Id, Name = "Mountain Cabin", Description = "Cozy mountain retreat", Price = 179.99m, MaxGuests = 3 };
        var rt8 = new RoomType { Id = Guid.NewGuid(), HotelId = hotel3Id, Name = "Luxury Chalet", Description = "Premium mountain chalet", Price = 349.99m, MaxGuests = 5 };

        // --- RoomType Features ---
        var roomTypeFeatures = new List<RoomTypeFeature>
        {
            new() { RoomTypeId = rt1.Id, RoomFeatureId = wifiId },
            new() { RoomTypeId = rt1.Id, RoomFeatureId = acId },
            new() { RoomTypeId = rt1.Id, RoomFeatureId = roomServiceId },
            new() { RoomTypeId = rt1.Id, RoomFeatureId = miniBarId },
            new() { RoomTypeId = rt1.Id, RoomFeatureId = balconyId },
            new() { RoomTypeId = rt2.Id, RoomFeatureId = wifiId },
            new() { RoomTypeId = rt2.Id, RoomFeatureId = acId },
            new() { RoomTypeId = rt2.Id, RoomFeatureId = gymId },
            new() { RoomTypeId = rt2.Id, RoomFeatureId = breakfastId },
            new() { RoomTypeId = rt3.Id, RoomFeatureId = wifiId },
            new() { RoomTypeId = rt3.Id, RoomFeatureId = acId },
            new() { RoomTypeId = rt3.Id, RoomFeatureId = kitchenId },
            new() { RoomTypeId = rt3.Id, RoomFeatureId = parkingId },
            new() { RoomTypeId = rt3.Id, RoomFeatureId = breakfastId },
            new() { RoomTypeId = rt4.Id, RoomFeatureId = wifiId },
            new() { RoomTypeId = rt4.Id, RoomFeatureId = acId },
            new() { RoomTypeId = rt4.Id, RoomFeatureId = seaViewId },
            new() { RoomTypeId = rt4.Id, RoomFeatureId = balconyId },
            new() { RoomTypeId = rt4.Id, RoomFeatureId = breakfastId },
            new() { RoomTypeId = rt5.Id, RoomFeatureId = wifiId },
            new() { RoomTypeId = rt5.Id, RoomFeatureId = poolId },
            new() { RoomTypeId = rt5.Id, RoomFeatureId = seaViewId },
            new() { RoomTypeId = rt5.Id, RoomFeatureId = acId },
            new() { RoomTypeId = rt5.Id, RoomFeatureId = spaId },
            new() { RoomTypeId = rt5.Id, RoomFeatureId = kitchenId },
            new() { RoomTypeId = rt5.Id, RoomFeatureId = roomServiceId },
            new() { RoomTypeId = rt5.Id, RoomFeatureId = miniBarId },
            new() { RoomTypeId = rt6.Id, RoomFeatureId = wifiId },
            new() { RoomTypeId = rt6.Id, RoomFeatureId = acId },
            new() { RoomTypeId = rt7.Id, RoomFeatureId = wifiId },
            new() { RoomTypeId = rt7.Id, RoomFeatureId = parkingId },
            new() { RoomTypeId = rt7.Id, RoomFeatureId = balconyId },
            new() { RoomTypeId = rt8.Id, RoomFeatureId = wifiId },
            new() { RoomTypeId = rt8.Id, RoomFeatureId = poolId },
            new() { RoomTypeId = rt8.Id, RoomFeatureId = spaId },
            new() { RoomTypeId = rt8.Id, RoomFeatureId = kitchenId },
            new() { RoomTypeId = rt8.Id, RoomFeatureId = parkingId },
            new() { RoomTypeId = rt8.Id, RoomFeatureId = gymId },
        };

        // --- Physical Rooms (individual units with room numbers) ---
        var rooms = new List<Room>();
        void AddRooms(RoomType rt, int count, int startNum)
        {
            for (int i = 0; i < count; i++)
                rooms.Add(new Room { Id = Guid.NewGuid(), RoomTypeId = rt.Id, RoomNumber = $"{startNum + i}" });
        }

        // Grand Horizon Hotel: floors 1xx, 2xx, 3xx
        AddRooms(rt1, 5, 101);  // Deluxe Suite: 101-105
        AddRooms(rt2, 8, 201);  // Executive Room: 201-208
        AddRooms(rt3, 3, 301);  // Family Suite: 301-303

        // Azure Beach Resort: floors 1xx, 2xx, 3xx
        AddRooms(rt4, 10, 101); // Ocean View Room: 101-110
        AddRooms(rt5, 2, 201);  // Beachfront Villa: 201-202
        AddRooms(rt6, 15, 301); // Standard Room: 301-315

        // Mountain View Lodge: cabins C1-C6, chalets CH1-CH4
        for (int i = 1; i <= 6; i++)
            rooms.Add(new Room { Id = Guid.NewGuid(), RoomTypeId = rt7.Id, RoomNumber = $"C{i}" });
        for (int i = 1; i <= 4; i++)
            rooms.Add(new Room { Id = Guid.NewGuid(), RoomTypeId = rt8.Id, RoomNumber = $"CH{i}" });

        // --- Subscriptions ---
        var subscriptions = new List<Subscription>
        {
            new() { Id = Guid.NewGuid(), HotelId = hotel1Id, PlanType = SubscriptionPlan.Premium, IsActive = true, ExpiryDate = DateTime.UtcNow.AddYears(1) },
            new() { Id = Guid.NewGuid(), HotelId = hotel2Id, PlanType = SubscriptionPlan.Standard, IsActive = true, ExpiryDate = DateTime.UtcNow.AddMonths(6) },
            new() { Id = Guid.NewGuid(), HotelId = hotel3Id, PlanType = SubscriptionPlan.Basic, IsActive = true, ExpiryDate = DateTime.UtcNow.AddMonths(3) },
        };

        await context.Users.AddRangeAsync(superAdmin, hotelOwner1, hotelOwner2, hotelOwner3, customer);
        await context.Hotels.AddRangeAsync(hotel1, hotel2, hotel3);
        await context.RoomTypes.AddRangeAsync(rt1, rt2, rt3, rt4, rt5, rt6, rt7, rt8);
        await context.RoomTypeFeatures.AddRangeAsync(roomTypeFeatures);
        await context.Rooms.AddRangeAsync(rooms);
        await context.Subscriptions.AddRangeAsync(subscriptions);
        await context.SaveChangesAsync();
    }
}

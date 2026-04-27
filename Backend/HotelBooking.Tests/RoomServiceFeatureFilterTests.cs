using HotelBooking.Application.DTOs.Room;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Services;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using Moq;

namespace HotelBooking.Tests;

public class RoomServiceFeatureFilterTests
{
    private readonly Mock<IRoomRepository> _roomRepo = new();
    private readonly Mock<IInventoryRepository> _inventoryRepo = new();
    private readonly Mock<ISubscriptionRepository> _subscriptionRepo = new();
    private readonly Mock<ISubscriptionPlanConfigRepository> _planConfigRepo = new();
    private readonly RoomService _sut;

    private readonly Guid _hotelId = Guid.NewGuid();
    private readonly Guid _wifiId = Guid.NewGuid();
    private readonly Guid _poolId = Guid.NewGuid();

    public RoomServiceFeatureFilterTests()
    {
        _sut = new RoomService(
            _roomRepo.Object,
            _inventoryRepo.Object,
            _subscriptionRepo.Object,
            _planConfigRepo.Object);
    }

    private Room CreateRoomWithFeatures(string name, decimal price, Guid hotelId, params Guid[] featureIds)
    {
        var roomTypeId = Guid.NewGuid();
        return new Room
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            Name = name,
            Price = price,
            TotalRooms = 5,
            MaxGuests = 2,
            RoomTypeId = roomTypeId,
            RoomType = new RoomType
            {
                Id = roomTypeId,
                HotelId = hotelId,
                Name = name + " Type",
                BasePrice = price,
                MaxGuests = 2,
                RoomTypeFeatures = featureIds.Select(fId => new RoomTypeFeature
                {
                    RoomTypeId = roomTypeId,
                    RoomFeatureId = fId,
                    RoomFeature = new RoomFeature { Id = fId, Name = fId.ToString(), Icon = "icon" }
                }).ToList()
            },
            Hotel = new Hotel { Id = hotelId, Name = "Test Hotel", Location = "Test City" }
        };
    }

    [Fact]
    public async Task GetAllRoomsAsync_WithFeatureFilter_ReturnsOnlyMatchingRooms()
    {
        var room1 = CreateRoomWithFeatures("Pool Room", 200, _hotelId, _wifiId, _poolId);
        var room2 = CreateRoomWithFeatures("Basic Room", 100, _hotelId, _wifiId);

        _subscriptionRepo.Setup(r => r.GetActiveHotelIdsAsync())
            .ReturnsAsync(new HashSet<Guid> { _hotelId });
        _roomRepo.Setup(r => r.GetAllWithHotelAsync())
            .ReturnsAsync(new List<Room> { room1, room2 });

        // Filter by pool feature - only room1 has it
        var results = (await _sut.GetAllRoomsAsync(null, null, null, null, new List<Guid> { _poolId })).ToList();

        Assert.Single(results);
        Assert.Equal("Pool Room", results[0].Name);
    }

    [Fact]
    public async Task GetAllRoomsAsync_WithMultipleFeatureFilter_RequiresAll()
    {
        var room1 = CreateRoomWithFeatures("Pool Room", 200, _hotelId, _wifiId, _poolId);
        var room2 = CreateRoomWithFeatures("WiFi Room", 100, _hotelId, _wifiId);

        _subscriptionRepo.Setup(r => r.GetActiveHotelIdsAsync())
            .ReturnsAsync(new HashSet<Guid> { _hotelId });
        _roomRepo.Setup(r => r.GetAllWithHotelAsync())
            .ReturnsAsync(new List<Room> { room1, room2 });

        // Filter by both wifi AND pool - only room1 has both
        var results = (await _sut.GetAllRoomsAsync(null, null, null, null, new List<Guid> { _wifiId, _poolId })).ToList();

        Assert.Single(results);
        Assert.Equal("Pool Room", results[0].Name);
    }

    [Fact]
    public async Task GetAllRoomsAsync_WithNoFeatureFilter_ReturnsAll()
    {
        var room1 = CreateRoomWithFeatures("Pool Room", 200, _hotelId, _wifiId, _poolId);
        var room2 = CreateRoomWithFeatures("Basic Room", 100, _hotelId, _wifiId);

        _subscriptionRepo.Setup(r => r.GetActiveHotelIdsAsync())
            .ReturnsAsync(new HashSet<Guid> { _hotelId });
        _roomRepo.Setup(r => r.GetAllWithHotelAsync())
            .ReturnsAsync(new List<Room> { room1, room2 });

        var results = (await _sut.GetAllRoomsAsync(null, null, null, null, null)).ToList();

        Assert.Equal(2, results.Count);
    }

    [Fact]
    public async Task GetAllRoomsAsync_ResponseIncludesFeatures()
    {
        var room = CreateRoomWithFeatures("Pool Room", 200, _hotelId, _wifiId, _poolId);

        _subscriptionRepo.Setup(r => r.GetActiveHotelIdsAsync())
            .ReturnsAsync(new HashSet<Guid> { _hotelId });
        _roomRepo.Setup(r => r.GetAllWithHotelAsync())
            .ReturnsAsync(new List<Room> { room });

        var results = (await _sut.GetAllRoomsAsync(null, null, null, null, null)).ToList();

        Assert.Single(results);
        Assert.Equal(2, results[0].Features.Count);
        Assert.NotNull(results[0].RoomTypeName);
    }

    [Fact]
    public async Task GetAllRoomsAsync_CombinedFilters_PriceAndFeatures()
    {
        var room1 = CreateRoomWithFeatures("Cheap Pool", 100, _hotelId, _poolId);
        var room2 = CreateRoomWithFeatures("Expensive Pool", 500, _hotelId, _poolId);

        _subscriptionRepo.Setup(r => r.GetActiveHotelIdsAsync())
            .ReturnsAsync(new HashSet<Guid> { _hotelId });
        _roomRepo.Setup(r => r.GetAllWithHotelAsync())
            .ReturnsAsync(new List<Room> { room1, room2 });

        // Filter: pool + max price 300
        var results = (await _sut.GetAllRoomsAsync(null, 300m, null, null, new List<Guid> { _poolId })).ToList();

        Assert.Single(results);
        Assert.Equal("Cheap Pool", results[0].Name);
    }
}

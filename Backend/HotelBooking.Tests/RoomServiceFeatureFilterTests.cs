using HotelBooking.Application.DTOs.Room;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Services;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using Moq;

namespace HotelBooking.Tests;

public class RoomServiceTests
{
    private readonly Mock<IRoomRepository> _roomRepo = new();
    private readonly Mock<IRoomTypeRepository> _roomTypeRepo = new();
    private readonly Mock<ISubscriptionRepository> _subscriptionRepo = new();
    private readonly Mock<ISubscriptionPlanConfigRepository> _planConfigRepo = new();
    private readonly RoomService _sut;

    private readonly Guid _hotelId = Guid.NewGuid();
    private readonly Guid _roomTypeId = Guid.NewGuid();

    public RoomServiceTests()
    {
        _sut = new RoomService(
            _roomRepo.Object,
            _roomTypeRepo.Object,
            _subscriptionRepo.Object,
            _planConfigRepo.Object);
    }

    private RoomType CreateRoomType() => new()
    {
        Id = _roomTypeId,
        HotelId = _hotelId,
        Name = "Deluxe Suite",
        Price = 199.99m,
        MaxGuests = 2
    };

    private Subscription CreateActiveSubscription() => new()
    {
        Id = Guid.NewGuid(),
        HotelId = _hotelId,
        PlanType = SubscriptionPlan.Standard,
        IsActive = true,
        ExpiryDate = DateTime.UtcNow.AddDays(30)
    };

    [Fact]
    public async Task CreateRoomAsync_ValidRequest_ReturnsRoomResponse()
    {
        var roomType = CreateRoomType();
        _roomTypeRepo.Setup(r => r.GetByIdAsync(_roomTypeId)).ReturnsAsync(roomType);
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync(CreateActiveSubscription());
        _planConfigRepo.Setup(p => p.GetByPlanTypeAsync(SubscriptionPlan.Standard))
            .ReturnsAsync(new SubscriptionPlanConfig { PlanType = SubscriptionPlan.Standard, MaxRooms = 50 });
        _roomRepo.Setup(r => r.GetByHotelIdAsync(_hotelId)).ReturnsAsync(new List<Room>());

        var request = new CreateRoomRequest { RoomTypeId = _roomTypeId, RoomNumber = "101" };
        var result = await _sut.CreateRoomAsync(request, _hotelId);

        Assert.NotNull(result);
        Assert.Equal("101", result.RoomNumber);
        Assert.Equal("Deluxe Suite", result.RoomTypeName);
    }

    [Fact]
    public async Task CreateRoomAsync_NoSubscription_Throws()
    {
        _roomTypeRepo.Setup(r => r.GetByIdAsync(_roomTypeId)).ReturnsAsync(CreateRoomType());
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync((Subscription?)null);

        var request = new CreateRoomRequest { RoomTypeId = _roomTypeId, RoomNumber = "101" };

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.CreateRoomAsync(request, _hotelId));
    }

    [Fact]
    public async Task CreateRoomAsync_WrongHotel_ThrowsUnauthorized()
    {
        var roomType = CreateRoomType();
        roomType.HotelId = Guid.NewGuid(); // different hotel
        _roomTypeRepo.Setup(r => r.GetByIdAsync(_roomTypeId)).ReturnsAsync(roomType);

        var request = new CreateRoomRequest { RoomTypeId = _roomTypeId, RoomNumber = "101" };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.CreateRoomAsync(request, _hotelId));
    }

    [Fact]
    public async Task GetRoomsByRoomTypeAsync_ReturnsMappedRooms()
    {
        var rooms = new List<Room>
        {
            new() { Id = Guid.NewGuid(), RoomTypeId = _roomTypeId, RoomNumber = "101",
                     RoomType = new RoomType { Id = _roomTypeId, Name = "Suite", HotelId = _hotelId, Price = 100, MaxGuests = 2 } },
            new() { Id = Guid.NewGuid(), RoomTypeId = _roomTypeId, RoomNumber = "102",
                     RoomType = new RoomType { Id = _roomTypeId, Name = "Suite", HotelId = _hotelId, Price = 100, MaxGuests = 2 } }
        };
        _roomRepo.Setup(r => r.GetByRoomTypeIdAsync(_roomTypeId)).ReturnsAsync(rooms);

        var results = (await _sut.GetRoomsByRoomTypeAsync(_roomTypeId)).ToList();

        Assert.Equal(2, results.Count);
        Assert.Equal("101", results[0].RoomNumber);
        Assert.Equal("102", results[1].RoomNumber);
    }
}

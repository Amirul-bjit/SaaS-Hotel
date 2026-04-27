using HotelBooking.Application.DTOs.Booking;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Services;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using Moq;

namespace HotelBooking.Tests;

public class BookingServiceTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Mock<IRoomTypeRepository> _roomTypeRepo = new();
    private readonly Mock<IRoomRepository> _roomRepo = new();
    private readonly Mock<ISubscriptionRepository> _subscriptionRepo = new();
    private readonly BookingService _sut;

    private readonly Guid _hotelId = Guid.NewGuid();
    private readonly Guid _roomTypeId = Guid.NewGuid();
    private readonly Guid _roomId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();

    public BookingServiceTests()
    {
        _sut = new BookingService(
            _bookingRepo.Object,
            _roomTypeRepo.Object,
            _roomRepo.Object,
            _subscriptionRepo.Object);
    }

    private RoomType CreateRoomType() => new()
    {
        Id = _roomTypeId,
        HotelId = _hotelId,
        Name = "Deluxe Suite",
        Price = 199.99m,
        MaxGuests = 2
    };

    private Room CreateRoom() => new()
    {
        Id = _roomId,
        RoomTypeId = _roomTypeId,
        RoomNumber = "101"
    };

    private Subscription CreateActiveSubscription() => new()
    {
        Id = Guid.NewGuid(),
        HotelId = _hotelId,
        PlanType = SubscriptionPlan.Standard,
        BillingCycle = BillingCycle.Monthly,
        StartDate = DateTime.UtcNow.AddDays(-10),
        ExpiryDate = DateTime.UtcNow.AddDays(20),
        IsActive = true
    };

    private CreateBookingRequest CreateValidRequest() => new()
    {
        RoomTypeId = _roomTypeId,
        CheckIn = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
        CheckOut = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3))
    };

    private void SetupRoomTypeAndRooms()
    {
        _roomTypeRepo.Setup(r => r.GetByIdAsync(_roomTypeId)).ReturnsAsync(CreateRoomType());
        _roomRepo.Setup(r => r.GetByRoomTypeIdAsync(_roomTypeId)).ReturnsAsync(new List<Room> { CreateRoom() });
        _bookingRepo.Setup(b => b.GetBookedRoomIdsAsync(It.IsAny<List<Guid>>(), It.IsAny<DateOnly>(), It.IsAny<DateOnly>()))
            .ReturnsAsync(new HashSet<Guid>());
    }

    [Fact]
    public async Task CreateBooking_NoSubscription_ThrowsInvalidOperation()
    {
        SetupRoomTypeAndRooms();
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync((Subscription?)null);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.CreateBookingAsync(CreateValidRequest(), _userId, null));

        Assert.Contains("does not have a subscription", ex.Message);
    }

    [Fact]
    public async Task CreateBooking_InactiveSubscription_ThrowsInvalidOperation()
    {
        SetupRoomTypeAndRooms();
        var sub = CreateActiveSubscription();
        sub.IsActive = false;
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync(sub);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.CreateBookingAsync(CreateValidRequest(), _userId, null));

        Assert.Contains("subscription is inactive", ex.Message);
    }

    [Fact]
    public async Task CreateBooking_ExpiredSubscription_ThrowsInvalidOperation()
    {
        SetupRoomTypeAndRooms();
        var sub = CreateActiveSubscription();
        sub.ExpiryDate = DateTime.UtcNow.AddDays(-10);
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync(sub);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.CreateBookingAsync(CreateValidRequest(), _userId, null));

        Assert.Contains("subscription has expired", ex.Message);
    }

    [Fact]
    public async Task CreateBooking_ActiveSubscription_Succeeds()
    {
        SetupRoomTypeAndRooms();
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync(CreateActiveSubscription());

        var result = await _sut.CreateBookingAsync(CreateValidRequest(), _userId, null);

        Assert.NotNull(result);
        Assert.Equal(BookingStatus.Confirmed, result.Status);
        _bookingRepo.Verify(b => b.AddAsync(It.IsAny<Booking>()), Times.Once);
        _bookingRepo.Verify(b => b.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateBooking_NoFreeRooms_ThrowsInvalidOperation()
    {
        _roomTypeRepo.Setup(r => r.GetByIdAsync(_roomTypeId)).ReturnsAsync(CreateRoomType());
        _roomRepo.Setup(r => r.GetByRoomTypeIdAsync(_roomTypeId)).ReturnsAsync(new List<Room> { CreateRoom() });
        _bookingRepo.Setup(b => b.GetBookedRoomIdsAsync(It.IsAny<List<Guid>>(), It.IsAny<DateOnly>(), It.IsAny<DateOnly>()))
            .ReturnsAsync(new HashSet<Guid> { _roomId }); // all rooms booked
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync(CreateActiveSubscription());

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.CreateBookingAsync(CreateValidRequest(), _userId, null));

        Assert.Contains("No rooms available", ex.Message);
    }

    [Fact]
    public async Task CreateBooking_HotelOwner_InactiveSubscription_ThrowsInvalidOperation()
    {
        SetupRoomTypeAndRooms();
        var sub = CreateActiveSubscription();
        sub.IsActive = false;
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync(sub);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.CreateBookingAsync(CreateValidRequest(), _userId, _hotelId));

        Assert.Contains("subscription is inactive", ex.Message);
    }
}

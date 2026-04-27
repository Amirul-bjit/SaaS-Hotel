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
    private readonly Mock<IRoomRepository> _roomRepo = new();
    private readonly Mock<IInventoryRepository> _inventoryRepo = new();
    private readonly Mock<ISubscriptionRepository> _subscriptionRepo = new();
    private readonly BookingService _sut;

    private readonly Guid _hotelId = Guid.NewGuid();
    private readonly Guid _roomId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();

    public BookingServiceTests()
    {
        _sut = new BookingService(
            _bookingRepo.Object,
            _roomRepo.Object,
            _inventoryRepo.Object,
            _subscriptionRepo.Object);
    }

    private Room CreateRoom() => new()
    {
        Id = _roomId,
        HotelId = _hotelId,
        Name = "Deluxe",
        Price = 100,
        TotalRooms = 5,
        MaxGuests = 2
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
        RoomId = _roomId,
        CheckIn = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
        CheckOut = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3))
    };

    private void SetupRoomAndInventory()
    {
        _roomRepo.Setup(r => r.GetByIdAsync(_roomId)).ReturnsAsync(CreateRoom());
        _inventoryRepo.Setup(i => i.GetByRoomAndDateAsync(_roomId, It.IsAny<DateOnly>()))
            .ReturnsAsync(new Inventory { Id = Guid.NewGuid(), RoomId = _roomId, Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)), AvailableCount = 3 });
    }

    // --- Subscription enforcement tests ---

    [Fact]
    public async Task CreateBooking_NoSubscription_ThrowsInvalidOperation()
    {
        SetupRoomAndInventory();
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync((Subscription?)null);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.CreateBookingAsync(CreateValidRequest(), _userId, null));

        Assert.Contains("does not have a subscription", ex.Message);
    }

    [Fact]
    public async Task CreateBooking_InactiveSubscription_ThrowsInvalidOperation()
    {
        SetupRoomAndInventory();
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
        SetupRoomAndInventory();
        var sub = CreateActiveSubscription();
        sub.ExpiryDate = DateTime.UtcNow.AddDays(-1); // expired yesterday
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync(sub);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.CreateBookingAsync(CreateValidRequest(), _userId, null));

        Assert.Contains("subscription has expired", ex.Message);
    }

    [Fact]
    public async Task CreateBooking_ActiveSubscription_Succeeds()
    {
        SetupRoomAndInventory();
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync(CreateActiveSubscription());

        var result = await _sut.CreateBookingAsync(CreateValidRequest(), _userId, null);

        Assert.NotNull(result);
        Assert.Equal(BookingStatus.Confirmed, result.Status);
        _bookingRepo.Verify(b => b.AddAsync(It.IsAny<Booking>()), Times.Once);
        _bookingRepo.Verify(b => b.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateBooking_HotelOwner_InactiveSubscription_ThrowsInvalidOperation()
    {
        SetupRoomAndInventory();
        var sub = CreateActiveSubscription();
        sub.IsActive = false;
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync(sub);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.CreateBookingAsync(CreateValidRequest(), _userId, _hotelId));

        Assert.Contains("subscription is inactive", ex.Message);
    }

    [Fact]
    public async Task CreateBooking_HotelOwner_ExpiredSubscription_ThrowsInvalidOperation()
    {
        SetupRoomAndInventory();
        var sub = CreateActiveSubscription();
        sub.ExpiryDate = DateTime.UtcNow.AddDays(-5);
        _subscriptionRepo.Setup(s => s.GetByHotelIdAsync(_hotelId)).ReturnsAsync(sub);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.CreateBookingAsync(CreateValidRequest(), _userId, _hotelId));

        Assert.Contains("subscription has expired", ex.Message);
    }
}

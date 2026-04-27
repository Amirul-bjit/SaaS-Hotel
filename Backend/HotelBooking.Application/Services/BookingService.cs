using HotelBooking.Application.DTOs.Booking;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IInventoryRepository _inventoryRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;

    public BookingService(
        IBookingRepository bookingRepository,
        IRoomRepository roomRepository,
        IInventoryRepository inventoryRepository,
        ISubscriptionRepository subscriptionRepository)
    {
        _bookingRepository = bookingRepository;
        _roomRepository = roomRepository;
        _inventoryRepository = inventoryRepository;
        _subscriptionRepository = subscriptionRepository;
    }

    public async Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request, Guid userId, Guid? hotelId)
    {
        // 1. Validate date range
        if (request.CheckIn >= request.CheckOut)
            throw new ArgumentException("CheckOut must be after CheckIn.");

        if (request.CheckIn < DateOnly.FromDateTime(DateTime.UtcNow))
            throw new ArgumentException("CheckIn cannot be in the past.");

        // 2. Resolve and validate room
        var room = await _roomRepository.GetByIdAsync(request.RoomId)
            ?? throw new KeyNotFoundException("Room not found.");

        // If hotelId is present in JWT (HOTEL_OWNER), enforce ownership.
        // If null (CUSTOMER), derive hotelId from the room.
        if (hotelId.HasValue && room.HotelId != hotelId.Value)
            throw new UnauthorizedAccessException("Room does not belong to your hotel.");

        var resolvedHotelId = hotelId ?? room.HotelId;

        // 3. Subscription validation — block bookings for hotels without active subscription
        var subscription = await _subscriptionRepository.GetByHotelIdAsync(resolvedHotelId);
        if (subscription == null)
            throw new InvalidOperationException("This hotel does not have a subscription. Bookings are unavailable.");
        if (!subscription.IsActive)
            throw new InvalidOperationException("This hotel's subscription is inactive. Bookings are temporarily unavailable.");
        if (subscription.ExpiryDate.AddDays(7) < DateTime.UtcNow)
            throw new InvalidOperationException("This hotel's subscription has expired and the grace period has ended. Bookings are temporarily unavailable.");

        // 4. Check inventory for each date in range
        var dates = GetDateRange(request.CheckIn, request.CheckOut).ToList();
        var inventories = new List<Inventory>();

        foreach (var date in dates)
        {
            var inv = await _inventoryRepository.GetByRoomAndDateAsync(request.RoomId, date)
                ?? throw new InvalidOperationException($"No inventory found for date {date}.");

            if (inv.AvailableCount <= 0)
                throw new InvalidOperationException($"Room not available on {date}.");

            inventories.Add(inv);
        }

        // 4. Decrement inventory and create booking atomically
        // (transaction is managed at Infrastructure/DbContext level via UoW SaveChanges)
        foreach (var inv in inventories)
            inv.AvailableCount--;

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            HotelId = resolvedHotelId,
            RoomId = request.RoomId,
            CheckIn = request.CheckIn,
            CheckOut = request.CheckOut,
            Status = BookingStatus.Confirmed
        };

        await _bookingRepository.AddAsync(booking);
        await _bookingRepository.SaveChangesAsync();

        return MapToResponse(booking);
    }

    public async Task<IEnumerable<BookingResponse>> GetBookingsAsync(Guid userId, Guid? hotelId, UserRole role)
    {
        IEnumerable<Booking> bookings = role switch
        {
            UserRole.CUSTOMER => await _bookingRepository.GetByUserIdAsync(userId),
            UserRole.HOTEL_OWNER => hotelId.HasValue
                ? await _bookingRepository.GetByHotelIdAsync(hotelId.Value)
                : Enumerable.Empty<Booking>(),
            UserRole.SUPER_ADMIN => await _bookingRepository.GetAllAsync(),
            _ => throw new UnauthorizedAccessException("Unknown role.")
        };

        return bookings.Select(MapToResponse);
    }

    private static IEnumerable<DateOnly> GetDateRange(DateOnly start, DateOnly end)
    {
        for (var d = start; d < end; d = d.AddDays(1))
            yield return d;
    }

    private static BookingResponse MapToResponse(Booking b) =>
        new()
        {
            Id = b.Id, UserId = b.UserId, HotelId = b.HotelId, RoomId = b.RoomId,
            CheckIn = b.CheckIn, CheckOut = b.CheckOut, Status = b.Status
        };
}

using HotelBooking.Application.DTOs.Booking;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomTypeRepository _roomTypeRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;

    public BookingService(
        IBookingRepository bookingRepository,
        IRoomTypeRepository roomTypeRepository,
        IRoomRepository roomRepository,
        ISubscriptionRepository subscriptionRepository)
    {
        _bookingRepository = bookingRepository;
        _roomTypeRepository = roomTypeRepository;
        _roomRepository = roomRepository;
        _subscriptionRepository = subscriptionRepository;
    }

    public async Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request, Guid userId, Guid? hotelId)
    {
        // 1. Validate date range
        if (request.CheckIn >= request.CheckOut)
            throw new ArgumentException("CheckOut must be after CheckIn.");

        if (request.CheckIn < DateOnly.FromDateTime(DateTime.UtcNow))
            throw new ArgumentException("CheckIn cannot be in the past.");

        // 2. Resolve RoomType
        var roomType = await _roomTypeRepository.GetByIdAsync(request.RoomTypeId)
            ?? throw new KeyNotFoundException("Room type not found.");

        var resolvedHotelId = roomType.HotelId;

        // If hotelId is present in JWT (HOTEL_OWNER), enforce ownership
        if (hotelId.HasValue && resolvedHotelId != hotelId.Value)
            throw new UnauthorizedAccessException("Room type does not belong to your hotel.");

        // 3. Subscription validation
        var subscription = await _subscriptionRepository.GetByHotelIdAsync(resolvedHotelId);
        if (subscription == null)
            throw new InvalidOperationException("This hotel does not have a subscription. Bookings are unavailable.");
        if (!subscription.IsActive)
            throw new InvalidOperationException("This hotel's subscription is inactive. Bookings are temporarily unavailable.");
        if (subscription.ExpiryDate.AddDays(7) < DateTime.UtcNow)
            throw new InvalidOperationException("This hotel's subscription has expired. Bookings are temporarily unavailable.");

        // 4. Find a free room for the requested dates
        var rooms = (await _roomRepository.GetByRoomTypeIdAsync(request.RoomTypeId)).ToList();
        if (rooms.Count == 0)
            throw new InvalidOperationException("No rooms available for this room type.");

        var roomIds = rooms.Select(r => r.Id).ToList();
        var bookedRoomIds = await _bookingRepository.GetBookedRoomIdsAsync(roomIds, request.CheckIn, request.CheckOut);

        var freeRoom = rooms.FirstOrDefault(r => !bookedRoomIds.Contains(r.Id))
            ?? throw new InvalidOperationException($"No rooms available for the selected dates ({request.CheckIn} to {request.CheckOut}).");

        // 5. Create booking with assigned room
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            HotelId = resolvedHotelId,
            RoomTypeId = request.RoomTypeId,
            RoomId = freeRoom.Id,
            CheckIn = request.CheckIn,
            CheckOut = request.CheckOut,
            Status = BookingStatus.Confirmed
        };

        await _bookingRepository.AddAsync(booking);
        await _bookingRepository.SaveChangesAsync();

        return MapToResponse(booking, roomType.Name, freeRoom.RoomNumber);
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

        return bookings.Select(b => MapToResponse(b,
            b.RoomType?.Name ?? string.Empty,
            b.Room?.RoomNumber ?? string.Empty));
    }

    private static BookingResponse MapToResponse(Booking b, string roomTypeName, string roomNumber) =>
        new()
        {
            Id = b.Id,
            UserId = b.UserId,
            HotelId = b.HotelId,
            RoomTypeId = b.RoomTypeId,
            RoomTypeName = roomTypeName,
            RoomId = b.RoomId,
            RoomNumber = roomNumber,
            CheckIn = b.CheckIn,
            CheckOut = b.CheckOut,
            Status = b.Status
        };
}

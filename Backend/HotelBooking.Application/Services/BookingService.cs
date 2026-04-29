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

    // Valid state transitions: from → allowed destinations
    private static readonly Dictionary<BookingStatus, HashSet<BookingStatus>> ValidTransitions = new()
    {
        [BookingStatus.Pending] = new() { BookingStatus.Confirmed, BookingStatus.Cancelled },
        [BookingStatus.Confirmed] = new() { BookingStatus.CheckedIn, BookingStatus.Cancelled, BookingStatus.NoShow },
        [BookingStatus.CheckedIn] = new() { BookingStatus.CheckedOut },
        [BookingStatus.CheckedOut] = new() { BookingStatus.Completed },
        [BookingStatus.Completed] = new(),
        [BookingStatus.Cancelled] = new(),
        [BookingStatus.NoShow] = new(),
    };

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

        // 4. Use transaction to prevent double-booking
        await _bookingRepository.BeginTransactionAsync();
        try
        {
            var rooms = (await _roomRepository.GetByRoomTypeIdAsync(request.RoomTypeId)).ToList();
            if (rooms.Count == 0)
                throw new InvalidOperationException("No rooms available for this room type.");

            var roomIds = rooms.Select(r => r.Id).ToList();
            var bookedRoomIds = await _bookingRepository.GetBookedRoomIdsAsync(roomIds, request.CheckIn, request.CheckOut);

            var freeRoom = rooms.FirstOrDefault(r => !bookedRoomIds.Contains(r.Id))
                ?? throw new InvalidOperationException($"No rooms available for the selected dates ({request.CheckIn} to {request.CheckOut}).");

            // 5. Create booking as Pending (not auto-confirmed)
            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                HotelId = resolvedHotelId,
                RoomTypeId = request.RoomTypeId,
                RoomId = freeRoom.Id,
                CheckIn = request.CheckIn,
                CheckOut = request.CheckOut,
                Status = BookingStatus.Pending
            };

            await _bookingRepository.AddAsync(booking);
            await _bookingRepository.SaveChangesAsync();
            await _bookingRepository.CommitTransactionAsync();

            // Attach nav properties for response mapping
            booking.RoomType = roomType;
            booking.Room = freeRoom;

            return MapToResponse(booking, roomType.Name, freeRoom.RoomNumber);
        }
        catch
        {
            await _bookingRepository.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<BookingResponse> UpdateBookingStatusAsync(
        Guid bookingId, BookingStatus newStatus, Guid userId, Guid? hotelId, UserRole role)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId)
            ?? throw new KeyNotFoundException("Booking not found.");

        // Authorization: customers can only cancel their own bookings
        if (role == UserRole.CUSTOMER)
        {
            if (booking.UserId != userId)
                throw new UnauthorizedAccessException("You can only manage your own bookings.");
            if (newStatus != BookingStatus.Cancelled)
                throw new UnauthorizedAccessException("Customers can only cancel bookings.");
        }

        // Authorization: hotel owners can only manage their hotel's bookings
        if (role == UserRole.HOTEL_OWNER && hotelId.HasValue && booking.HotelId != hotelId.Value)
            throw new UnauthorizedAccessException("This booking does not belong to your hotel.");

        // Validate state transition
        if (!ValidTransitions.TryGetValue(booking.Status, out var allowed) || !allowed.Contains(newStatus))
            throw new InvalidOperationException(
                $"Cannot transition from '{booking.Status}' to '{newStatus}'.");

        booking.Status = newStatus;
        _bookingRepository.Update(booking);
        await _bookingRepository.SaveChangesAsync();

        return MapToResponse(booking,
            booking.RoomType?.Name ?? string.Empty,
            booking.Room?.RoomNumber ?? string.Empty);
    }

    public Task<BookingResponse> CancelBookingAsync(Guid bookingId, Guid userId, Guid? hotelId, UserRole role)
        => UpdateBookingStatusAsync(bookingId, BookingStatus.Cancelled, userId, hotelId, role);

    public Task<BookingResponse> ConfirmBookingAsync(Guid bookingId, Guid userId, Guid? hotelId, UserRole role)
        => UpdateBookingStatusAsync(bookingId, BookingStatus.Confirmed, userId, hotelId, role);

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
            HotelName = b.Hotel?.Name ?? string.Empty,
            HotelLocation = b.Hotel?.Location ?? string.Empty,
            RoomTypeId = b.RoomTypeId,
            RoomTypeName = roomTypeName,
            RoomId = b.RoomId,
            RoomNumber = roomNumber,
            PricePerNight = b.RoomType?.Price ?? 0,
            CheckIn = b.CheckIn,
            CheckOut = b.CheckOut,
            Status = b.Status
        };
}

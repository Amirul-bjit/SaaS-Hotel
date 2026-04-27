using HotelBooking.Application.DTOs.Room;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Services;

public class RoomService : IRoomService
{
    private readonly IRoomRepository _roomRepository;
    private readonly IRoomTypeRepository _roomTypeRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly ISubscriptionPlanConfigRepository _planConfigRepository;

    public RoomService(
        IRoomRepository roomRepository,
        IRoomTypeRepository roomTypeRepository,
        ISubscriptionRepository subscriptionRepository,
        ISubscriptionPlanConfigRepository planConfigRepository)
    {
        _roomRepository = roomRepository;
        _roomTypeRepository = roomTypeRepository;
        _subscriptionRepository = subscriptionRepository;
        _planConfigRepository = planConfigRepository;
    }

    public async Task<RoomResponse> CreateRoomAsync(CreateRoomRequest request, Guid hotelId)
    {
        // 1. Validate RoomType belongs to the hotel
        var roomType = await _roomTypeRepository.GetByIdAsync(request.RoomTypeId)
            ?? throw new InvalidOperationException("Room type not found.");
        if (roomType.HotelId != hotelId)
            throw new UnauthorizedAccessException("Room type does not belong to your hotel.");

        // 2. Subscription validation
        var subscription = await _subscriptionRepository.GetByHotelIdAsync(hotelId);
        if (subscription == null)
            throw new InvalidOperationException("Hotel does not have a subscription.");
        if (!subscription.IsActive)
            throw new InvalidOperationException("Hotel subscription is inactive.");
        if (subscription.ExpiryDate.AddDays(7) < DateTime.UtcNow)
            throw new InvalidOperationException("Hotel subscription has expired.");

        // 3. Max rooms enforcement
        var planConfig = await _planConfigRepository.GetByPlanTypeAsync(subscription.PlanType);
        if (planConfig?.MaxRooms != null)
        {
            var allRooms = await _roomRepository.GetByHotelIdAsync(hotelId);
            var currentTotal = allRooms.Count();
            if (currentTotal + 1 > planConfig.MaxRooms.Value)
                throw new InvalidOperationException(
                    $"Cannot add room. Your {subscription.PlanType} plan allows a maximum of {planConfig.MaxRooms} rooms. Currently used: {currentTotal}.");
        }

        // 4. Duplicate room number check within hotel
        var existingRooms = await _roomRepository.GetByHotelIdAsync(hotelId);
        if (existingRooms.Any(r => r.RoomNumber.Equals(request.RoomNumber, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException($"Room number '{request.RoomNumber}' already exists in this hotel.");

        var room = new Room
        {
            Id = Guid.NewGuid(),
            RoomTypeId = request.RoomTypeId,
            RoomNumber = request.RoomNumber
        };

        await _roomRepository.AddAsync(room);
        await _roomRepository.SaveChangesAsync();

        return MapToResponse(room, roomType.Name);
    }

    public async Task DeleteRoomAsync(Guid roomId, Guid hotelId)
    {
        var room = await _roomRepository.GetByIdAsync(roomId)
            ?? throw new InvalidOperationException("Room not found.");
        if (room.RoomType.HotelId != hotelId)
            throw new UnauthorizedAccessException("Room does not belong to your hotel.");

        _roomRepository.Delete(room);
        await _roomRepository.SaveChangesAsync();
    }

    public async Task<IEnumerable<RoomResponse>> GetRoomsByHotelAsync(Guid hotelId)
    {
        var rooms = await _roomRepository.GetByHotelIdAsync(hotelId);
        return rooms.Select(r => MapToResponse(r, r.RoomType?.Name ?? string.Empty));
    }

    public async Task<IEnumerable<RoomResponse>> GetRoomsByRoomTypeAsync(Guid roomTypeId)
    {
        var rooms = await _roomRepository.GetByRoomTypeIdAsync(roomTypeId);
        return rooms.Select(r => MapToResponse(r, r.RoomType?.Name ?? string.Empty));
    }

    private static RoomResponse MapToResponse(Room room, string roomTypeName) =>
        new()
        {
            Id = room.Id,
            RoomTypeId = room.RoomTypeId,
            RoomTypeName = roomTypeName,
            RoomNumber = room.RoomNumber
        };
}


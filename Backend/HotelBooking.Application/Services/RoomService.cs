using HotelBooking.Application.DTOs.Room;
using HotelBooking.Application.DTOs.RoomType;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Services;

public class RoomService : IRoomService
{
    private readonly IRoomRepository _roomRepository;
    private readonly IInventoryRepository _inventoryRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly ISubscriptionPlanConfigRepository _planConfigRepository;

    public RoomService(
        IRoomRepository roomRepository,
        IInventoryRepository inventoryRepository,
        ISubscriptionRepository subscriptionRepository,
        ISubscriptionPlanConfigRepository planConfigRepository)
    {
        _roomRepository = roomRepository;
        _inventoryRepository = inventoryRepository;
        _subscriptionRepository = subscriptionRepository;
        _planConfigRepository = planConfigRepository;
    }

    public async Task<RoomResponse> CreateRoomAsync(CreateRoomRequest request, Guid hotelId)
    {
        // 1. Subscription validation
        var subscription = await _subscriptionRepository.GetByHotelIdAsync(hotelId);
        if (subscription == null)
            throw new InvalidOperationException("Hotel does not have a subscription. A valid subscription is required to create rooms.");
        if (!subscription.IsActive)
            throw new InvalidOperationException("Hotel subscription is inactive. Please reactivate your subscription to create rooms.");
        if (subscription.ExpiryDate.AddDays(7) < DateTime.UtcNow)
            throw new InvalidOperationException("Hotel subscription has expired and the grace period has ended. Please renew your subscription to create rooms.");

        // 2. Duplicate room name check
        var existingRooms = (await _roomRepository.GetByHotelIdAsync(hotelId)).ToList();
        if (existingRooms.Any(r => r.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException($"A room named '{request.Name}' already exists in this hotel.");

        // 3. Max rooms enforcement per subscription plan
        var planConfig = await _planConfigRepository.GetByPlanTypeAsync(subscription.PlanType);
        if (planConfig?.MaxRooms != null)
        {
            var currentTotal = existingRooms.Sum(r => r.TotalRooms);
            if (currentTotal + request.TotalRooms > planConfig.MaxRooms.Value)
                throw new InvalidOperationException(
                    $"Cannot add {request.TotalRooms} room(s). Your {subscription.PlanType} plan allows a maximum of {planConfig.MaxRooms} total rooms. Currently used: {currentTotal}.");
        }

        var room = new Room
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            Name = request.Name,
            Price = request.Price,
            TotalRooms = request.TotalRooms,
            MaxGuests = request.MaxGuests,
            RoomTypeId = request.RoomTypeId
        };

        await _roomRepository.AddAsync(room);
        await _roomRepository.SaveChangesAsync();

        // Auto-generate inventory for next 30 days
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var inventories = Enumerable.Range(0, 30)
            .Select(i => new Inventory
            {
                Id = Guid.NewGuid(),
                RoomId = room.Id,
                Date = today.AddDays(i),
                AvailableCount = room.TotalRooms
            }).ToList();

        await _inventoryRepository.AddRangeAsync(inventories);
        await _inventoryRepository.SaveChangesAsync();

        return MapToResponse(room);
    }

    public async Task<IEnumerable<RoomResponse>> GetRoomsByHotelAsync(Guid hotelId)
    {
        var rooms = await _roomRepository.GetByHotelIdAsync(hotelId);
        return rooms.Select(MapToResponse);
    }

    public async Task<IEnumerable<RoomGlobalResponse>> GetAllRoomsAsync(
        decimal? minPrice, decimal? maxPrice, int? minGuests, string? location, List<Guid>? featureIds)
    {
        var activeHotelIds = await _subscriptionRepository.GetActiveHotelIdsAsync();
        var rooms = await _roomRepository.GetAllWithHotelAsync();

        IEnumerable<Room> filtered = rooms.Where(r => activeHotelIds.Contains(r.HotelId));
        if (minPrice.HasValue)
            filtered = filtered.Where(r => r.Price >= minPrice.Value);
        if (maxPrice.HasValue)
            filtered = filtered.Where(r => r.Price <= maxPrice.Value);
        if (minGuests.HasValue)
            filtered = filtered.Where(r => r.MaxGuests >= minGuests.Value);
        if (!string.IsNullOrWhiteSpace(location))
            filtered = filtered.Where(r =>
                r.Hotel.Location.Contains(location, StringComparison.OrdinalIgnoreCase));
        if (featureIds != null && featureIds.Count > 0)
            filtered = filtered.Where(r =>
                r.RoomType?.RoomTypeFeatures != null &&
                featureIds.All(fId => r.RoomType.RoomTypeFeatures.Any(rtf => rtf.RoomFeatureId == fId)));

        return filtered.Select(MapToGlobalResponse);
    }

    public async Task<RoomGlobalResponse?> GetRoomByIdAsync(Guid id)
    {
        var room = await _roomRepository.GetByIdWithHotelAsync(id);
        if (room == null) return null;

        var subscription = await _subscriptionRepository.GetByHotelIdAsync(room.HotelId);
        if (subscription == null || !subscription.IsActive || subscription.ExpiryDate.AddDays(7) < DateTime.UtcNow)
            return null;

        return MapToGlobalResponse(room);
    }

    private static RoomResponse MapToResponse(Room room) =>
        new()
        {
            Id = room.Id,
            HotelId = room.HotelId,
            Name = room.Name,
            Price = room.Price,
            TotalRooms = room.TotalRooms,
            MaxGuests = room.MaxGuests,
            RoomTypeId = room.RoomTypeId,
            RoomTypeName = room.RoomType?.Name,
            Features = room.RoomType?.RoomTypeFeatures?.Select(rtf => new RoomFeatureDto
            {
                Id = rtf.RoomFeature?.Id ?? rtf.RoomFeatureId,
                Name = rtf.RoomFeature?.Name ?? string.Empty,
                Icon = rtf.RoomFeature?.Icon ?? string.Empty
            }).ToList() ?? new()
        };

    private static RoomGlobalResponse MapToGlobalResponse(Room room) =>
        new()
        {
            Id = room.Id,
            HotelId = room.HotelId,
            HotelName = room.Hotel?.Name ?? string.Empty,
            HotelLocation = room.Hotel?.Location ?? string.Empty,
            Name = room.Name,
            Price = room.Price,
            TotalRooms = room.TotalRooms,
            MaxGuests = room.MaxGuests,
            RoomTypeName = room.RoomType?.Name,
            Features = room.RoomType?.RoomTypeFeatures?.Select(rtf => new RoomFeatureDto
            {
                Id = rtf.RoomFeature?.Id ?? rtf.RoomFeatureId,
                Name = rtf.RoomFeature?.Name ?? string.Empty,
                Icon = rtf.RoomFeature?.Icon ?? string.Empty
            }).ToList() ?? new()
        };
}


using HotelBooking.Application.DTOs.RoomType;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Services;

public class RoomTypeService : IRoomTypeService
{
    private readonly IRoomTypeRepository _roomTypeRepo;
    private readonly IRoomFeatureRepository _featureRepo;
    private readonly ISubscriptionRepository _subscriptionRepo;

    public RoomTypeService(
        IRoomTypeRepository roomTypeRepo,
        IRoomFeatureRepository featureRepo,
        ISubscriptionRepository subscriptionRepo)
    {
        _roomTypeRepo = roomTypeRepo;
        _featureRepo = featureRepo;
        _subscriptionRepo = subscriptionRepo;
    }

    public async Task<RoomTypeResponse> CreateAsync(CreateRoomTypeRequest request, Guid hotelId)
    {
        var roomType = new RoomType
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            MaxGuests = request.MaxGuests
        };

        if (request.FeatureIds.Count > 0)
        {
            var features = await _featureRepo.GetByIdsAsync(request.FeatureIds);
            roomType.RoomTypeFeatures = features.Select(f => new RoomTypeFeature
            {
                RoomTypeId = roomType.Id,
                RoomFeatureId = f.Id
            }).ToList();
        }

        await _roomTypeRepo.AddAsync(roomType);
        await _roomTypeRepo.SaveChangesAsync();

        return await GetByIdAsync(roomType.Id) ?? MapToResponse(roomType);
    }

    public async Task<RoomTypeResponse> UpdateAsync(Guid id, UpdateRoomTypeRequest request, Guid hotelId)
    {
        var roomType = await _roomTypeRepo.GetByIdWithFeaturesAsync(id)
            ?? throw new InvalidOperationException("Room type not found.");

        if (roomType.HotelId != hotelId)
            throw new UnauthorizedAccessException("Cannot modify room types for a different hotel.");

        roomType.Name = request.Name;
        roomType.Description = request.Description;
        roomType.Price = request.Price;
        roomType.MaxGuests = request.MaxGuests;

        // Replace features
        roomType.RoomTypeFeatures.Clear();
        if (request.FeatureIds.Count > 0)
        {
            var features = await _featureRepo.GetByIdsAsync(request.FeatureIds);
            foreach (var f in features)
            {
                roomType.RoomTypeFeatures.Add(new RoomTypeFeature
                {
                    RoomTypeId = roomType.Id,
                    RoomFeatureId = f.Id
                });
            }
        }

        _roomTypeRepo.Update(roomType);
        await _roomTypeRepo.SaveChangesAsync();

        return await GetByIdAsync(roomType.Id) ?? MapToResponse(roomType);
    }

    public async Task DeleteAsync(Guid id, Guid hotelId)
    {
        var roomType = await _roomTypeRepo.GetByIdAsync(id)
            ?? throw new InvalidOperationException("Room type not found.");

        if (roomType.HotelId != hotelId)
            throw new UnauthorizedAccessException("Cannot delete room types for a different hotel.");

        _roomTypeRepo.Delete(roomType);
        await _roomTypeRepo.SaveChangesAsync();
    }

    public async Task<IEnumerable<RoomTypeResponse>> GetByHotelAsync(Guid hotelId)
    {
        var roomTypes = await _roomTypeRepo.GetByHotelIdAsync(hotelId);
        return roomTypes.Select(MapToResponse);
    }

    public async Task<RoomTypeResponse?> GetByIdAsync(Guid id)
    {
        var roomType = await _roomTypeRepo.GetByIdWithFeaturesAsync(id);
        return roomType == null ? null : MapToResponse(roomType);
    }

    // --- Marketplace ---

    public async Task<IEnumerable<RoomTypeGlobalResponse>> GetAllForMarketplaceAsync(
        decimal? minPrice, decimal? maxPrice, int? minGuests, string? location,
        List<Guid>? featureIds, DateOnly? checkIn, DateOnly? checkOut)
    {
        var activeHotelIds = await _subscriptionRepo.GetActiveHotelIdsAsync();
        var allRoomTypes = await _roomTypeRepo.GetAllWithHotelAndRoomsAsync();

        IEnumerable<RoomType> filtered = allRoomTypes.Where(rt => rt.Hotel.IsActive && activeHotelIds.Contains(rt.HotelId));

        // Only show room types that have at least one physical room
        filtered = filtered.Where(rt => rt.Rooms.Any());

        if (minPrice.HasValue)
            filtered = filtered.Where(rt => rt.Price >= minPrice.Value);
        if (maxPrice.HasValue)
            filtered = filtered.Where(rt => rt.Price <= maxPrice.Value);
        if (minGuests.HasValue)
            filtered = filtered.Where(rt => rt.MaxGuests >= minGuests.Value);
        if (!string.IsNullOrWhiteSpace(location))
            filtered = filtered.Where(rt =>
                rt.Hotel.Location.Contains(location, StringComparison.OrdinalIgnoreCase));
        if (featureIds != null && featureIds.Count > 0)
            filtered = filtered.Where(rt =>
                rt.RoomTypeFeatures != null &&
                featureIds.All(fId => rt.RoomTypeFeatures.Any(rtf => rtf.RoomFeatureId == fId)));

        return filtered.Select(rt => MapToGlobalResponse(rt, checkIn, checkOut));
    }

    public async Task<RoomTypeGlobalResponse?> GetByIdForMarketplaceAsync(Guid id, DateOnly? checkIn, DateOnly? checkOut)
    {
        var roomType = await _roomTypeRepo.GetByIdWithFeaturesAndRoomsAsync(id);
        if (roomType == null) return null;

        var activeHotelIds = await _subscriptionRepo.GetActiveHotelIdsAsync();
        if (!roomType.Hotel.IsActive || !activeHotelIds.Contains(roomType.HotelId)) return null;

        return MapToGlobalResponse(roomType, checkIn, checkOut);
    }

    // --- Mapping ---

    private static int GetAvailableRoomCount(RoomType rt, DateOnly? checkIn, DateOnly? checkOut)
    {
        if (checkIn == null || checkOut == null || rt.Rooms == null)
            return rt.Rooms?.Count ?? 0;

        return rt.Rooms.Count(room =>
            !room.Bookings.Any(b =>
                b.Status != BookingStatus.Cancelled &&
                b.CheckIn < checkOut.Value &&
                b.CheckOut > checkIn.Value));
    }

    private static RoomTypeResponse MapToResponse(RoomType rt) => new()
    {
        Id = rt.Id,
        HotelId = rt.HotelId,
        Name = rt.Name,
        Description = rt.Description,
        Price = rt.Price,
        MaxGuests = rt.MaxGuests,
        TotalRooms = rt.Rooms?.Count ?? 0,
        Features = rt.RoomTypeFeatures?.Select(rtf => new RoomFeatureDto
        {
            Id = rtf.RoomFeature?.Id ?? rtf.RoomFeatureId,
            Name = rtf.RoomFeature?.Name ?? string.Empty,
            Icon = rtf.RoomFeature?.Icon ?? string.Empty
        }).ToList() ?? new()
    };

    private static RoomTypeGlobalResponse MapToGlobalResponse(RoomType rt, DateOnly? checkIn, DateOnly? checkOut) => new()
    {
        Id = rt.Id,
        HotelId = rt.HotelId,
        HotelName = rt.Hotel?.Name ?? string.Empty,
        HotelLocation = rt.Hotel?.Location ?? string.Empty,
        Name = rt.Name,
        Description = rt.Description,
        Price = rt.Price,
        MaxGuests = rt.MaxGuests,
        TotalRooms = rt.Rooms?.Count ?? 0,
        AvailableRooms = GetAvailableRoomCount(rt, checkIn, checkOut),
        Features = rt.RoomTypeFeatures?.Select(rtf => new RoomFeatureDto
        {
            Id = rtf.RoomFeature?.Id ?? rtf.RoomFeatureId,
            Name = rtf.RoomFeature?.Name ?? string.Empty,
            Icon = rtf.RoomFeature?.Icon ?? string.Empty
        }).ToList() ?? new()
    };
}

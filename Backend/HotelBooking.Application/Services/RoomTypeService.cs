using HotelBooking.Application.DTOs.RoomType;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Services;

public class RoomTypeService : IRoomTypeService
{
    private readonly IRoomTypeRepository _roomTypeRepo;
    private readonly IRoomFeatureRepository _featureRepo;

    public RoomTypeService(IRoomTypeRepository roomTypeRepo, IRoomFeatureRepository featureRepo)
    {
        _roomTypeRepo = roomTypeRepo;
        _featureRepo = featureRepo;
    }

    public async Task<RoomTypeResponse> CreateAsync(CreateRoomTypeRequest request, Guid hotelId)
    {
        var roomType = new RoomType
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            Name = request.Name,
            Description = request.Description,
            BasePrice = request.BasePrice,
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
        roomType.BasePrice = request.BasePrice;
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

    private static RoomTypeResponse MapToResponse(RoomType rt) => new()
    {
        Id = rt.Id,
        HotelId = rt.HotelId,
        Name = rt.Name,
        Description = rt.Description,
        BasePrice = rt.BasePrice,
        MaxGuests = rt.MaxGuests,
        Features = rt.RoomTypeFeatures?.Select(rtf => new RoomFeatureDto
        {
            Id = rtf.RoomFeature?.Id ?? rtf.RoomFeatureId,
            Name = rtf.RoomFeature?.Name ?? string.Empty,
            Icon = rtf.RoomFeature?.Icon ?? string.Empty
        }).ToList() ?? new()
    };
}

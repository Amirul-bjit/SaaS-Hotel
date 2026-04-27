using HotelBooking.Application.DTOs.RoomType;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;

namespace HotelBooking.Application.Services;

public class RoomFeatureService : IRoomFeatureService
{
    private readonly IRoomFeatureRepository _featureRepo;

    public RoomFeatureService(IRoomFeatureRepository featureRepo)
    {
        _featureRepo = featureRepo;
    }

    public async Task<IEnumerable<RoomFeatureDto>> GetAllAsync()
    {
        var features = await _featureRepo.GetAllAsync();
        return features.Select(f => new RoomFeatureDto
        {
            Id = f.Id,
            Name = f.Name,
            Icon = f.Icon
        });
    }
}

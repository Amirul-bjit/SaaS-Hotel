using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Interfaces.Repositories;

public interface IRoomFeatureRepository
{
    Task<IEnumerable<RoomFeature>> GetAllAsync();
    Task<IEnumerable<RoomFeature>> GetByIdsAsync(IEnumerable<Guid> ids);
    Task<RoomFeature?> GetByIdAsync(Guid id);
}

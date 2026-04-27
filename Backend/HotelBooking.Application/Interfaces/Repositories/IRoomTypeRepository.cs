using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Interfaces.Repositories;

public interface IRoomTypeRepository
{
    Task<RoomType?> GetByIdAsync(Guid id);
    Task<RoomType?> GetByIdWithFeaturesAsync(Guid id);
    Task<RoomType?> GetByIdWithFeaturesAndRoomsAsync(Guid id);
    Task<IEnumerable<RoomType>> GetByHotelIdAsync(Guid hotelId);
    Task<IEnumerable<RoomType>> GetAllWithHotelAndRoomsAsync();
    Task AddAsync(RoomType roomType);
    void Update(RoomType roomType);
    void Delete(RoomType roomType);
    Task SaveChangesAsync();
}

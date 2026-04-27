using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Interfaces.Repositories;

public interface IRoomRepository
{
    Task<Room?> GetByIdAsync(Guid id);
    Task<IEnumerable<Room>> GetByRoomTypeIdAsync(Guid roomTypeId);
    Task<IEnumerable<Room>> GetByHotelIdAsync(Guid hotelId);
    Task AddAsync(Room room);
    void Delete(Room room);
    Task SaveChangesAsync();
}

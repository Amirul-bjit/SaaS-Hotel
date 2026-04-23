using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Interfaces.Repositories;

public interface IRoomRepository
{
    Task<Room?> GetByIdAsync(Guid id);
    Task<Room?> GetByIdWithHotelAsync(Guid id);
    Task<IEnumerable<Room>> GetByHotelIdAsync(Guid hotelId);
    Task<IEnumerable<Room>> GetAllWithHotelAsync();
    Task AddAsync(Room room);
    Task SaveChangesAsync();
}

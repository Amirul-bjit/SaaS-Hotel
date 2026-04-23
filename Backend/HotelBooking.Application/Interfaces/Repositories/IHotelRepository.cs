using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Interfaces.Repositories;

public interface IHotelRepository
{
    Task<Hotel?> GetByIdAsync(Guid id);
    Task<Hotel?> GetByOwnerIdAsync(Guid ownerId);
    Task<IEnumerable<Hotel>> GetAllAsync();
    Task AddAsync(Hotel hotel);
    Task DeleteAsync(Hotel hotel);
    Task SaveChangesAsync();
}

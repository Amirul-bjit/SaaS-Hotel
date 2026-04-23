using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task<IEnumerable<User>> GetByRoleAsync(UserRole role);
    Task AddAsync(User user);
    Task DeleteAsync(User user);
    Task SaveChangesAsync();
}

using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;
    public UserRepository(ApplicationDbContext context) => _context = context;

    public Task<User?> GetByEmailAsync(string email) =>
        _context.Users.FirstOrDefaultAsync(u => u.Email == email);

    public Task<User?> GetByIdAsync(Guid id) =>
        _context.Users.FindAsync(id).AsTask();

    public async Task<IEnumerable<User>> GetByRoleAsync(UserRole role) =>
        await _context.Users.Where(u => u.Role == role).ToListAsync();

    public async Task AddAsync(User user) => await _context.Users.AddAsync(user);

    public Task DeleteAsync(User user) { _context.Users.Remove(user); return Task.CompletedTask; }

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}

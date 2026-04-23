using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Domain.Entities;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Repositories;

public class HotelRepository : IHotelRepository
{
    private readonly ApplicationDbContext _context;
    public HotelRepository(ApplicationDbContext context) => _context = context;

    public Task<Hotel?> GetByIdAsync(Guid id) =>
        _context.Hotels.FindAsync(id).AsTask();

    public Task<Hotel?> GetByOwnerIdAsync(Guid ownerId) =>
        _context.Hotels.FirstOrDefaultAsync(h => h.OwnerId == ownerId);

    public async Task<IEnumerable<Hotel>> GetAllAsync() =>
        await _context.Hotels.ToListAsync();

    public async Task AddAsync(Hotel hotel) => await _context.Hotels.AddAsync(hotel);

    public Task DeleteAsync(Hotel hotel) { _context.Hotels.Remove(hotel); return Task.CompletedTask; }

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}

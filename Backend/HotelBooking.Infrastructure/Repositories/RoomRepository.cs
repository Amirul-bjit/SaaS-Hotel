using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Domain.Entities;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Repositories;

public class RoomRepository : IRoomRepository
{
    private readonly ApplicationDbContext _context;
    public RoomRepository(ApplicationDbContext context) => _context = context;

    public Task<Room?> GetByIdAsync(Guid id) =>
        _context.Rooms.FindAsync(id).AsTask();

    public Task<Room?> GetByIdWithHotelAsync(Guid id) =>
        _context.Rooms.Include(r => r.Hotel).FirstOrDefaultAsync(r => r.Id == id);

    public async Task<IEnumerable<Room>> GetByHotelIdAsync(Guid hotelId) =>
        await _context.Rooms.Where(r => r.HotelId == hotelId).ToListAsync();

    public async Task<IEnumerable<Room>> GetAllWithHotelAsync() =>
        await _context.Rooms.Include(r => r.Hotel).ToListAsync();

    public async Task AddAsync(Room room) => await _context.Rooms.AddAsync(room);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}

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
        _context.Rooms
            .Include(r => r.RoomType)
            .FirstOrDefaultAsync(r => r.Id == id);

    public async Task<IEnumerable<Room>> GetByRoomTypeIdAsync(Guid roomTypeId) =>
        await _context.Rooms
            .Where(r => r.RoomTypeId == roomTypeId)
            .Include(r => r.RoomType)
            .ToListAsync();

    public async Task<IEnumerable<Room>> GetByHotelIdAsync(Guid hotelId) =>
        await _context.Rooms
            .Where(r => r.RoomType.HotelId == hotelId)
            .Include(r => r.RoomType)
            .ToListAsync();

    public async Task AddAsync(Room room) => await _context.Rooms.AddAsync(room);

    public void Delete(Room room) => _context.Rooms.Remove(room);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}

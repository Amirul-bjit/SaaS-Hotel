using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Domain.Entities;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Repositories;

public class InventoryRepository : IInventoryRepository
{
    private readonly ApplicationDbContext _context;
    public InventoryRepository(ApplicationDbContext context) => _context = context;

    public Task<Inventory?> GetByRoomAndDateAsync(Guid roomId, DateOnly date) =>
        _context.Inventories.FirstOrDefaultAsync(i => i.RoomId == roomId && i.Date == date);

    public async Task<IEnumerable<Inventory>> GetByRoomIdAsync(Guid roomId) =>
        await _context.Inventories.Where(i => i.RoomId == roomId).ToListAsync();

    public async Task AddRangeAsync(IEnumerable<Inventory> inventories) =>
        await _context.Inventories.AddRangeAsync(inventories);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}

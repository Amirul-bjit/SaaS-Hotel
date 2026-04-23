using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Interfaces.Repositories;

public interface IInventoryRepository
{
    Task<Inventory?> GetByRoomAndDateAsync(Guid roomId, DateOnly date);
    Task<IEnumerable<Inventory>> GetByRoomIdAsync(Guid roomId);
    Task AddRangeAsync(IEnumerable<Inventory> inventories);
    Task SaveChangesAsync();
}

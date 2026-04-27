using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Domain.Entities;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Repositories;

public class RoomFeatureRepository : IRoomFeatureRepository
{
    private readonly ApplicationDbContext _context;
    public RoomFeatureRepository(ApplicationDbContext context) => _context = context;

    public async Task<IEnumerable<RoomFeature>> GetAllAsync() =>
        await _context.RoomFeatures.OrderBy(f => f.Name).ToListAsync();

    public async Task<IEnumerable<RoomFeature>> GetByIdsAsync(IEnumerable<Guid> ids) =>
        await _context.RoomFeatures.Where(f => ids.Contains(f.Id)).ToListAsync();

    public Task<RoomFeature?> GetByIdAsync(Guid id) =>
        _context.RoomFeatures.FindAsync(id).AsTask();
}

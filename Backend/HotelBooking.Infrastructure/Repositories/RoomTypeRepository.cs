using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Domain.Entities;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Repositories;

public class RoomTypeRepository : IRoomTypeRepository
{
    private readonly ApplicationDbContext _context;
    public RoomTypeRepository(ApplicationDbContext context) => _context = context;

    public Task<RoomType?> GetByIdAsync(Guid id) =>
        _context.RoomTypes.FindAsync(id).AsTask();

    public Task<RoomType?> GetByIdWithFeaturesAsync(Guid id) =>
        _context.RoomTypes
            .Include(rt => rt.RoomTypeFeatures)
                .ThenInclude(rtf => rtf.RoomFeature)
            .FirstOrDefaultAsync(rt => rt.Id == id);

    public async Task<IEnumerable<RoomType>> GetByHotelIdAsync(Guid hotelId) =>
        await _context.RoomTypes
            .Where(rt => rt.HotelId == hotelId)
            .Include(rt => rt.RoomTypeFeatures)
                .ThenInclude(rtf => rtf.RoomFeature)
            .ToListAsync();

    public async Task AddAsync(RoomType roomType) => await _context.RoomTypes.AddAsync(roomType);

    public void Update(RoomType roomType) => _context.RoomTypes.Update(roomType);

    public void Delete(RoomType roomType) => _context.RoomTypes.Remove(roomType);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}

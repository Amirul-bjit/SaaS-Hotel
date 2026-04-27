using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _context;
    public BookingRepository(ApplicationDbContext context) => _context = context;

    public Task<Booking?> GetByIdAsync(Guid id) =>
        _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.RoomType)
            .FirstOrDefaultAsync(b => b.Id == id);

    public async Task<IEnumerable<Booking>> GetByUserIdAsync(Guid userId) =>
        await _context.Bookings
            .Where(b => b.UserId == userId)
            .Include(b => b.Room)
            .Include(b => b.RoomType)
            .ToListAsync();

    public async Task<IEnumerable<Booking>> GetByHotelIdAsync(Guid hotelId) =>
        await _context.Bookings
            .Where(b => b.HotelId == hotelId)
            .Include(b => b.Room)
            .Include(b => b.RoomType)
            .ToListAsync();

    public async Task<IEnumerable<Booking>> GetAllAsync() =>
        await _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.RoomType)
            .ToListAsync();

    public async Task<ISet<Guid>> GetBookedRoomIdsAsync(IEnumerable<Guid> roomIds, DateOnly checkIn, DateOnly checkOut)
    {
        var ids = await _context.Bookings
            .Where(b => roomIds.Contains(b.RoomId)
                && b.Status != BookingStatus.Cancelled
                && b.CheckIn < checkOut
                && b.CheckOut > checkIn)
            .Select(b => b.RoomId)
            .Distinct()
            .ToListAsync();
        return new HashSet<Guid>(ids);
    }

    public async Task AddAsync(Booking booking) => await _context.Bookings.AddAsync(booking);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}

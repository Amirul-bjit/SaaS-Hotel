using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Domain.Entities;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _context;
    public BookingRepository(ApplicationDbContext context) => _context = context;

    public Task<Booking?> GetByIdAsync(Guid id) =>
        _context.Bookings.FindAsync(id).AsTask();

    public async Task<IEnumerable<Booking>> GetByUserIdAsync(Guid userId) =>
        await _context.Bookings.Where(b => b.UserId == userId).ToListAsync();

    public async Task<IEnumerable<Booking>> GetByHotelIdAsync(Guid hotelId) =>
        await _context.Bookings.Where(b => b.HotelId == hotelId).ToListAsync();

    public async Task<IEnumerable<Booking>> GetAllAsync() =>
        await _context.Bookings.ToListAsync();

    public async Task AddAsync(Booking booking) => await _context.Bookings.AddAsync(booking);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}

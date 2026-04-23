using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Interfaces.Repositories;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id);
    Task<IEnumerable<Booking>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Booking>> GetByHotelIdAsync(Guid hotelId);
    Task<IEnumerable<Booking>> GetAllAsync();
    Task AddAsync(Booking booking);
    Task SaveChangesAsync();
}

using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Interfaces.Repositories;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id);
    Task<IEnumerable<Booking>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Booking>> GetByHotelIdAsync(Guid hotelId);
    Task<IEnumerable<Booking>> GetAllAsync();
    Task<ISet<Guid>> GetBookedRoomIdsAsync(IEnumerable<Guid> roomIds, DateOnly checkIn, DateOnly checkOut);
    Task AddAsync(Booking booking);
    void Update(Booking booking);
    Task SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}

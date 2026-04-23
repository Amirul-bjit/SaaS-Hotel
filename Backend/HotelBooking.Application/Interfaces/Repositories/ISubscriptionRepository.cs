using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Interfaces.Repositories;

public interface ISubscriptionRepository
{
    Task<Subscription?> GetByHotelIdAsync(Guid hotelId);
    Task AddAsync(Subscription subscription);
    Task SaveChangesAsync();
}

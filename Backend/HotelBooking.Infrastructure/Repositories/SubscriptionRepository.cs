using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Domain.Entities;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Repositories;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly ApplicationDbContext _context;
    public SubscriptionRepository(ApplicationDbContext context) => _context = context;

    public Task<Subscription?> GetByHotelIdAsync(Guid hotelId) =>
        _context.Subscriptions.FirstOrDefaultAsync(s => s.HotelId == hotelId);

    public async Task AddAsync(Subscription subscription) =>
        await _context.Subscriptions.AddAsync(subscription);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}

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

    public async Task<ISet<Guid>> GetActiveHotelIdsAsync()
    {
        var graceCutoff = DateTime.UtcNow.AddDays(-7);
        var ids = await _context.Subscriptions
            .Where(s => s.IsActive && s.ExpiryDate >= graceCutoff)
            .Select(s => s.HotelId)
            .ToListAsync();
        return new HashSet<Guid>(ids);
    }

    public async Task<int> DeactivateExpiredAsync(int gracePeriodDays)
    {
        var cutoff = DateTime.UtcNow.AddDays(-gracePeriodDays);
        var expired = await _context.Subscriptions
            .Where(s => s.IsActive && s.ExpiryDate < cutoff)
            .ToListAsync();

        foreach (var sub in expired)
            sub.IsActive = false;

        if (expired.Count > 0)
            await _context.SaveChangesAsync();

        return expired.Count;
    }

    public async Task AddAsync(Subscription subscription) =>
        await _context.Subscriptions.AddAsync(subscription);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}

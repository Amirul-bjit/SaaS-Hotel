using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Repositories;

public class SubscriptionPlanConfigRepository : ISubscriptionPlanConfigRepository
{
    private readonly ApplicationDbContext _context;
    public SubscriptionPlanConfigRepository(ApplicationDbContext context) => _context = context;

    public async Task<IEnumerable<SubscriptionPlanConfig>> GetAllAsync() =>
        await _context.SubscriptionPlanConfigs.ToListAsync();

    public Task<SubscriptionPlanConfig?> GetByPlanTypeAsync(SubscriptionPlan planType) =>
        _context.SubscriptionPlanConfigs.FirstOrDefaultAsync(p => p.PlanType == planType);

    public async Task AddAsync(SubscriptionPlanConfig config) =>
        await _context.SubscriptionPlanConfigs.AddAsync(config);

    public void Update(SubscriptionPlanConfig config) =>
        _context.SubscriptionPlanConfigs.Update(config);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}

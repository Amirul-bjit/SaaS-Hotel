using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Interfaces.Repositories;

public interface ISubscriptionPlanConfigRepository
{
    Task<IEnumerable<SubscriptionPlanConfig>> GetAllAsync();
    Task<SubscriptionPlanConfig?> GetByPlanTypeAsync(SubscriptionPlan planType);
    Task AddAsync(SubscriptionPlanConfig config);
    void Update(SubscriptionPlanConfig config);
    Task SaveChangesAsync();
}

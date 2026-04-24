using HotelBooking.Application.DTOs.Subscription;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Interfaces.Services;

public interface ISubscriptionPlanConfigService
{
    Task<IEnumerable<PlanConfigResponse>> GetAllAsync();
    Task<PlanConfigResponse?> GetByPlanTypeAsync(SubscriptionPlan planType);
    Task<PlanConfigResponse> UpsertAsync(UpsertPlanConfigRequest request);
}

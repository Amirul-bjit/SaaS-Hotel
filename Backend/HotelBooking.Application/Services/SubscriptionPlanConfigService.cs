using HotelBooking.Application.DTOs.Subscription;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Services;

public class SubscriptionPlanConfigService : ISubscriptionPlanConfigService
{
    private readonly ISubscriptionPlanConfigRepository _repo;

    public SubscriptionPlanConfigService(ISubscriptionPlanConfigRepository repo) => _repo = repo;

    public async Task<IEnumerable<PlanConfigResponse>> GetAllAsync()
    {
        var configs = await _repo.GetAllAsync();
        return configs.Select(MapToResponse);
    }

    public async Task<PlanConfigResponse?> GetByPlanTypeAsync(SubscriptionPlan planType)
    {
        var config = await _repo.GetByPlanTypeAsync(planType);
        return config == null ? null : MapToResponse(config);
    }

    public async Task<PlanConfigResponse> UpsertAsync(UpsertPlanConfigRequest request)
    {
        var existing = await _repo.GetByPlanTypeAsync(request.PlanType);

        if (existing == null)
        {
            var newConfig = new SubscriptionPlanConfig
            {
                Id = Guid.NewGuid(),
                PlanType = request.PlanType,
                MaxRooms = request.MaxRooms,
                MonthlyPrice = request.MonthlyPrice,
                YearlyPrice = request.YearlyPrice,
                Description = request.Description
            };
            await _repo.AddAsync(newConfig);
            await _repo.SaveChangesAsync();
            return MapToResponse(newConfig);
        }

        existing.MaxRooms = request.MaxRooms;
        existing.MonthlyPrice = request.MonthlyPrice;
        existing.YearlyPrice = request.YearlyPrice;
        existing.Description = request.Description;
        _repo.Update(existing);
        await _repo.SaveChangesAsync();
        return MapToResponse(existing);
    }

    private static PlanConfigResponse MapToResponse(SubscriptionPlanConfig c) => new()
    {
        Id = c.Id,
        PlanType = c.PlanType,
        MaxRooms = c.MaxRooms,
        MonthlyPrice = c.MonthlyPrice,
        YearlyPrice = c.YearlyPrice,
        Description = c.Description
    };
}

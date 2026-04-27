using HotelBooking.Application.DTOs.Subscription;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Services;

public class SubscriptionService : ISubscriptionService
{
    private const int GracePeriodDays = 7;

    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly ISubscriptionPlanConfigRepository _planConfigRepository;

    public SubscriptionService(
        ISubscriptionRepository subscriptionRepository,
        ISubscriptionPlanConfigRepository planConfigRepository)
    {
        _subscriptionRepository = subscriptionRepository;
        _planConfigRepository = planConfigRepository;
    }

    public async Task<SubscriptionResponse> CreateSubscriptionAsync(CreateSubscriptionRequest request, Guid hotelId)
    {
        var existing = await _subscriptionRepository.GetByHotelIdAsync(hotelId);
        if (existing != null)
            throw new InvalidOperationException("Hotel already has a subscription. Use update to change it.");

        var planConfig = await _planConfigRepository.GetByPlanTypeAsync(request.PlanType)
            ?? throw new InvalidOperationException($"No plan configuration found for {request.PlanType}. SuperAdmin must configure it first.");

        var now = DateTime.UtcNow;
        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            PlanType = request.PlanType,
            BillingCycle = request.BillingCycle,
            StartDate = now,
            ExpiryDate = CalculateExpiry(now, request.BillingCycle),
            LastPaymentDate = now,
            LastPaymentAmount = request.BillingCycle == BillingCycle.Monthly
                ? planConfig.MonthlyPrice
                : planConfig.YearlyPrice,
            IsActive = true
        };

        await _subscriptionRepository.AddAsync(subscription);
        await _subscriptionRepository.SaveChangesAsync();

        return MapToResponse(subscription, planConfig);
    }

    public async Task<SubscriptionResponse?> GetSubscriptionAsync(Guid hotelId)
    {
        var sub = await _subscriptionRepository.GetByHotelIdAsync(hotelId);
        if (sub == null) return null;

        var planConfig = await _planConfigRepository.GetByPlanTypeAsync(sub.PlanType);
        return MapToResponse(sub, planConfig);
    }

    public async Task<SubscriptionResponse> UpdateSubscriptionAsync(CreateSubscriptionRequest request, Guid hotelId)
    {
        var subscription = await _subscriptionRepository.GetByHotelIdAsync(hotelId)
            ?? throw new InvalidOperationException("Hotel does not have an active subscription.");

        var planConfig = await _planConfigRepository.GetByPlanTypeAsync(request.PlanType)
            ?? throw new InvalidOperationException($"No plan configuration found for {request.PlanType}. SuperAdmin must configure it first.");

        var now = DateTime.UtcNow;
        subscription.PlanType = request.PlanType;
        subscription.BillingCycle = request.BillingCycle;
        subscription.ExpiryDate = CalculateExpiry(now, request.BillingCycle);
        subscription.LastPaymentDate = now;
        subscription.LastPaymentAmount = request.BillingCycle == BillingCycle.Monthly
            ? planConfig.MonthlyPrice
            : planConfig.YearlyPrice;
        subscription.IsActive = true;

        await _subscriptionRepository.SaveChangesAsync();
        return MapToResponse(subscription, planConfig);
    }

    public async Task<SubscriptionResponse> ToggleActiveAsync(Guid hotelId)
    {
        var subscription = await _subscriptionRepository.GetByHotelIdAsync(hotelId)
            ?? throw new InvalidOperationException("Hotel does not have a subscription.");

        subscription.IsActive = !subscription.IsActive;
        await _subscriptionRepository.SaveChangesAsync();

        var planConfig = await _planConfigRepository.GetByPlanTypeAsync(subscription.PlanType);
        return MapToResponse(subscription, planConfig);
    }

    private static DateTime CalculateExpiry(DateTime from, BillingCycle cycle) =>
        cycle == BillingCycle.Monthly ? from.AddMonths(1) : from.AddYears(1);

    private static SubscriptionResponse MapToResponse(Subscription s, SubscriptionPlanConfig? config)
    {
        var now = DateTime.UtcNow;
        var daysUntilExpiry = (int)(s.ExpiryDate.Date - now.Date).TotalDays;
        var isExpired = s.ExpiryDate < now;
        var isInGracePeriod = isExpired && s.IsActive && s.ExpiryDate.AddDays(GracePeriodDays) >= now;

        return new()
        {
            Id = s.Id,
            HotelId = s.HotelId,
            PlanType = s.PlanType,
            BillingCycle = s.BillingCycle,
            StartDate = s.StartDate,
            ExpiryDate = s.ExpiryDate,
            LastPaymentDate = s.LastPaymentDate,
            LastPaymentAmount = s.LastPaymentAmount,
            IsActive = s.IsActive,
            DaysUntilExpiry = daysUntilExpiry,
            IsInGracePeriod = isInGracePeriod,
            PlanConfig = config == null ? null : new PlanConfigResponse
            {
                Id = config.Id,
                PlanType = config.PlanType,
                MaxRooms = config.MaxRooms,
                MonthlyPrice = config.MonthlyPrice,
                YearlyPrice = config.YearlyPrice,
                Description = config.Description
            }
        };
    }

    public async Task<int> DeactivateExpiredSubscriptionsAsync()
    {
        return await _subscriptionRepository.DeactivateExpiredAsync(GracePeriodDays);
    }
}


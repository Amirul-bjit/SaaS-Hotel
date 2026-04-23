using HotelBooking.Application.DTOs.Subscription;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly ISubscriptionRepository _subscriptionRepository;

    public SubscriptionService(ISubscriptionRepository subscriptionRepository)
    {
        _subscriptionRepository = subscriptionRepository;
    }

    public async Task<SubscriptionResponse> CreateSubscriptionAsync(CreateSubscriptionRequest request, Guid hotelId)
    {
        var existing = await _subscriptionRepository.GetByHotelIdAsync(hotelId);
        if (existing != null)
            throw new InvalidOperationException("Hotel already has a subscription.");

        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            PlanType = request.PlanType,
            ExpiryDate = request.ExpiryDate
        };

        await _subscriptionRepository.AddAsync(subscription);
        await _subscriptionRepository.SaveChangesAsync();

        return MapToResponse(subscription);
    }

    public async Task<SubscriptionResponse?> GetSubscriptionAsync(Guid hotelId)
    {
        var sub = await _subscriptionRepository.GetByHotelIdAsync(hotelId);
        return sub == null ? null : MapToResponse(sub);
    }

    private static SubscriptionResponse MapToResponse(Subscription s) =>
        new() { Id = s.Id, HotelId = s.HotelId, PlanType = s.PlanType, ExpiryDate = s.ExpiryDate };
}

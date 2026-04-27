using HotelBooking.Application.DTOs.Subscription;

namespace HotelBooking.Application.Interfaces.Services;

public interface ISubscriptionService
{
    Task<SubscriptionResponse> CreateSubscriptionAsync(CreateSubscriptionRequest request, Guid hotelId);
    Task<SubscriptionResponse?> GetSubscriptionAsync(Guid hotelId);
    Task<SubscriptionResponse> UpdateSubscriptionAsync(CreateSubscriptionRequest request, Guid hotelId);
    Task<SubscriptionResponse> ToggleActiveAsync(Guid hotelId);
}

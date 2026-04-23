using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.DTOs.Subscription;

public class SubscriptionResponse
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public SubscriptionPlan PlanType { get; set; }
    public DateTime ExpiryDate { get; set; }
}

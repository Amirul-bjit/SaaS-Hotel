using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.DTOs.Subscription;

public class CreateSubscriptionRequest
{
    public SubscriptionPlan PlanType { get; set; }
    public BillingCycle BillingCycle { get; set; }
}

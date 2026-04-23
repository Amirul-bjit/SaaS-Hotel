using HotelBooking.Domain.Enums;

namespace HotelBooking.Domain.Entities;

public class Subscription
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public SubscriptionPlan PlanType { get; set; }
    public DateTime ExpiryDate { get; set; }

    // Navigation
    public Hotel Hotel { get; set; } = null!;
}

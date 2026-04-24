using HotelBooking.Domain.Enums;

namespace HotelBooking.Domain.Entities;

public class Subscription
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public SubscriptionPlan PlanType { get; set; }
    public BillingCycle BillingCycle { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public DateTime? LastPaymentDate { get; set; }
    public decimal LastPaymentAmount { get; set; }
    public bool IsActive { get; set; }

    // Navigation
    public Hotel Hotel { get; set; } = null!;
}

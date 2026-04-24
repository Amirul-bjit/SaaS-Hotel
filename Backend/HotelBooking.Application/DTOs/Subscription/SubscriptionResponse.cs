using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.DTOs.Subscription;

public class SubscriptionResponse
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
    public PlanConfigResponse? PlanConfig { get; set; }
}

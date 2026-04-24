using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.DTOs.Subscription;

public class PlanConfigResponse
{
    public Guid Id { get; set; }
    public SubscriptionPlan PlanType { get; set; }
    public int? MaxRooms { get; set; }
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public string Description { get; set; } = string.Empty;
}

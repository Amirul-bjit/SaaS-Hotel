using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.DTOs.Subscription;

public class UpsertPlanConfigRequest
{
    public SubscriptionPlan PlanType { get; set; }

    /// <summary>Max rooms allowed. Leave null for unlimited.</summary>
    public int? MaxRooms { get; set; }

    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public string Description { get; set; } = string.Empty;
}

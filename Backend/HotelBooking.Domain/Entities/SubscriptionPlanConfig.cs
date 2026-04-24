using HotelBooking.Domain.Enums;

namespace HotelBooking.Domain.Entities;

public class SubscriptionPlanConfig
{
    public Guid Id { get; set; }

    /// <summary>Unique plan type this config applies to (Basic, Standard, Premium).</summary>
    public SubscriptionPlan PlanType { get; set; }

    /// <summary>Maximum number of rooms allowed. Null means unlimited.</summary>
    public int? MaxRooms { get; set; }

    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }

    public string Description { get; set; } = string.Empty;
}

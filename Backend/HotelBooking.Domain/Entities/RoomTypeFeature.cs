namespace HotelBooking.Domain.Entities;

public class RoomTypeFeature
{
    public Guid RoomTypeId { get; set; }
    public Guid RoomFeatureId { get; set; }

    // Navigation
    public RoomType RoomType { get; set; } = null!;
    public RoomFeature RoomFeature { get; set; } = null!;
}

namespace HotelBooking.Domain.Entities;

public class RoomFeature
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;

    // Navigation
    public ICollection<RoomTypeFeature> RoomTypeFeatures { get; set; } = new List<RoomTypeFeature>();
}

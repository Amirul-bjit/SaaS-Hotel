namespace HotelBooking.Domain.Entities;

public class RoomType
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int MaxGuests { get; set; }

    // Navigation
    public Hotel Hotel { get; set; } = null!;
    public ICollection<Room> Rooms { get; set; } = new List<Room>();
    public ICollection<RoomTypeFeature> RoomTypeFeatures { get; set; } = new List<RoomTypeFeature>();
}

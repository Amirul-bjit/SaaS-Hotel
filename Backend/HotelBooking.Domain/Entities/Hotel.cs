namespace HotelBooking.Domain.Entities;

public class Hotel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public string Location { get; set; } = string.Empty;

    // Navigation
    public User Owner { get; set; } = null!;
    public ICollection<RoomType> RoomTypes { get; set; } = new List<RoomType>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public Subscription? Subscription { get; set; }
}

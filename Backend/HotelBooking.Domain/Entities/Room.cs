namespace HotelBooking.Domain.Entities;

public class Room
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int TotalRooms { get; set; }
    public int MaxGuests { get; set; }

    // Navigation
    public Hotel Hotel { get; set; } = null!;
    public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

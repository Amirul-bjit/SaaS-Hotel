namespace HotelBooking.Domain.Entities;

public class Inventory
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public DateOnly Date { get; set; }
    public int AvailableCount { get; set; }

    // Navigation
    public Room Room { get; set; } = null!;
}

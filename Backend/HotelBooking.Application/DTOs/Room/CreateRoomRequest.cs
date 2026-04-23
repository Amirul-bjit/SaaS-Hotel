namespace HotelBooking.Application.DTOs.Room;

public class CreateRoomRequest
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int TotalRooms { get; set; }
    public int MaxGuests { get; set; }
}

namespace HotelBooking.Application.DTOs.Room;

public class CreateRoomRequest
{
    public Guid RoomTypeId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
}

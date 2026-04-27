namespace HotelBooking.Application.DTOs.RoomType;

public class CreateRoomTypeRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int MaxGuests { get; set; }
    public List<Guid> FeatureIds { get; set; } = new();
}

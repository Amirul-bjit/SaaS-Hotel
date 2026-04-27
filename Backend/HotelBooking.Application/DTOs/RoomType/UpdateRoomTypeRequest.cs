namespace HotelBooking.Application.DTOs.RoomType;

public class UpdateRoomTypeRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int MaxGuests { get; set; }
    public List<Guid> FeatureIds { get; set; } = new();
}

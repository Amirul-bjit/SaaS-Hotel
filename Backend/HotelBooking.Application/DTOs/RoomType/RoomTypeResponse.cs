namespace HotelBooking.Application.DTOs.RoomType;

public class RoomTypeResponse
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public int MaxGuests { get; set; }
    public List<RoomFeatureDto> Features { get; set; } = new();
}

public class RoomFeatureDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
}

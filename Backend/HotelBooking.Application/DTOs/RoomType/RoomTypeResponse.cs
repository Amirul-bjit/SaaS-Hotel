namespace HotelBooking.Application.DTOs.RoomType;

public class RoomTypeResponse
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int MaxGuests { get; set; }
    public int TotalRooms { get; set; }
    public List<RoomFeatureDto> Features { get; set; } = new();
}

public class RoomTypeGlobalResponse
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public string HotelLocation { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int MaxGuests { get; set; }
    public int TotalRooms { get; set; }
    public int AvailableRooms { get; set; }
    public List<RoomFeatureDto> Features { get; set; } = new();
}

public class RoomFeatureDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
}

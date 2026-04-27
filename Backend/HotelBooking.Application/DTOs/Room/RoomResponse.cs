using HotelBooking.Application.DTOs.RoomType;

namespace HotelBooking.Application.DTOs.Room;

public class RoomResponse
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int TotalRooms { get; set; }
    public int MaxGuests { get; set; }
    public Guid? RoomTypeId { get; set; }
    public string? RoomTypeName { get; set; }
    public List<RoomFeatureDto> Features { get; set; } = new();
}

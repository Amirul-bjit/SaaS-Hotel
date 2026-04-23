namespace HotelBooking.Application.DTOs.Hotel;

public class HotelResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public string Location { get; set; } = string.Empty;
}

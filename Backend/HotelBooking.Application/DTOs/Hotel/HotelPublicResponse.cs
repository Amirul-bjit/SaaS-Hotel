namespace HotelBooking.Application.DTOs.Hotel;

public class HotelPublicResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
}

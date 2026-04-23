namespace HotelBooking.Application.DTOs.Hotel;

public class CreateHotelRequest
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public Guid? OwnerId { get; set; }
}

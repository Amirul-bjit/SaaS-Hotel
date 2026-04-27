namespace HotelBooking.Application.DTOs.Booking;

public class CreateBookingRequest
{
    public Guid RoomTypeId { get; set; }
    public DateOnly CheckIn { get; set; }
    public DateOnly CheckOut { get; set; }
}

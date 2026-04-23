using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.DTOs.Booking;

public class BookingResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomId { get; set; }
    public DateOnly CheckIn { get; set; }
    public DateOnly CheckOut { get; set; }
    public BookingStatus Status { get; set; }
}

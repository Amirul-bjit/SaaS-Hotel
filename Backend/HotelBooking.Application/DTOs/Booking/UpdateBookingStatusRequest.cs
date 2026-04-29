using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.DTOs.Booking;

public class UpdateBookingStatusRequest
{
    public BookingStatus NewStatus { get; set; }
}

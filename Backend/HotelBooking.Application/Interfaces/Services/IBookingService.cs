using HotelBooking.Application.DTOs.Booking;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Interfaces.Services;

public interface IBookingService
{
    Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request, Guid userId, Guid? hotelId);
    Task<IEnumerable<BookingResponse>> GetBookingsAsync(Guid userId, Guid? hotelId, UserRole role);
}

using HotelBooking.Application.DTOs.Booking;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Interfaces.Services;

public interface IBookingService
{
    Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request, Guid userId, Guid? hotelId);
    Task<IEnumerable<BookingResponse>> GetBookingsAsync(Guid userId, Guid? hotelId, UserRole role);
    Task<BookingResponse> UpdateBookingStatusAsync(Guid bookingId, BookingStatus newStatus, Guid userId, Guid? hotelId, UserRole role);
    Task<BookingResponse> CancelBookingAsync(Guid bookingId, Guid userId, Guid? hotelId, UserRole role);
    Task<BookingResponse> ConfirmBookingAsync(Guid bookingId, Guid userId, Guid? hotelId, UserRole role);
}

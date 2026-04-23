using HotelBooking.Application.DTOs.Booking;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.API.Controllers;

[ApiController]
[Route("bookings")]
[Authorize(Policy = "CanViewBookings")]
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;
    public BookingController(IBookingService bookingService) => _bookingService = bookingService;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest request)
    {
        var userId = GetUserId();
        var hotelId = GetHotelId(); // null for CUSTOMER — service will derive from room
        var result = await _bookingService.CreateBookingAsync(request, userId, hotelId);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var hotelId = GetHotelId();
        var role = GetRole();
        var result = await _bookingService.GetBookingsAsync(userId, hotelId, role);
        return Ok(result);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.Claims.First(c => c.Type == "user_id").Value);

    private Guid? GetHotelId()
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == "hotel_id")?.Value;
        return claim != null ? Guid.Parse(claim) : null;
    }

    private UserRole GetRole() =>
        Enum.Parse<UserRole>(User.Claims.First(c => c.Type == "role").Value);
}

using HotelBooking.Application.DTOs.Room;
using HotelBooking.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.API.Controllers;

[ApiController]
[Authorize]
public class RoomController : ControllerBase
{
    private readonly IRoomService _roomService;
    public RoomController(IRoomService roomService) => _roomService = roomService;

    // --- Global marketplace endpoints ---

    [HttpGet("rooms")]
    public async Task<IActionResult> GetAllRooms(
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? minGuests,
        [FromQuery] string? location)
    {
        var result = await _roomService.GetAllRoomsAsync(minPrice, maxPrice, minGuests, location);
        return Ok(result);
    }

    [HttpGet("rooms/{id:guid}")]
    public async Task<IActionResult> GetRoomById(Guid id)
    {
        var result = await _roomService.GetRoomByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    // --- Hotel-scoped endpoints ---

    [HttpPost("hotels/{hotelId:guid}/rooms")]
    [Authorize(Policy = "CanManageHotel")]
    public async Task<IActionResult> Create(Guid hotelId, [FromBody] CreateRoomRequest request)
    {
        EnforceHotelAccess(hotelId);
        try
        {
            var result = await _roomService.CreateRoomAsync(request, hotelId);
            return CreatedAtAction(nameof(GetByHotel), new { hotelId }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("hotels/{hotelId:guid}/rooms")]
    public async Task<IActionResult> GetByHotel(Guid hotelId)
    {
        var result = await _roomService.GetRoomsByHotelAsync(hotelId);
        return Ok(result);
    }

    private void EnforceHotelAccess(Guid hotelId)
    {
        var role = User.Claims.FirstOrDefault(c => c.Type == "role")?.Value;
        if (role == "SUPER_ADMIN") return; // super admin can manage any hotel
        var hotelClaim = User.Claims.FirstOrDefault(c => c.Type == "hotel_id")?.Value;
        if (hotelClaim == null || !Guid.TryParse(hotelClaim, out var claimedHotelId) || claimedHotelId != hotelId)
            throw new UnauthorizedAccessException("Cannot manage rooms for a different hotel.");
    }
}

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

    [HttpDelete("hotels/{hotelId:guid}/rooms/{roomId:guid}")]
    [Authorize(Policy = "CanManageHotel")]
    public async Task<IActionResult> Delete(Guid hotelId, Guid roomId)
    {
        EnforceHotelAccess(hotelId);
        try
        {
            await _roomService.DeleteRoomAsync(roomId, hotelId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("hotels/{hotelId:guid}/rooms")]
    [Authorize(Policy = "CanManageHotel")]
    public async Task<IActionResult> GetByHotel(Guid hotelId)
    {
        EnforceHotelAccess(hotelId);
        var result = await _roomService.GetRoomsByHotelAsync(hotelId);
        return Ok(result);
    }

    [HttpGet("hotels/{hotelId:guid}/room-types/{roomTypeId:guid}/rooms")]
    [Authorize(Policy = "CanManageHotel")]
    public async Task<IActionResult> GetByRoomType(Guid hotelId, Guid roomTypeId)
    {
        EnforceHotelAccess(hotelId);
        var result = await _roomService.GetRoomsByRoomTypeAsync(roomTypeId);
        return Ok(result);
    }

    private void EnforceHotelAccess(Guid hotelId)
    {
        var role = User.Claims.FirstOrDefault(c => c.Type == "role")?.Value;
        if (role == "SUPER_ADMIN") return;
        var hotelClaim = User.Claims.FirstOrDefault(c => c.Type == "hotel_id")?.Value;
        if (hotelClaim == null || !Guid.TryParse(hotelClaim, out var claimedHotelId) || claimedHotelId != hotelId)
            throw new UnauthorizedAccessException("Cannot manage rooms for a different hotel.");
    }
}

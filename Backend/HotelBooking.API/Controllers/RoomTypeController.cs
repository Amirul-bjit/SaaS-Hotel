using HotelBooking.Application.DTOs.RoomType;
using HotelBooking.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.API.Controllers;

[ApiController]
[Authorize]
public class RoomTypeController : ControllerBase
{
    private readonly IRoomTypeService _roomTypeService;
    public RoomTypeController(IRoomTypeService roomTypeService) => _roomTypeService = roomTypeService;

    [HttpPost("hotels/{hotelId:guid}/room-types")]
    [Authorize(Policy = "CanManageHotel")]
    public async Task<IActionResult> Create(Guid hotelId, [FromBody] CreateRoomTypeRequest request)
    {
        EnforceHotelAccess(hotelId);
        try
        {
            var result = await _roomTypeService.CreateAsync(request, hotelId);
            return CreatedAtAction(nameof(GetByHotel), new { hotelId }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("hotels/{hotelId:guid}/room-types/{id:guid}")]
    [Authorize(Policy = "CanManageHotel")]
    public async Task<IActionResult> Update(Guid hotelId, Guid id, [FromBody] UpdateRoomTypeRequest request)
    {
        EnforceHotelAccess(hotelId);
        try
        {
            var result = await _roomTypeService.UpdateAsync(id, request, hotelId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpDelete("hotels/{hotelId:guid}/room-types/{id:guid}")]
    [Authorize(Policy = "CanManageHotel")]
    public async Task<IActionResult> Delete(Guid hotelId, Guid id)
    {
        EnforceHotelAccess(hotelId);
        try
        {
            await _roomTypeService.DeleteAsync(id, hotelId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    // --- Marketplace endpoints (public) ---

    [AllowAnonymous]
    [HttpGet("room-types")]
    public async Task<IActionResult> GetAllForMarketplace(
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? minGuests,
        [FromQuery] string? location,
        [FromQuery] List<Guid>? featureIds,
        [FromQuery] DateOnly? checkIn,
        [FromQuery] DateOnly? checkOut)
    {
        var result = await _roomTypeService.GetAllForMarketplaceAsync(
            minPrice, maxPrice, minGuests, location, featureIds, checkIn, checkOut);
        return Ok(result);
    }

    [AllowAnonymous]
    [HttpGet("hotels/{hotelId:guid}/room-types")]
    public async Task<IActionResult> GetByHotel(Guid hotelId)
    {
        var result = await _roomTypeService.GetByHotelAsync(hotelId);
        return Ok(result);
    }

    [AllowAnonymous]
    [HttpGet("room-types/{id:guid}")]
    public async Task<IActionResult> GetById(Guid id,
        [FromQuery] DateOnly? checkIn,
        [FromQuery] DateOnly? checkOut)
    {
        var result = await _roomTypeService.GetByIdForMarketplaceAsync(id, checkIn, checkOut);
        return result == null ? NotFound() : Ok(result);
    }

    private void EnforceHotelAccess(Guid hotelId)
    {
        var role = User.Claims.FirstOrDefault(c => c.Type == "role")?.Value;
        if (role == "SUPER_ADMIN") return;
        var hotelClaim = User.Claims.FirstOrDefault(c => c.Type == "hotel_id")?.Value;
        if (hotelClaim == null || !Guid.TryParse(hotelClaim, out var claimedHotelId) || claimedHotelId != hotelId)
            throw new UnauthorizedAccessException("Cannot manage room types for a different hotel.");
    }
}

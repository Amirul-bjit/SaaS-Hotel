using HotelBooking.Application.DTOs.Hotel;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.API.Controllers;

[ApiController]
[Route("hotels")]
[Authorize]
public class HotelController : ControllerBase
{
    private readonly IHotelService _hotelService;
    private readonly IHotelRepository _hotelRepository;
    public HotelController(IHotelService hotelService, IHotelRepository hotelRepository)
    {
        _hotelService = hotelService;
        _hotelRepository = hotelRepository;
    }

    [HttpPost]
    [Authorize(Policy = "CanManageHotel")]
    public async Task<IActionResult> Create([FromBody] CreateHotelRequest request)
    {
        var role = User.Claims.FirstOrDefault(c => c.Type == "role")?.Value;
        var ownerId = role == "SUPER_ADMIN" && request.OwnerId.HasValue
            ? request.OwnerId.Value
            : GetUserId();
        try
        {
            var result = await _hotelService.CreateHotelAsync(request, ownerId);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _hotelService.GetHotelAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Authorize(Policy = "IsSuperAdmin")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _hotelService.GetAllHotelsAsync();
        return Ok(result);
    }

    [AllowAnonymous]
    [HttpGet("browse")]
    public async Task<IActionResult> Browse()
    {
        var result = await _hotelService.GetAllHotelsPublicAsync();
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "IsSuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var hotel = await _hotelRepository.GetByIdAsync(id);
        if (hotel == null) return NotFound();
        await _hotelRepository.DeleteAsync(hotel);
        await _hotelRepository.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle-active")]
    [Authorize(Policy = "IsSuperAdmin")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        var result = await _hotelService.ToggleHotelActiveAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.Claims.First(c => c.Type == "user_id").Value);
}

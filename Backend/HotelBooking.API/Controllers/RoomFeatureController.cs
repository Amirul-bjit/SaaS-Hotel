using HotelBooking.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.API.Controllers;

[ApiController]
public class RoomFeatureController : ControllerBase
{
    private readonly IRoomFeatureService _featureService;
    public RoomFeatureController(IRoomFeatureService featureService) => _featureService = featureService;

    [AllowAnonymous]
    [HttpGet("room-features")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _featureService.GetAllAsync();
        return Ok(result);
    }
}

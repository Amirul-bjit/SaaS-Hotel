using HotelBooking.Application.DTOs.Subscription;
using HotelBooking.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.API.Controllers;

[ApiController]
[Route("subscriptions")]
[Authorize(Policy = "IsSuperAdmin")]
public class SubscriptionController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;
    public SubscriptionController(ISubscriptionService subscriptionService) =>
        _subscriptionService = subscriptionService;

    [HttpPost("{hotelId:guid}")]
    public async Task<IActionResult> Create(Guid hotelId, [FromBody] CreateSubscriptionRequest request)
    {
        var result = await _subscriptionService.CreateSubscriptionAsync(request, hotelId);
        return Ok(result);
    }

    [HttpGet("{hotelId:guid}")]
    public async Task<IActionResult> Get(Guid hotelId)
    {
        var result = await _subscriptionService.GetSubscriptionAsync(hotelId);
        return result == null ? NotFound() : Ok(result);
    }
}

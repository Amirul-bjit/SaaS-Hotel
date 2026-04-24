using HotelBooking.Application.DTOs.Subscription;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.API.Controllers;

[ApiController]
[Route("subscriptions")]
[Authorize(Policy = "IsSuperAdmin")]
public class SubscriptionController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly ISubscriptionPlanConfigService _planConfigService;

    public SubscriptionController(
        ISubscriptionService subscriptionService,
        ISubscriptionPlanConfigService planConfigService)
    {
        _subscriptionService = subscriptionService;
        _planConfigService = planConfigService;
    }

    // ── Plan Config (SuperAdmin sets the terms) ────────────────────────────

    [HttpGet("plans")]
    public async Task<IActionResult> GetAllPlanConfigs()
    {
        var result = await _planConfigService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("plans/{planType}")]
    public async Task<IActionResult> GetPlanConfig(SubscriptionPlan planType)
    {
        var result = await _planConfigService.GetByPlanTypeAsync(planType);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPut("plans")]
    public async Task<IActionResult> UpsertPlanConfig([FromBody] UpsertPlanConfigRequest request)
    {
        var result = await _planConfigService.UpsertAsync(request);
        return Ok(result);
    }

    // ── Hotel Subscriptions ────────────────────────────────────────────────

    [HttpPost("{hotelId:guid}")]
    public async Task<IActionResult> Create(Guid hotelId, [FromBody] CreateSubscriptionRequest request)
    {
        var result = await _subscriptionService.CreateSubscriptionAsync(request, hotelId);
        return Ok(result);
    }

    [HttpPut("{hotelId:guid}")]
    public async Task<IActionResult> Update(Guid hotelId, [FromBody] CreateSubscriptionRequest request)
    {
        var result = await _subscriptionService.UpdateSubscriptionAsync(request, hotelId);
        return Ok(result);
    }

    [HttpGet("{hotelId:guid}")]
    public async Task<IActionResult> Get(Guid hotelId)
    {
        var result = await _subscriptionService.GetSubscriptionAsync(hotelId);
        return result == null ? NotFound() : Ok(result);
    }
}


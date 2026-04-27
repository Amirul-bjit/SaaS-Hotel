using HotelBooking.Infrastructure.Persistence;
using HotelBooking.Infrastructure.Seed;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.API.Controllers;

[ApiController]
[Route("admin")]
// [Authorize(Policy = "IsSuperAdmin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context) => _context = context;

    [HttpPost("reset-database")]
    public async Task<IActionResult> ResetDatabase()
    {
        await DataSeeder.ResetAndSeedAsync(_context);
        return Ok(new { message = "Database has been reset and re-seeded successfully." });
    }
}

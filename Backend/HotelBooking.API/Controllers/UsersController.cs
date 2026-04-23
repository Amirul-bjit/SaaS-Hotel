using HotelBooking.Application.DTOs.Auth;
using HotelBooking.Application.DTOs.User;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.API.Controllers;

[ApiController]
[Route("users")]
[Authorize(Policy = "IsSuperAdmin")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    public UsersController(IUserRepository userRepository) => _userRepository = userRepository;

    [HttpGet("owners")]
    public async Task<IActionResult> GetOwners()
    {
        var owners = await _userRepository.GetByRoleAsync(UserRole.HOTEL_OWNER);
        var result = owners.Select(u => new UserResponse
        {
            Id = u.Id,
            Name = u.Name,
            Email = u.Email,
            Role = u.Role.ToString()
        });
        return Ok(result);
    }

    [HttpPost("owners")]
    public async Task<IActionResult> CreateOwner([FromBody] CreateOwnerRequest request)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing != null)
            return Conflict(new { message = "Email already in use." });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.HOTEL_OWNER
        };
        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOwners), new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString()
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();
        await _userRepository.DeleteAsync(user);
        await _userRepository.SaveChangesAsync();
        return NoContent();
    }
}

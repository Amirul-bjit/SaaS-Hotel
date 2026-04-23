using HotelBooking.Application.DTOs.Auth;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using BCrypt.Net;

namespace HotelBooking.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IHotelRepository _hotelRepository;
    private readonly IJwtService _jwtService;

    public AuthService(IUserRepository userRepository, IHotelRepository hotelRepository, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _hotelRepository = hotelRepository;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing != null)
            throw new InvalidOperationException("Email already in use.");

        if (!Enum.TryParse<UserRole>(request.Role, ignoreCase: true, out var role))
            throw new ArgumentException("Invalid role.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);
        return new AuthResponse { Token = token, Name = user.Name, Email = user.Email, Role = user.Role.ToString() };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        Guid? hotelId = null;
        if (user.Role == UserRole.HOTEL_OWNER)
        {
            var hotel = await _hotelRepository.GetByOwnerIdAsync(user.Id);
            hotelId = hotel?.Id;
        }

        var token = _jwtService.GenerateToken(user, hotelId);
        return new AuthResponse { Token = token, Name = user.Name, Email = user.Email, Role = user.Role.ToString() };
    }
}

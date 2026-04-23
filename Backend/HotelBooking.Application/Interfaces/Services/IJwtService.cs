using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Interfaces.Services;

public interface IJwtService
{
    string GenerateToken(User user, Guid? hotelId = null);
}

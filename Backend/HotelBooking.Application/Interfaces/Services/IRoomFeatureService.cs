using HotelBooking.Application.DTOs.RoomType;

namespace HotelBooking.Application.Interfaces.Services;

public interface IRoomFeatureService
{
    Task<IEnumerable<RoomFeatureDto>> GetAllAsync();
}

using HotelBooking.Application.DTOs.Room;

namespace HotelBooking.Application.Interfaces.Services;

public interface IRoomService
{
    Task<RoomResponse> CreateRoomAsync(CreateRoomRequest request, Guid hotelId);
    Task<IEnumerable<RoomResponse>> GetRoomsByHotelAsync(Guid hotelId);
    Task<IEnumerable<RoomGlobalResponse>> GetAllRoomsAsync(decimal? minPrice, decimal? maxPrice, int? minGuests, string? location);
    Task<RoomGlobalResponse?> GetRoomByIdAsync(Guid id);
}

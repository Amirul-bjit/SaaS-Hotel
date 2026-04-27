using HotelBooking.Application.DTOs.Room;

namespace HotelBooking.Application.Interfaces.Services;

public interface IRoomService
{
    Task<RoomResponse> CreateRoomAsync(CreateRoomRequest request, Guid hotelId);
    Task DeleteRoomAsync(Guid roomId, Guid hotelId);
    Task<IEnumerable<RoomResponse>> GetRoomsByHotelAsync(Guid hotelId);
    Task<IEnumerable<RoomResponse>> GetRoomsByRoomTypeAsync(Guid roomTypeId);
}

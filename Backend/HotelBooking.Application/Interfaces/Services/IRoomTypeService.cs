using HotelBooking.Application.DTOs.RoomType;

namespace HotelBooking.Application.Interfaces.Services;

public interface IRoomTypeService
{
    Task<RoomTypeResponse> CreateAsync(CreateRoomTypeRequest request, Guid hotelId);
    Task<RoomTypeResponse> UpdateAsync(Guid id, UpdateRoomTypeRequest request, Guid hotelId);
    Task DeleteAsync(Guid id, Guid hotelId);
    Task<IEnumerable<RoomTypeResponse>> GetByHotelAsync(Guid hotelId);
    Task<RoomTypeResponse?> GetByIdAsync(Guid id);
}

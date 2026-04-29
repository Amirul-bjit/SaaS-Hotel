using HotelBooking.Application.DTOs.Hotel;

namespace HotelBooking.Application.Interfaces.Services;

public interface IHotelService
{
    Task<HotelResponse> CreateHotelAsync(CreateHotelRequest request, Guid ownerId);
    Task<HotelResponse?> GetHotelAsync(Guid hotelId);
    Task<IEnumerable<HotelResponse>> GetAllHotelsAsync();
    Task<IEnumerable<HotelPublicResponse>> GetAllHotelsPublicAsync();
    Task<HotelResponse?> ToggleHotelActiveAsync(Guid hotelId);
}

using HotelBooking.Application.DTOs.Hotel;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Services;

public class HotelService : IHotelService
{
    private readonly IHotelRepository _hotelRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;

    public HotelService(IHotelRepository hotelRepository, ISubscriptionRepository subscriptionRepository)
    {
        _hotelRepository = hotelRepository;
        _subscriptionRepository = subscriptionRepository;
    }

    public async Task<HotelResponse> CreateHotelAsync(CreateHotelRequest request, Guid ownerId)
    {
        var existing = await _hotelRepository.GetByOwnerIdAsync(ownerId);
        if (existing != null)
            throw new InvalidOperationException("This owner already has a hotel.");

        var hotel = new Hotel
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            OwnerId = ownerId,
            Location = request.Location
        };

        await _hotelRepository.AddAsync(hotel);
        await _hotelRepository.SaveChangesAsync();

        return MapToResponse(hotel);
    }

    public async Task<HotelResponse?> GetHotelAsync(Guid hotelId)
    {
        var hotel = await _hotelRepository.GetByIdAsync(hotelId);
        return hotel == null ? null : MapToResponse(hotel);
    }

    public async Task<IEnumerable<HotelResponse>> GetAllHotelsAsync()
    {
        var hotels = await _hotelRepository.GetAllAsync();
        return hotels.Select(MapToResponse);
    }

    public async Task<IEnumerable<HotelPublicResponse>> GetAllHotelsPublicAsync()
    {
        var activeHotelIds = await _subscriptionRepository.GetActiveHotelIdsAsync();
        var hotels = await _hotelRepository.GetAllAsync();
        return hotels
            .Where(h => activeHotelIds.Contains(h.Id))
            .Select(h => new HotelPublicResponse { Id = h.Id, Name = h.Name, Location = h.Location });
    }

    private static HotelResponse MapToResponse(Hotel hotel) =>
        new() { Id = hotel.Id, Name = hotel.Name, OwnerId = hotel.OwnerId, Location = hotel.Location };
}

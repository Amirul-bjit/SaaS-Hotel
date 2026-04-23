using HotelBooking.Application.DTOs.Room;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Interfaces.Services;
using HotelBooking.Domain.Entities;

namespace HotelBooking.Application.Services;

public class RoomService : IRoomService
{
    private readonly IRoomRepository _roomRepository;
    private readonly IInventoryRepository _inventoryRepository;

    public RoomService(IRoomRepository roomRepository, IInventoryRepository inventoryRepository)
    {
        _roomRepository = roomRepository;
        _inventoryRepository = inventoryRepository;
    }

    public async Task<RoomResponse> CreateRoomAsync(CreateRoomRequest request, Guid hotelId)
    {
        var room = new Room
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            Name = request.Name,
            Price = request.Price,
            TotalRooms = request.TotalRooms,
            MaxGuests = request.MaxGuests
        };

        await _roomRepository.AddAsync(room);
        await _roomRepository.SaveChangesAsync();

        // Auto-generate inventory for next 30 days
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var inventories = Enumerable.Range(0, 30)
            .Select(i => new Inventory
            {
                Id = Guid.NewGuid(),
                RoomId = room.Id,
                Date = today.AddDays(i),
                AvailableCount = room.TotalRooms
            }).ToList();

        await _inventoryRepository.AddRangeAsync(inventories);
        await _inventoryRepository.SaveChangesAsync();

        return MapToResponse(room);
    }

    public async Task<IEnumerable<RoomResponse>> GetRoomsByHotelAsync(Guid hotelId)
    {
        var rooms = await _roomRepository.GetByHotelIdAsync(hotelId);
        return rooms.Select(MapToResponse);
    }

    public async Task<IEnumerable<RoomGlobalResponse>> GetAllRoomsAsync(
        decimal? minPrice, decimal? maxPrice, int? minGuests, string? location)
    {
        var rooms = await _roomRepository.GetAllWithHotelAsync();

        IEnumerable<Room> filtered = rooms;
        if (minPrice.HasValue)
            filtered = filtered.Where(r => r.Price >= minPrice.Value);
        if (maxPrice.HasValue)
            filtered = filtered.Where(r => r.Price <= maxPrice.Value);
        if (minGuests.HasValue)
            filtered = filtered.Where(r => r.MaxGuests >= minGuests.Value);
        if (!string.IsNullOrWhiteSpace(location))
            filtered = filtered.Where(r =>
                r.Hotel.Location.Contains(location, StringComparison.OrdinalIgnoreCase));

        return filtered.Select(MapToGlobalResponse);
    }

    public async Task<RoomGlobalResponse?> GetRoomByIdAsync(Guid id)
    {
        var room = await _roomRepository.GetByIdWithHotelAsync(id);
        return room == null ? null : MapToGlobalResponse(room);
    }

    private static RoomResponse MapToResponse(Room room) =>
        new()
        {
            Id = room.Id,
            HotelId = room.HotelId,
            Name = room.Name,
            Price = room.Price,
            TotalRooms = room.TotalRooms,
            MaxGuests = room.MaxGuests
        };

    private static RoomGlobalResponse MapToGlobalResponse(Room room) =>
        new()
        {
            Id = room.Id,
            HotelId = room.HotelId,
            HotelName = room.Hotel?.Name ?? string.Empty,
            HotelLocation = room.Hotel?.Location ?? string.Empty,
            Name = room.Name,
            Price = room.Price,
            TotalRooms = room.TotalRooms,
            MaxGuests = room.MaxGuests
        };
}


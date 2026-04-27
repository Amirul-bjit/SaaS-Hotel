using HotelBooking.Application.DTOs.RoomType;
using HotelBooking.Application.Interfaces.Repositories;
using HotelBooking.Application.Services;
using HotelBooking.Domain.Entities;
using Moq;

namespace HotelBooking.Tests;

public class RoomTypeServiceTests
{
    private readonly Mock<IRoomTypeRepository> _roomTypeRepo = new();
    private readonly Mock<IRoomFeatureRepository> _featureRepo = new();
    private readonly RoomTypeService _sut;

    private readonly Guid _hotelId = Guid.NewGuid();

    public RoomTypeServiceTests()
    {
        _sut = new RoomTypeService(_roomTypeRepo.Object, _featureRepo.Object);
    }

    [Fact]
    public async Task CreateAsync_WithFeatures_CreatesRoomTypeWithFeatures()
    {
        // Arrange
        var featureId1 = Guid.NewGuid();
        var featureId2 = Guid.NewGuid();
        var request = new CreateRoomTypeRequest
        {
            Name = "Deluxe Suite",
            Description = "A premium suite",
            BasePrice = 299.99m,
            MaxGuests = 4,
            FeatureIds = new List<Guid> { featureId1, featureId2 }
        };

        var features = new List<RoomFeature>
        {
            new() { Id = featureId1, Name = "WiFi", Icon = "wifi" },
            new() { Id = featureId2, Name = "Pool", Icon = "pool" },
        };

        _featureRepo.Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync(features);

        RoomType? captured = null;
        _roomTypeRepo.Setup(r => r.AddAsync(It.IsAny<RoomType>()))
            .Callback<RoomType>(rt => captured = rt)
            .Returns(Task.CompletedTask);
        _roomTypeRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
        _roomTypeRepo.Setup(r => r.GetByIdWithFeaturesAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Guid id) =>
            {
                if (captured == null) return null;
                captured.RoomTypeFeatures = features.Select(f => new RoomTypeFeature
                {
                    RoomTypeId = captured.Id,
                    RoomFeatureId = f.Id,
                    RoomFeature = f
                }).ToList();
                return captured;
            });

        // Act
        var result = await _sut.CreateAsync(request, _hotelId);

        // Assert
        Assert.Equal("Deluxe Suite", result.Name);
        Assert.Equal(299.99m, result.BasePrice);
        Assert.Equal(4, result.MaxGuests);
        Assert.Equal(2, result.Features.Count);
        Assert.Contains(result.Features, f => f.Name == "WiFi");
        Assert.Contains(result.Features, f => f.Name == "Pool");
        _roomTypeRepo.Verify(r => r.AddAsync(It.IsAny<RoomType>()), Times.Once);
        _roomTypeRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithoutFeatures_CreatesRoomTypeEmpty()
    {
        var request = new CreateRoomTypeRequest
        {
            Name = "Standard Room",
            Description = "Basic room",
            BasePrice = 99.99m,
            MaxGuests = 2,
            FeatureIds = new List<Guid>()
        };

        RoomType? captured = null;
        _roomTypeRepo.Setup(r => r.AddAsync(It.IsAny<RoomType>()))
            .Callback<RoomType>(rt => captured = rt)
            .Returns(Task.CompletedTask);
        _roomTypeRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
        _roomTypeRepo.Setup(r => r.GetByIdWithFeaturesAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Guid id) =>
            {
                if (captured == null) return null;
                return captured;
            });

        var result = await _sut.CreateAsync(request, _hotelId);

        Assert.Equal("Standard Room", result.Name);
        Assert.Empty(result.Features);
    }

    [Fact]
    public async Task UpdateAsync_NotFound_ThrowsInvalidOperation()
    {
        _roomTypeRepo.Setup(r => r.GetByIdWithFeaturesAsync(It.IsAny<Guid>()))
            .ReturnsAsync((RoomType?)null);

        var request = new UpdateRoomTypeRequest
        {
            Name = "Updated", Description = "", BasePrice = 100, MaxGuests = 2,
            FeatureIds = new List<Guid>()
        };

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.UpdateAsync(Guid.NewGuid(), request, _hotelId));
    }

    [Fact]
    public async Task UpdateAsync_WrongHotel_ThrowsUnauthorized()
    {
        var rt = new RoomType
        {
            Id = Guid.NewGuid(),
            HotelId = Guid.NewGuid(), // different hotel
            Name = "Test",
            RoomTypeFeatures = new List<RoomTypeFeature>()
        };
        _roomTypeRepo.Setup(r => r.GetByIdWithFeaturesAsync(rt.Id)).ReturnsAsync(rt);

        var request = new UpdateRoomTypeRequest
        {
            Name = "Updated", Description = "", BasePrice = 100, MaxGuests = 2,
            FeatureIds = new List<Guid>()
        };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.UpdateAsync(rt.Id, request, _hotelId));
    }

    [Fact]
    public async Task DeleteAsync_NotFound_ThrowsInvalidOperation()
    {
        _roomTypeRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((RoomType?)null);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.DeleteAsync(Guid.NewGuid(), _hotelId));
    }

    [Fact]
    public async Task DeleteAsync_WrongHotel_ThrowsUnauthorized()
    {
        var rt = new RoomType { Id = Guid.NewGuid(), HotelId = Guid.NewGuid() };
        _roomTypeRepo.Setup(r => r.GetByIdAsync(rt.Id)).ReturnsAsync(rt);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _sut.DeleteAsync(rt.Id, _hotelId));
    }

    [Fact]
    public async Task DeleteAsync_ValidOwner_Deletes()
    {
        var rt = new RoomType { Id = Guid.NewGuid(), HotelId = _hotelId };
        _roomTypeRepo.Setup(r => r.GetByIdAsync(rt.Id)).ReturnsAsync(rt);
        _roomTypeRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        await _sut.DeleteAsync(rt.Id, _hotelId);

        _roomTypeRepo.Verify(r => r.Delete(rt), Times.Once);
        _roomTypeRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task GetByHotelAsync_ReturnsMappedResponses()
    {
        var featureId = Guid.NewGuid();
        var roomTypes = new List<RoomType>
        {
            new()
            {
                Id = Guid.NewGuid(), HotelId = _hotelId, Name = "Suite", Description = "Nice",
                BasePrice = 200, MaxGuests = 3,
                RoomTypeFeatures = new List<RoomTypeFeature>
                {
                    new() { RoomFeatureId = featureId, RoomFeature = new RoomFeature { Id = featureId, Name = "WiFi", Icon = "wifi" } }
                }
            }
        };

        _roomTypeRepo.Setup(r => r.GetByHotelIdAsync(_hotelId)).ReturnsAsync(roomTypes);

        var results = (await _sut.GetByHotelAsync(_hotelId)).ToList();

        Assert.Single(results);
        Assert.Equal("Suite", results[0].Name);
        Assert.Single(results[0].Features);
        Assert.Equal("WiFi", results[0].Features[0].Name);
    }
}

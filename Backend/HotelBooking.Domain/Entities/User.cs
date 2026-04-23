using HotelBooking.Domain.Enums;

namespace HotelBooking.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }

    // Navigation
    public Hotel? OwnedHotel { get; set; }
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

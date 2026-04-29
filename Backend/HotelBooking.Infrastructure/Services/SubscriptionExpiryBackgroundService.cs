using HotelBooking.Application.Interfaces.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HotelBooking.Infrastructure.Services;

public class SubscriptionExpiryBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SubscriptionExpiryBackgroundService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromHours(24);

    public SubscriptionExpiryBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<SubscriptionExpiryBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Subscription expiry background service started.");

        // Wait until the next 2:00 AM UTC for the first run
        var now = DateTime.UtcNow;
        var nextRun = now.Date.AddHours(2);
        if (nextRun <= now)
            nextRun = nextRun.AddDays(1);

        var initialDelay = nextRun - now;
        _logger.LogInformation("Next subscription expiry check scheduled at {NextRun} (in {Delay}).", nextRun, initialDelay);

        try
        {
            await Task.Delay(initialDelay, stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            await DeactivateExpiredSubscriptionsAsync();

            try
            {
                await Task.Delay(_period, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        _logger.LogInformation("Subscription expiry background service stopped.");
    }

    private async Task DeactivateExpiredSubscriptionsAsync()
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var subscriptionService = scope.ServiceProvider.GetRequiredService<ISubscriptionService>();
            var count = await subscriptionService.DeactivateExpiredSubscriptionsAsync();

            if (count > 0)
                _logger.LogInformation("Deactivated {Count} expired subscription(s).", count);
            else
                _logger.LogDebug("No expired subscriptions to deactivate.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating expired subscriptions.");
        }
    }
}

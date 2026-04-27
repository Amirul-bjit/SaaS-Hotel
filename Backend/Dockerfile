# --- Build stage ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first for layer caching
COPY HotelBooking.sln ./
COPY HotelBooking.API/HotelBooking.API.csproj ./HotelBooking.API/
COPY HotelBooking.Application/HotelBooking.Application.csproj ./HotelBooking.Application/
COPY HotelBooking.Domain/HotelBooking.Domain.csproj ./HotelBooking.Domain/
COPY HotelBooking.Infrastructure/HotelBooking.Infrastructure.csproj ./HotelBooking.Infrastructure/
COPY HotelBooking.Tests/HotelBooking.Tests.csproj ./HotelBooking.Tests/

RUN dotnet restore

# Copy all source files
COPY . .

RUN dotnet publish HotelBooking.API/HotelBooking.API.csproj -c Release -o /app/publish --no-restore

# --- Runtime stage ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "HotelBooking.API.dll"]

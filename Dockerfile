FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /app
COPY bin/Release/net5.0/publish/ ./
ENV TZ=Europe/Vienna

ENTRYPOINT ["dotnet", "lama.dll"]

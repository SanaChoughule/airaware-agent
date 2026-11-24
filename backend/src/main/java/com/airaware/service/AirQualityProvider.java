package com.airaware.service;

import com.airaware.model.AirQualityData;

public interface AirQualityProvider {
    String getProviderName();
    AirQualityData getCurrentAirQuality(double latitude, double longitude);
    AirQualityData getForecast(double latitude, double longitude);
}

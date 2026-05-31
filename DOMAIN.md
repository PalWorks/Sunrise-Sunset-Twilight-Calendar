# Domain Knowledge

This document explains the core business logic and specific terminology utilized within the Sandhya Calendar generation engine.

## Core Entities

### 1. Solar Noon Peak
Solar noon represents the exact moment the sun crosses the local meridian, reaching its highest elevation in the sky. Our application calculates this precise transit time and wraps it in a ten minute event window (five minutes prior and five minutes after) to denote the peak intensity period.

### 2. Sunrise and Sunset
Standard astronomical events marking the upper edge of the solar disk crossing the horizon. We generate fifteen minute calendar events starting exactly at these calculated transition times.

### 3. Sandhya Timings
Sandhya refers to the auspicious transitional periods of the day in Vedic terminology. 
* Morning Sandhya: A forty minute window centered on the exact moment of sunrise (starting twenty minutes prior to sunrise and ending twenty minutes after).
* Evening Sandhya: A forty minute window centered on the exact moment of sunset (starting twenty minutes prior to sunset and ending twenty minutes after).

### 4. Twilight Periods
* Civil Twilight: The period when the geometric center of the sun is less than six degrees below the horizon.
* Nautical Twilight: The period when the sun is between six and twelve degrees below the horizon.

## Geocoding Logic
Because solar calculations require absolute mathematical precision, all application inputs are strictly converted into geographical coordinates (Latitude and Longitude) rather than relying on abstract timezone strings. This ensures maximum accuracy regardless of political timezone boundary changes.

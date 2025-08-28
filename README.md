README.md

 SETU Web Development 2 - Assignment 

Author : Lovely Gregorio
Student: W20114829 
Github: https://github.com/lovelygregorio/


------------------------------------------
WeatherTopApp- Project README
-------------------------------------------
Project Overview

WeatherTops is a Node.js and express web application that allows users to create and manage personal weather stations, view real0time weather data, track 24 hours and access 5-day forecasts.

It integrates the OpenWeatherMap API to fetch live data such as temperature ,wind speed, pressure and conditions, and display them beautifully with weather icons and charts.


------------------------------------------------------------

Features:
- Add and Manage Weather Stations
- Live Weather Data from OpenWeatherMap API
- Auto-Generate weather reports
- Simple 24 Hour (3hourly) Trend Graphs 
- 5 Day Extended Forecasts
- Station Map View using OpenStreetMap Integration  
- Min/Max Tracking for Temp, Wind & Pressure
- User Authentication & Session Management
- Responsive UI using Bulma CSS


Project Release Overview:

Baseline - add and list stations, open details page 
Release 1 - manual weather reports, weather codes, deployed.
Release 2 - added wind direction, min/max data, signup/login.
Release 3 - time/date reports, station summary dashboard.
Release 4 - auto-generate reports, 24-hour graphs, 5-day forecasts.

------------------------------------------------------------

Getting Started with the WeatherTopApp

1. Clone the repository:
git clone https://github.com/lovelygregorio/
cd

2. Install dependencies
npm install

3. configure .env file
OPENWEATHER_KEY=Lovely_api_key

4. start the server
npm start

App will run on http://localhost:4000

API Integration

OpenWeatherMap API Endpoints:

- Current Weather:
 https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}

- Forecast (24 hour & 5 day):
 https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}

- Weather Icons:
 https://openweathermap.org/weather-conditions#Icon-list



--------------------
2025AUGUST
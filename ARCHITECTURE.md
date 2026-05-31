# System Architecture

The Sandhya Calendar application utilizes a fully decoupled architecture optimized for the Cloudflare ecosystem.

## Components

### 1. Cloudflare Pages Frontend
* Location: frontend directory
* Role: Serves the static HTML, CSS, and client side JavaScript logic. 
* Key Responsibilities:
  1. Geocoding resolution via the OpenStreetMap Nominatim API.
  2. Rendering the three column layout UI.
  3. Generating a static calendar file natively in the browser via the SunCalc library.
  4. Rendering the visual monthly grid and handling image and PDF exports.

### 2. Cloudflare Workers Backend
* Location: worker directory
* Role: Serverless API endpoint responding to dynamic calendar subscriptions.
* Key Responsibilities:
  1. Parsing latitude and longitude query parameters from incoming requests.
  2. Dynamically calculating thirty days of solar events on the fly using the SunCalc module.
  3. Generating a compliant iCalendar text string formatted for seamless ingestion by calendar client applications.

## External Dependencies
* OpenStreetMap Nominatim: Free API utilized for translating city strings into geographical coordinates.
* SunCalc: Core mathematical library utilized on both the frontend and backend to calculate precise solar positions.
* HTML2Canvas: Frontend library utilized to snap DOM elements into PNG images for export.

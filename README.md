# Yoga Sadhana Calendar

A highly precise, serverless application engineered to calculate exact astronomical and solar timings based on localized geographic coordinates. This suite offers a zero maintenance, globally scalable utility for generating custom calendar events including Sunrise, Sunset, Solar Noon, and specific Vedic Sandhya transition periods.

## Application Overview

The primary objective of this project is to provide practitioners with an aesthetically stunning, mathematically rigorous tool to align their daily practices with traditional cosmic cycles. By leveraging edge computing and client side generation, the tool guarantees absolute privacy, lightning fast load times, and dynamic device synchronization.

### Core Features

* Natively Responsive Interface: A beautifully crafted, glassmorphic UI optimized for both mobile and desktop viewports.
* Client Side Static Export: Users can generate a robust one year calendar directly inside their web browser. This process is completely secure and operates without transferring personal coordinate data to external servers.
* Dynamic Calendar Sync: For modern digital workflows, the application generates a Webcal subscription URL. This URL seamlessly integrates with Apple Calendar, Google Calendar, and Microsoft Outlook, fetching daily updates automatically.
* Visual Monthly Grid: A dynamic preview modal allowing users to visually audit the calculated timings before downloading a high resolution PNG or a perfectly scaled PDF.
* Precise Geolocation Integration: A custom interactive map powered by OpenStreetMap allows for pinpoint accuracy in location selection, complete with a visual pulsing marker and an automated "Locate Me" function.

## Technical Implementation

The repository is structured into two distinct operational environments, both optimized for deployment on the Cloudflare infrastructure:

### 1. Frontend Client
Navigate into the `frontend` directory. This module contains the visual application built entirely with vanilla HTML, CSS, and JavaScript. 
* To develop locally, open `index.html` in any modern web browser or serve it via a local development server.
* To deploy, push this folder directly to Cloudflare Pages for instant global availability.

### 2. Backend Edge Worker
Navigate into the `worker` directory. This serverless API manages the dynamic iCalendar subscription requests.
* Use the official Cloudflare Wrangler CLI tool to install dependencies via `npm install`.
* Test the API locally using the `wrangler dev` command.
* Deploy the worker to the edge network using `wrangler deploy`.

## Contribution and Development

When developing within this repository, agents and developers must strictly adhere to the formatting rule defined by the core maintainers: absolutely no hyphens, double hyphens, triple hyphens, or em dashes are permitted in any generated text, documentation, or code comments. Bullet points must utilize asterisks.

## Documentation Index

Please refer to the following supplementary documents for deeper technical insights:

* ARCHITECTURE.md: Explains the decoupling of frontend client logic from the backend worker API.
* AGENTS.md: Provides explicit behavioral rules and context for AI systems interacting with this repository.
* DOMAIN.md: Defines the mathematical and astrological entities, such as Sandhya timings, driving the application logic.
* MEMORY.md: Documents the historical architectural decisions, including the strategic migration away from legacy PHP infrastructure.

## Acknowledgments

The mathematical foundation and domain logic for this project were originally inspired by the previous iteration of the calendar engine. We express our gratitude to all prior contributors who helped lay the groundwork for these precise astrological calculations.

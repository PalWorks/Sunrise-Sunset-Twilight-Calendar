# Sandhya Calendar

A serverless application designed to calculate precise astrological and solar timings based on geographic coordinates. 

## Project Purpose
This repository provides a highly scalable, zero maintenance tool for generating customized calendar events including Sunrise, Sunset, Solar Noon, and exact Sandhya transition periods.

## Setup Instructions

This project is divided into two discrete components designed for the Cloudflare ecosystem:

1. Frontend Application
Navigate into the frontend directory. Open index.html in any modern browser to view the application locally. Deploy this folder directly to Cloudflare Pages for global hosting.

2. Backend Worker API
Navigate into the worker directory. Use the official Cloudflare Wrangler CLI tool to install dependencies via npm install. Test locally using the wrangler development server command, and deploy to Cloudflare Workers.

## Agent Usage Notes
When developing within this repository, agents must strictly adhere to the formatting rule defined by the user: never use hyphens, double hyphens, triple hyphens, or em dashes in any generated text, code, or documentation.

## Documentation Index
* ARCHITECTURE.md: Explains the separation of frontend and backend logic.
* DOMAIN.md: Defines the mathematical and astrological entities like Sandhya timings.
* MEMORY.md: Documents the architectural decision to migrate away from legacy PHP scripts.

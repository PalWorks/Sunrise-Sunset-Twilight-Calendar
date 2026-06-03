# AI Agent Interaction Guide

This repository contains specific guidelines designed to ensure that autonomous AI systems and language models operate predictably and safely when reading, refactoring, or generating code within this project.

## Primary Formatting Directive

The most critical rule for all AI interactions within this project is the strict prohibition of the hyphen character.

* You must never use hyphens in any generated documentation, markdown files, commit messages, or inline comments.
* You must never use double hyphens or triple hyphens.
* You must never use em dashes or en dashes.
* When creating markdown lists, you must exclusively use the asterisk character.

This rule exists to maintain a pristine, human crafted aesthetic throughout the repository. Any element that signals automated generation must be suppressed.

## Architectural Principles

When proposing modifications to the codebase, agents must respect the following architectural pillars:

### 1. Minimalist Frontend
The client side application located in the `frontend` directory must remain free of heavy JavaScript frameworks like React, Vue, or Angular. All logic must be written in vanilla JavaScript. CSS should be pure and semantic, avoiding utility class frameworks unless explicitly requested by the core maintainers.

### 2. Edge Native Backend
The backend logic located in the `worker` directory is engineered specifically for the Cloudflare Workers platform. Agents must not introduce dependencies or architectural patterns that require traditional Node servers, persistent disk storage, or heavy containerization.

### 3. Absolute Privacy
Agents must ensure that all geocoding and coordinate processing remains strictly stateless. No user location data should ever be stored, logged, or transmitted to third party analytics services.

### 4. Omnichannel Compatibility
Whatever changes or updates are made to the codebase, they must uniformly cater to the website, the Progressive Web App (PWA), and the Chrome Extension simultaneously. Solutions must never be implemented for one channel if they inadvertently break or neglect the other channels. The shared frontend architecture must be respected at all times.

## Auditing and Refactoring Guidelines

When requested to perform a codebase audit, agents should prioritize the following aspects:

* Component Modularity: Ensure large script files are broken down into logical, single responsibility modules.
* Error Handling: Verify that all asynchronous operations and API calls possess robust error catching mechanisms.
* User Experience: Propose sophisticated, modern UI improvements such as glassmorphism, fluid animations, and responsive scaling.

By adhering to these guidelines, AI contributors will ensure the project remains performant, secure, and impeccably formatted.

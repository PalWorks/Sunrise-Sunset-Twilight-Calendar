# Persistent Memory and Architecture Decisions

This document captures historical architectural pivots and long term design constraints.

## Migration from Legacy PHP to Cloudflare
The original repository was constructed using standard server side PHP scripts. During a technical audit, it was decided to completely abandon this approach in favor of the Cloudflare network.

### Rationale
1. Maintenance Burden: The PHP repository required a server to run, forcing the developer to manage operating systems, Docker containers, SSL certificates, and security updates. Cloudflare requires zero maintenance.
2. Codebase Decay: The PHP scripts utilized deprecated functions and contained a critical undefined variable bug within the timezone resolution logic.
3. Scalability Economics: Providing a dynamic, automatically syncing calendar feed for millions of users via a traditional backend would generate massive cloud compute bills. Moving the calculation logic to Cloudflare Workers edge compute drastically reduced processing costs. Offloading static file generation to the client browser eliminated backend costs entirely for standard users.

## Constraints and Assumptions
1. Frontend Purity: The frontend must remain a vanilla HTML, CSS, and JavaScript implementation. Heavy build tools or complex frameworks like React are strictly avoided to ensure maximum performance and minimal complexity for a single page utility application.
2. Zero Backend Storage: We assume absolute user privacy. The backend Cloudflare Worker API contains no database and logs no persistent coordinate data. All calculations are strictly stateless and executed on the fly upon request.

# Security handoff

## What is protected now

- The public pages do not show an admin link or edit controls.
- The hidden admin route requires a password check and has a five-attempt, one-minute browser-session cooldown.
- Project text is HTML-escaped before it is rendered, and outgoing project links only accept `http` or `https` URLs.
- The password is no longer kept as readable text in the browser code.

## Important limitation

This portfolio is currently a static website. A browser-based login and a password hash in JavaScript are **not real access control**: a determined attacker can inspect or change browser code. Do not treat the current admin area as secure after publishing it.

## Required backend protections

Before you publish the admin system, implement these on the server:

1. Store a salted password hash using Argon2id or bcrypt in environment variables or a database—never in frontend files.
2. Use HTTPS only and enable HSTS.
3. Create server-side sessions with `HttpOnly`, `Secure`, and `SameSite=Strict` cookies.
4. Protect every `/admin` API endpoint with authentication and authorization checks.
5. Apply server-side validation, output encoding, and URL allow-lists to all profile and project fields.
6. Rate-limit sign-in requests by IP and account; log failures without logging passwords.
7. Add CSRF protection for state-changing requests and a restrictive Content Security Policy.
8. Keep secrets in `.env` files outside Git, rotate credentials if exposed, and back up the database.

## Suggested API shape

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/portfolio`
- `PUT /api/portfolio/profile`
- `POST /api/portfolio/projects`
- `PUT /api/portfolio/projects/:id`
- `DELETE /api/portfolio/projects/:id`

The frontend should call those endpoints over HTTPS. The server, not `app.js`, must decide whether an edit is allowed.

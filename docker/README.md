This directory contains an old manual Docker setup that previously served `lewisportlions.club` outside Coolify.

Current production rule:
- Production must route to the latest Coolify deployment only.
- Do not point host nginx at a manually managed container for this app.
- Do not restore `docker-compose.yml` here as the live path.

Notes:
- The old compose file was renamed to `docker-compose.manual-obsolete.yml` to avoid accidental reuse.
- If a manual local container is ever needed for testing, keep it off the live domain and off the production port/proxy path.

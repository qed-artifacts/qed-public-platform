# QED-AI Public Platform

Shared, configuration-driven renderer and deployment workflow for QED-AI's public
domain portals.

Each domain repository owns its content, application catalog, and release history.
This repository owns the presentation system, schemas, validation rules, and the
reusable GitHub Pages workflow. A compatible platform change can therefore update
many portals without duplicating source edits.

## Build a portal locally

```text
node bin/build-domain.mjs --source ../qed-domain-higher-education --out dist
```

The renderer uses only Node.js built-ins. It reads `domain.json` and
`apps/catalog.json`, validates their contracts, and generates a complete static
site. Browser applications already present under `apps/<slug>/` are copied into
the release output.

## Compatibility policy

- `schemaVersion: 1` remains supported throughout the platform's 1.x lifecycle.
- Additive fields may be introduced without a migration.
- Renamed, removed, or behavior-changing fields require a migration script and a
  new major schema version.
- Domain repositories retain independent Git history and can pin a platform
  revision if a future release requires staged adoption.

Public visibility does not itself grant a reuse license. A formal open-source and
content-licensing policy will be added after organizational approval.


# Public platform architecture

## Separation of concerns

1. **Domain model** — machine-readable configuration in each domain repository.
2. **Public content** — domain copy, app manifests, and approved public assets.
3. **Presentation** — renderer, design tokens, metadata, and accessibility rules
   maintained here.
4. **Deployment** — one reusable workflow publishing static output to GitHub
   Pages.
5. **Registry** — cross-domain discovery and system state maintained separately
   in `qed-public-registry`.

The renderer accepts stable identifiers rather than local filesystem paths. Site
configuration is declarative, and generated output is disposable. This permits a
future framework, ontology, visual system, or hosting change without rewriting the
underlying domain records.

## Change classes

- **Content change:** edit one domain configuration or app manifest.
- **Compatible platform change:** edit this renderer; all next deployments use it.
- **Coordinated change:** update schemas and ship a migration across affected
  domain repositories.
- **Paradigm change:** introduce a parallel major schema and renderer, migrate
  repositories incrementally, then deprecate the prior contract.

## Security boundary

Only unrestricted public material belongs in the generated site or its source
repository. Restricted originals, full-text copyrighted corpora, private drafts,
governance evidence, and confidential records remain in Microsoft 365. Secrets
belong in managed secret stores or deployment environments, never source files.


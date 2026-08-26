import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function arg(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const catalogPath = path.resolve(arg("--catalog"));
const outputRoot = path.resolve(arg("--out"));
const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));

const workflow = `name: Deploy domain portal

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    uses: qed-artifacts/qed-public-platform/.github/workflows/deploy-domain.yml@main
`;

const agents = `# Public domain portal boundaries

This repository is an unrestricted public website owned by the \`qed-artifacts\`
GitHub organization. Do not add credentials, private correspondence, signatures,
meeting recordings, residential addresses, internal governance records, or
restricted source files.

Keep the site static-first and GitHub Pages compatible. Browser-only apps may be
added under \`apps/<slug>/\` when every input, output, asset, and dependency is safe
for public access. Anything requiring authentication, secrets, durable writes,
uploads, or sensitive data belongs in a separate service and repository.

Domain labels and boundaries are provisional. Preserve stable identifiers and
redirects when a portal is split, merged, nested, renamed, or deprecated. Do not
infer a permanent taxonomy from legacy source-folder names.
`;

function domainConfig(item) {
  const [first, second, third] = item.dimensions;
  return {
    schemaVersion: 1,
    slug: item.slug,
    portalNumber: item.portalNumber,
    portalName: `${item.name} Quality Portal`,
    shortLabel: `${item.name} Portal`,
    canonicalUrl: `https://qedartifacts.org/${item.slug}/`,
    repository: `qed-artifacts/${item.slug}`,
    status: "Seed portal — source and scope mapping queued",
    scopeStatus: "Provisional; may split, merge, nest, or broaden",
    metaDescription: `QED-AI's developing public portal for ${item.name.toLowerCase()} quality research, evidence maps, reusable artifacts, and lightweight applications.`,
    hero: {
      lines: [item.name, "made more reviewable."],
      lead: `A dedicated public space for examining how quality is framed, evidenced, experienced, governed, and improved across ${item.name.toLowerCase()} contexts.`
    },
    scopeNotice: "This seed portal reflects a source-corpus signal, not an adopted permanent taxonomy. It may become a parent, child, peer, merged portal, or redirect as evidence and use cases clarify the boundary.",
    focus: {
      title: `A provisional field of view for ${item.name.toLowerCase()}.`,
      note: "These lenses organize early discovery without making the portal mutually exclusive from other domains.",
      items: [
        {kicker: "01 / CONCEPTS", title: first, description: `Clarify how ${first.toLowerCase()} shape quality claims, criteria, and warranted interpretations in this domain.`},
        {kicker: "02 / PRACTICE", title: second, description: `Map how ${second.toLowerCase()} are evidenced, operationalized, contested, and improved in practice.`},
        {kicker: "03 / CONSEQUENCES", title: third, description: `Examine how ${third.toLowerCase()} affect people, systems, decisions, equity, and public value.`}
      ]
    },
    pathway: {
      title: "Build evidence before certainty.",
      note: "Each release should expose its source basis, boundary assumptions, uncertainty, intended users, and responsible-use limits.",
      items: [
        {title: "Inventory", description: "Register and fingerprint relevant sources without freezing the taxonomy."},
        {title: "Map", description: "Identify concepts, tensions, overlaps, measures, and missing perspectives."},
        {title: "Prototype", description: "Develop bounded guides, rubrics, visualizations, and browser tools."},
        {title: "Review", description: "Publish provenance, limitations, revisions, and warranted use."}
      ]
    },
    apps: {title: "Lightweight tools, isolated by domain.", note: "Released tools will run in the browser and will not accept confidential records. More complex or sensitive services receive their own security boundary."},
    methods: {
      title: "Domain-specific does not mean siloed.",
      lead: `${item.name} has distinctive language, evidence practices, institutions, and consequences. This portal preserves those distinctions while keeping cross-domain relationships explicit.`,
      principles: [
        {title: "Provenance before polish", description: "Public outputs identify what they draw from and where interpretation enters."},
        {title: "Boundaries remain visible", description: "Overlap, disagreement, and taxonomy changes are recorded instead of silently erased."},
        {title: "Revisable by design", description: "Configuration, applications, and URLs support refinement, decomposition, roll-up, and redirects."}
      ]
    },
    theme: {accent: item.theme?.accent ?? "#2d6f7d", accentSoft: item.theme?.accentSoft ?? "#d9e9ec"},
    contact: "contact@qedartifacts.org",
    legalStatus: "QED-AI is a Virginia nonstock corporation. Federal tax-exempt recognition is pending; this portal does not claim that recognition has been granted or that contributions are tax-deductible."
  };
}

for (const item of catalog.domains) {
  const root = path.join(outputRoot, `qed-domain-${item.slug}`);
  await fs.mkdir(path.join(root, ".github", "workflows"), {recursive: true});
  await fs.mkdir(path.join(root, "apps"), {recursive: true});
  const appCatalog = {
    schemaVersion: 1,
    domain: item.slug,
    apps: [
      {slug: "domain-framing-canvas", name: `${item.name} Framing Canvas`, summary: "A planned browser-only workspace for bounding a quality question, affected groups, evidence, constraints, and responsible next steps.", status: "Planned", version: null, path: null},
      {slug: "source-map-explorer", name: `${item.name} Source Map`, summary: "A planned public explorer for reviewed source relationships, concepts, methods, overlaps, and limitations.", status: "Research queue", version: null, path: null}
    ]
  };
  const readme = `# QED-AI ${item.name} Domain Portal

Public, organization-owned seed portal: <https://qedartifacts.org/${item.slug}/>

This repository provides an independent release boundary for public ${item.name.toLowerCase()} research maps, artifacts, and lightweight browser applications. It contains no private source corpus, board record, signature, recording, credential, or confidential information.

## Provisional boundary

The source corpus contains a legacy folder signal for this area, but that folder is not an adopted taxonomy. This portal may later split, merge, nest, broaden, narrow, or become a maintained redirect. Stable identifiers and recorded transitions preserve references through those changes.

## Publishing

GitHub Pages validates \`domain.json\` and \`apps/catalog.json\`, then builds through \`qed-artifacts/qed-public-platform\`. Public browser-only tools may live under \`apps/<slug>/\`; anything requiring secrets, private data, durable writes, or authentication requires a separate security boundary.
`;
  await Promise.all([
    fs.writeFile(path.join(root, "domain.json"), `${JSON.stringify(domainConfig(item), null, 2)}\n`),
    fs.writeFile(path.join(root, "README.md"), readme),
    fs.writeFile(path.join(root, "AGENTS.md"), agents),
    fs.writeFile(path.join(root, ".gitignore"), "dist/\n"),
    fs.writeFile(path.join(root, ".github", "CODEOWNERS"), "* @dochabski\n"),
    fs.writeFile(path.join(root, ".github", "workflows", "pages.yml"), workflow),
    fs.writeFile(path.join(root, "apps", "catalog.json"), `${JSON.stringify(appCatalog, null, 2)}\n`),
    fs.writeFile(path.join(root, "apps", "README.md"), "# Public application workspace\n\nOnly static, public, browser-only tools belong here. Register each tool in `catalog.json`.\n")
  ]);
  console.log(root);
}

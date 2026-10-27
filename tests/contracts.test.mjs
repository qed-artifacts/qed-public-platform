import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const output = await fs.mkdtemp(path.join(os.tmpdir(), "qed-platform-"));
const run = spawnSync(process.execPath, ["bin/build-domain.mjs", "--source", "examples/domain", "--out", output], { encoding: "utf8" });
assert.equal(run.status, 0, run.stderr);
const html = await fs.readFile(path.join(output, "index.html"), "utf8");
assert.match(html, /Example Quality Portal/);
assert.match(html, /https:\/\/qedartifacts\.org\/example\//);
assert.match(html, /name="theme-color" content="#173546"/);
const css = await fs.readFile(path.join(output, "assets", "styles.css"), "utf8");
assert.match(css, /--accent: #176b91;/);
assert.match(css, /--domain-accent: #2d6f7d;/);
assert.doesNotMatch(css, /__ACCENT__/);
const catalog = JSON.parse(await fs.readFile(path.join(output, "apps", "catalog.json"), "utf8"));
assert.equal(catalog.domain, "example");
await fs.rm(output, { recursive: true, force: true });
console.log("Platform contract test passed");


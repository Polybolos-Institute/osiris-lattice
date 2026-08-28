/**
 * Live check against anduril-mock-lattice (stdlib mock).
 * Starts the sibling mock if PYTHONPATH can import it, else expects
 * MOCK already on 127.0.0.1:8765.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { configFromEnv } from "../src/config.ts";
import { fetchAccessToken, getEntity, putEntity } from "../src/latticeClient.ts";
import { entityToFeature } from "../src/toGeoJSON.ts";

const ROOT = dirname(fileURLToPath(import.meta.url));
const MOCK_DIR = join(ROOT, "..", "..", "mock-lattice");

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitHealth(base: string, timeoutMs: number): Promise<void> {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      const res = await fetch(`${base}/health`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await sleep(150);
  }
  throw new Error(`mock-lattice health timeout at ${base}`);
}

async function main(): Promise<void> {
  process.env.LATTICE_ENDPOINT ??= "127.0.0.1:8765";
  process.env.LATTICE_CLIENT_ID ??= "test-client-id";
  process.env.LATTICE_CLIENT_SECRET ??= "test-client-secret";
  process.env.LATTICE_ENV_TOKEN ??= "test-sandbox-token";

  const config = configFromEnv();
  if (!config) throw new Error("config missing");
  const base = `http://${config.endpoint}`;

  let child: ChildProcess | undefined;
  try {
    await waitHealth(base, 400);
  } catch {
    child = spawn("python", ["-m", "mock_lattice"], {
      cwd: MOCK_DIR,
      stdio: "inherit",
      env: { ...process.env, MOCK_LATTICE_PORT: "8765" },
    });
    await waitHealth(base, 8000);
  }

  const token = await fetchAccessToken(config);
  const entityId = "osiris-lattice-prove-001";
  await putEntity(config, token, {
    entityId,
    aliases: { name: "Prove Track" },
    isLive: true,
    location: {
      position: { latitudeDegrees: 32.501, longitudeDegrees: -93.662 },
    },
    ontology: {
      template: "TEMPLATE_TRACK",
      platformType: "ADS-B AIRPLANE",
      specificType: "",
    },
    milView: {
      disposition: "DISPOSITION_UNKNOWN",
      environment: "ENVIRONMENT_AIR",
    },
    provenance: { dataType: "adsb", integrationName: "osiris-lattice-prove" },
  });

  const got = await getEntity(config, token, entityId);
  const feature = entityToFeature(got);
  if (!feature) throw new Error("GET entity did not convert to GeoJSON");
  if (feature.properties.platformType !== "ADS-B AIRPLANE") {
    throw new Error(`ontology lost: ${feature.properties.platformType}`);
  }
  if (feature.properties.failClosedClass !== "ADS-B AIRPLANE") {
    throw new Error("fail-closed dropped a known platformType");
  }

  console.log("osiris-lattice prove:mock OK");
  console.log(`  oauth token prefix=${token.slice(0, 12)}`);
  console.log(`  entity ${entityId} platformType=${feature.properties.platformType}`);
  console.log(`  disposition=${feature.properties.disposition}`);

  if (child?.pid) child.kill();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

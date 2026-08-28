import assert from "node:assert/strict";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { test } from "node:test";
import { fetchAccessToken, streamEntities } from "../src/latticeClient.ts";
import { snapshotLattice } from "../src/index.ts";
import type { LatticeConfig } from "../src/config.ts";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c as Buffer));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

test("HTTP client: OAuth + NDJSON stream against a local mock", async () => {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? "";
    if (req.method === "POST" && url === "/api/v1/oauth/token") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ access_token: "mock-access-token", expires_in: 1800 }));
      return;
    }
    if (req.method === "POST" && url === "/api/v1/entities/stream") {
      await readBody(req);
      const line = JSON.stringify({
        entity: {
          entityId: "http-1",
          aliases: { name: "HTTP Track" },
          location: { position: { latitudeDegrees: 10, longitudeDegrees: 20 } },
          ontology: { platformType: "UAV" },
          milView: { disposition: "DISPOSITION_FRIENDLY", environment: "ENVIRONMENT_AIR" },
        },
      });
      res.writeHead(200, { "Content-Type": "application/x-ndjson" });
      res.end(`${line}\n{"heartbeat":{}}\n`);
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  if (!addr || typeof addr === "string") throw new Error("no port");
  const cfg: LatticeConfig = {
    endpoint: `127.0.0.1:${addr.port}`,
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    sandboxToken: "test-sandbox-token",
    enabled: true,
    streamTimeoutMs: 3000,
  };

  try {
    const token = await fetchAccessToken(cfg);
    assert.equal(token, "mock-access-token");
    const entities = await streamEntities(cfg, token);
    assert.equal(entities[0]?.ontology?.platformType, "UAV");

    const snap = await snapshotLattice({ config: cfg, enabled: true });
    assert.equal(snap.connected, true);
    assert.equal(snap.features[0]?.properties.platformType, "UAV");

    const off = await snapshotLattice({ config: cfg, enabled: false });
    assert.equal(off.connected, false);
    assert.equal(off.features.length, 0);
    assert.equal(off.error, "Lattice disconnected");
  } finally {
    await new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
  }
});

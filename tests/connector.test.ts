import assert from "node:assert/strict";
import { test } from "node:test";
import { configFromEnv, latticeBaseUrl } from "../src/config.ts";
import {
  failClosedClassLabel,
  isGenericPlatformType,
  resolveOntologyClassLabel,
} from "../src/ontology.ts";
import { parseNdjsonEntities } from "../src/latticeClient.ts";
import { entitiesToFeatureCollection, entityToFeature } from "../src/toGeoJSON.ts";

test("localhost Lattice endpoint uses HTTP", () => {
  assert.equal(latticeBaseUrl("127.0.0.1:8765"), "http://127.0.0.1:8765");
  assert.equal(latticeBaseUrl("https://127.0.0.1:8765"), "http://127.0.0.1:8765");
});

test("sandbox endpoint stays HTTPS", () => {
  assert.equal(
    latticeBaseUrl("lattice-abc.env.sandboxes.developer.anduril.com:443"),
    "https://lattice-abc.env.sandboxes.developer.anduril.com:443",
  );
});

test("LATTICE_SANDBOX_TOKEN aliases LATTICE_ENV_TOKEN", () => {
  const cfg = configFromEnv({
    LATTICE_ENDPOINT: "127.0.0.1:8765",
    LATTICE_CLIENT_ID: "id",
    LATTICE_CLIENT_SECRET: "secret",
    LATTICE_SANDBOX_TOKEN: "bearer",
  });
  assert.ok(cfg);
  assert.equal(cfg.sandboxToken, "bearer");
  assert.equal(cfg.enabled, true);
});

test("LATTICE_ENABLED=0 disconnects without dropping credentials", () => {
  const cfg = configFromEnv({
    LATTICE_ENDPOINT: "127.0.0.1:8765",
    LATTICE_CLIENT_ID: "id",
    LATTICE_CLIENT_SECRET: "secret",
    LATTICE_ENV_TOKEN: "bearer",
    LATTICE_ENABLED: "0",
  });
  assert.ok(cfg);
  assert.equal(cfg.enabled, false);
});

test("ontology uses platformType first", () => {
  assert.equal(
    resolveOntologyClassLabel({ platformType: "ADS-B AIRPLANE", specificType: "ignored" }),
    "ADS-B AIRPLANE",
  );
});

test("generic platformType falls through to specificType", () => {
  assert.ok(isGenericPlatformType("AIR VEHICLE"));
  assert.equal(
    resolveOntologyClassLabel({ platformType: "AIR VEHICLE", specificType: "UAV" }),
    "UAV",
  );
});

test("fail-closed never invents SMALL_UAS", () => {
  assert.equal(failClosedClassLabel({}), null);
  assert.equal(failClosedClassLabel({ platformType: "UNKNOWN AIR VEHICLE" }), null);
  assert.equal(failClosedClassLabel({ platformType: "UAV" }), "UAV");
});

test("GeoJSON keeps ontology fields", () => {
  const feature = entityToFeature({
    entityId: "trk-1",
    aliases: { name: "Track One" },
    location: {
      position: { latitudeDegrees: 32.5, longitudeDegrees: -93.7 },
      velocity: { speedMps: 40, headingDegrees: 90 },
    },
    ontology: {
      template: "TEMPLATE_TRACK",
      platformType: "ADS-B AIRPLANE",
      specificType: "",
    },
    milView: { disposition: "DISPOSITION_UNKNOWN", environment: "ENVIRONMENT_AIR" },
    provenance: { dataType: "adsb", integrationName: "example" },
  });
  assert.ok(feature);
  assert.deepEqual(feature.geometry.coordinates, [-93.7, 32.5]);
  assert.equal(feature.properties.platformType, "ADS-B AIRPLANE");
  assert.equal(feature.properties.disposition, "DISPOSITION_UNKNOWN");
  assert.equal(feature.properties.failClosedClass, "ADS-B AIRPLANE");
  assert.equal(feature.properties.source, "LATTICE");
});

test("NDJSON stream parser keeps entity events and skips heartbeats", () => {
  const raw = [
    '{"heartbeat":{}}',
    '{"entity":{"entityId":"a","location":{"position":{"latitudeDegrees":1,"longitudeDegrees":2}},"ontology":{"platformType":"UAV"}}}',
    "not-json",
    "",
  ].join("\n");
  const entities = parseNdjsonEntities(raw);
  assert.equal(entities.length, 1);
  assert.equal(entities[0]?.entityId, "a");
  const fc = entitiesToFeatureCollection(entities);
  assert.equal(fc.total_entities, 1);
  assert.equal(fc.features[0]?.properties.platformType, "UAV");
  assert.equal(fc.connected, true);
});

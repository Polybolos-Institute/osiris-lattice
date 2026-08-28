import { configFromEnv, type LatticeConfig } from "./config.ts";
import { fetchAccessToken, streamEntities } from "./latticeClient.ts";
import {
  disconnectedCollection,
  entitiesToFeatureCollection,
  type LatticeFeatureCollection,
} from "./toGeoJSON.ts";

export type SnapshotOptions = {
  config?: LatticeConfig | null;
  enabled?: boolean;
};

/**
 * One-shot COP snapshot: token + short entity stream + GeoJSON.
 * If disabled or unconfigured, returns an empty collection (disconnect).
 * Does not map Lattice types into any engagement ICD.
 */
export async function snapshotLattice(options: SnapshotOptions = {}): Promise<LatticeFeatureCollection> {
  const config = options.config === undefined ? configFromEnv() : options.config;
  const enabled = options.enabled ?? config?.enabled ?? false;
  if (!enabled) return disconnectedCollection("Lattice disconnected");
  if (!config) return disconnectedCollection("Lattice not configured");

  try {
    const token = await fetchAccessToken(config);
    const entities = await streamEntities(config, token);
    return entitiesToFeatureCollection(entities);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lattice fetch failed";
    return { ...disconnectedCollection(message), connected: false };
  }
}

export { configFromEnv, latticeBaseUrl, isConfigured } from "./config.ts";
export type { LatticeConfig } from "./config.ts";
export {
  failClosedClassLabel,
  isGenericPlatformType,
  isUnknownClassLabel,
  resolveOntologyClassLabel,
} from "./ontology.ts";
export type { LatticeEntity, LatticeMilView, LatticeOntology, LatticeProvenance } from "./ontology.ts";
export { fetchAccessToken, getEntity, parseNdjsonEntities, putEntity, streamEntities } from "./latticeClient.ts";
export {
  disconnectedCollection,
  entitiesToFeatureCollection,
  entityToFeature,
} from "./toGeoJSON.ts";
export type { LatticeFeature, LatticeFeatureCollection, LatticeFeatureProperties } from "./toGeoJSON.ts";

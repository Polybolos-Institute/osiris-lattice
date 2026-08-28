# osiris-lattice

Generic **Anduril Lattice** connector for [Osiris](https://github.com/simplifaisoul/osiris) and other Next.js OSINT maps.

Built by [Polybolos Institute](https://www.polybolos.org).
**Independent sample. Not an Anduril product.**

Osiris without this kit is a wide-area OSINT dashboard: flights, cameras, fires, news. Dots on a globe. Most dots are untyped public feeds.

Osiris **with** this kit can sit on a live Lattice world model. Every track keeps Lattice ontology (`platformType`, `specificType`, disposition, environment, provenance). Unknown stays unknown. Connect and disconnect without deleting credentials. That is what turns Osiris from a picture of the world into an **ontology COP**: a common picture of *what each object is*, in the same vocabulary Lattice already uses.

Full write-up: [docs/OSIRIS_ONTOLOGY.md](docs/OSIRIS_ONTOLOGY.md)

No C2. No ROE. No engagement ICD. This kit does not fire weapons and does not invent combat class.

## What this allows you to do with Osiris

1. **Join a Lattice environment** from an Osiris-style app using the same OAuth path other Lattice doors use (`/api/v1/oauth/token`, Sandboxes Bearer, then entity stream).
2. **See typed tracks**, not anonymous cyan dots. Click a point and read platform, subtype, friend/foe/unknown, air/surface/space, and which sensor published it.
3. **Fail closed.** Empty or `UNKNOWN AIR VEHICLE` does not become `SMALL_UAS` or a fighter so the map looks busy. Blanks stay blanks.
4. **Connect and disconnect.** `LATTICE_ENABLED=0` stops token and stream. Secrets can stay in env. Osiris keeps running every other layer.
5. **Develop against Lattice without a live sandbox.** Point at [anduril-mock-lattice](https://github.com/Polybolos-Institute/anduril-mock-lattice) on localhost HTTP.
6. **Publish a track** (`putEntity`) if you are writing a door. Defaults for ADS-B / AIS / unknown live in [anduril-lattice-sandbox-dx](https://github.com/Polybolos-Institute/anduril-lattice-sandbox-dx). Uncorrelated public ADS-B stays disposition unknown.
7. **Build toward a serious Lattice platform** on top of open Osiris: OSINT layers plus a typed object catalog. Your C2 or engagement engine (if you have one) remains a separate product. This connector does not replace it.

## Capabilities (this repo)

| Capability | Status |
|------------|--------|
| Client-credentials OAuth + Sandboxes header | Yes |
| Entity stream (NDJSON) snapshot for a map | Yes |
| PUT / GET entity | Yes |
| GeoJSON with ontology fields preserved | Yes |
| platformType first, specificType if platform is generic | Yes |
| Fail-closed unknown (no invented combat class) | Yes |
| Enable flag = disconnect | Yes |
| Localhost HTTP for mock Lattice | Yes |
| Lattice C2 clone (Cesium, tasking, missions) | No |
| Engagement / ROE / authority | No |
| Mapping Lattice types into a private ICD | No (your C2, not this kit) |

## Files

| Path | Purpose |
|------|---------|
| [`docs/OSIRIS_ONTOLOGY.md`](docs/OSIRIS_ONTOLOGY.md) | Why Osiris + Lattice is an ontology system, and what it is not |
| [`docs/CONNECT.md`](docs/CONNECT.md) | Connect and disconnect |
| [`docs/ONTOLOGY.md`](docs/ONTOLOGY.md) | Fields this kit preserves |
| [`src/latticeClient.ts`](src/latticeClient.ts) | Token, stream, PUT/GET |
| [`src/ontology.ts`](src/ontology.ts) | Class label rules |
| [`src/toGeoJSON.ts`](src/toGeoJSON.ts) | Map features |
| [`examples/next-route.ts`](examples/next-route.ts) | Drop-in `app/api/lattice/route.ts` |

## Quick start (mock Lattice)

```bash
git clone https://github.com/Polybolos-Institute/osiris-lattice.git
cd osiris-lattice
npm install
npm test
```

In another terminal, from [anduril-mock-lattice](https://github.com/Polybolos-Institute/anduril-mock-lattice):

```bash
python -m mock_lattice
```

Then:

```bash
npm run prove:mock
```

Live Sandboxes: copy `.env.example`, fill `LATTICE_*`, set `LATTICE_ENABLED=1`. Token names: [anduril-lattice-sandbox-dx](https://github.com/Polybolos-Institute/anduril-lattice-sandbox-dx).

## Related

- [Osiris](https://github.com/simplifaisoul/osiris) - optional consumer. This repo is the connector source, not a fork of Osiris.
- [anduril-mock-lattice](https://github.com/Polybolos-Institute/anduril-mock-lattice)
- [anduril-lattice-sandbox-dx](https://github.com/Polybolos-Institute/anduril-lattice-sandbox-dx)
- [anduril-lattice-stream-watcher](https://github.com/Polybolos-Institute/anduril-lattice-stream-watcher)

## License

MIT - see [LICENSE](LICENSE).

Anduril and Lattice are trademarks of Anduril Industries.
This is an independent sample, not an Anduril product.

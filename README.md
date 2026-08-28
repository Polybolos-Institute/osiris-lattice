# osiris-lattice

Generic **Anduril Lattice** connector for [Osiris](https://github.com/simplifaisoul/osiris)-style Next.js apps: OAuth, entity stream, GeoJSON with ontology fields left intact, connect/disconnect without deleting credentials.

Built by [Polybolos Institute](https://www.polybolos.org).
**Independent sample - not an Anduril product.**

No C2. No ROE. No engagement ICD. Unknown types stay unknown.

## What you get

| Path | Purpose |
|------|---------|
| [`src/latticeClient.ts`](src/latticeClient.ts) | Token, NDJSON stream, PUT/GET entity |
| [`src/ontology.ts`](src/ontology.ts) | platformType first, fail-closed unknown |
| [`src/toGeoJSON.ts`](src/toGeoJSON.ts) | Entities to map features, ontology kept |
| [`examples/next-route.ts`](examples/next-route.ts) | Drop-in `app/api/lattice/route.ts` |
| [`docs/CONNECT.md`](docs/CONNECT.md) | Connect and disconnect |
| [`docs/ONTOLOGY.md`](docs/ONTOLOGY.md) | Fields this kit preserves |

## Quick start (mock Lattice)

Needs [anduril-mock-lattice](https://github.com/Polybolos-Institute/anduril-mock-lattice) on port 8765.

```bash
git clone https://github.com/Polybolos-Institute/osiris-lattice.git
cd osiris-lattice
npm install
npm test
```

In another terminal, from the mock repo:

```bash
python -m mock_lattice
```

Then:

```bash
npm run prove:mock
```

Live Sandboxes: copy `.env.example`, fill `LATTICE_*`, set `LATTICE_ENABLED=1`. Auth details: [anduril-lattice-sandbox-dx](https://github.com/Polybolos-Institute/anduril-lattice-sandbox-dx).

## Disconnect

`LATTICE_ENABLED=0` stops token and stream. Credentials can stay in env.

## Related

- [anduril-mock-lattice](https://github.com/Polybolos-Institute/anduril-mock-lattice)
- [anduril-lattice-sandbox-dx](https://github.com/Polybolos-Institute/anduril-lattice-sandbox-dx)
- [anduril-lattice-stream-watcher](https://github.com/Polybolos-Institute/anduril-lattice-stream-watcher)
- Public Osiris: optional consumer. This repo is the source of the connector, not a fork of Osiris.

## License

MIT - see [LICENSE](LICENSE).

Anduril and Lattice are trademarks of Anduril Industries.
This is an independent sample, not an Anduril product.

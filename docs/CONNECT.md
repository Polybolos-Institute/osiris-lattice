# Connect / disconnect

Credentials stay in env. The enable flag is the feed switch.

If you want a live Anduril Lattice sandbox, join the Lattice developer program here: [https://www.anduril.com/lattice/lattice-sdk](https://www.anduril.com/lattice/lattice-sdk). Mock Lattice on localhost does not require that.

## Connect

1. Copy `.env.example` to `.env` and fill values, or export them.
2. Against [anduril-mock-lattice](https://github.com/Polybolos-Institute/anduril-mock-lattice) use HTTP localhost defaults in `.env.example`.
3. Against a live Sandboxes env set `LATTICE_ENDPOINT` to `host:443` (no `https://` required). Use the **Sandboxes Bearer** in `LATTICE_ENV_TOKEN`. Do not put the Lattice UI password or the Environment JWT in that variable. See [anduril-lattice-sandbox-dx auth checklist](https://github.com/Polybolos-Institute/anduril-lattice-sandbox-dx/blob/main/docs/AUTH_CHECKLIST.md).
4. Set `LATTICE_ENABLED=1`.
5. Call `snapshotLattice()` or copy `examples/next-route.ts` to `app/api/lattice/route.ts`.

Osiris (or any Next app): keep the layer hidden until `GET /api/lattice?probe=1` returns `configured: true`. That requires `LATTICE_ENABLED=1` and complete credentials, not merely leftover env.

When connected, `snapshotLattice()` returns GeoJSON **with ontology still on each feature**. That is the whole point. If you strip `platformType` in your route, you are back to untyped dots and this kit is wasted.

## Disconnect

Set `LATTICE_ENABLED=0` (or `false`). `snapshotLattice()` returns an empty FeatureCollection with `connected: false` and `error: "Lattice disconnected"`. No token call. No stream.

Leave credentials in place unless you are done with that sandbox.

Hard disconnect: disable the flag, then unset `LATTICE_CLIENT_SECRET` and `LATTICE_ENV_TOKEN`.

## What this does not do

- It does not publish OSINT into Lattice unless you call `putEntity` yourself.
- It does not map types into a C2 / ROE / engagement ICD.
- It does not clone Lattice C2.

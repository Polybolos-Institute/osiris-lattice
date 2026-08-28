# Connect / disconnect

Credentials stay in env. The enable flag is the feed switch.

## Connect

1. Copy `.env.example` to `.env` and fill values, or export them.
2. Against [anduril-mock-lattice](https://github.com/Polybolos-Institute/anduril-mock-lattice) use HTTP localhost defaults in `.env.example`.
3. Against a live Sandboxes env set `LATTICE_ENDPOINT` to `host:443` (no `https://` required). Use the **Sandboxes Bearer** in `LATTICE_ENV_TOKEN`. Do not put the Lattice UI password or the Environment JWT in that variable. See [anduril-lattice-sandbox-dx auth checklist](https://github.com/Polybolos-Institute/anduril-lattice-sandbox-dx/blob/main/docs/AUTH_CHECKLIST.md).
4. Set `LATTICE_ENABLED=1`.
5. Call `snapshotLattice()` or copy `examples/next-route.ts` to `app/api/lattice/route.ts`.

Osiris (or any Next app): layer off until this returns `connected: true`.

## Disconnect

Set `LATTICE_ENABLED=0` (or `false`). `snapshotLattice()` returns an empty FeatureCollection with `connected: false` and `error: "Lattice disconnected"`. No token call. No stream.

Leave credentials in place unless you are done with that sandbox.

Hard disconnect: disable the flag, then unset `LATTICE_CLIENT_SECRET` and `LATTICE_ENV_TOKEN`.

## What this does not do

- It does not publish OSINT into Lattice unless you call `putEntity` yourself.
- It does not map types into a C2 / ROE / engagement ICD.
- It does not clone Lattice C2.

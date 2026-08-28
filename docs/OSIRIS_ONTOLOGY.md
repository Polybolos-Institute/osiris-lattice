# Osiris + Lattice: an ontology COP, not another OSINT layer

This document is the reason the connector exists. Read it before treating `osiris-lattice` as "one more map tile."

## The problem

[Osiris](https://github.com/simplifaisoul/osiris) is a strong open-source global intelligence map. It already aggregates public aviation, maritime, cameras, hazards, news, and recon tools.

What it does **not** do, by itself, is speak **Lattice ontology**.

On a typical OSINT map a track is a lat/lon plus a label you invented (`flight`, `ship`, `dot`). Two feeds can mean two different words for the same object. A drone, a loitering munition, and an airliner can look like the same glyph. When you later try to plug that picture into Anduril Lattice, or into any C2 that already types the world, you either throw the type away or you guess. Guessing is how people invent `SMALL_UAS` for empty class.

Lattice already has a type system. Every live entity can carry:

- `ontology.platformType` (the Lattice Platform vocabulary: UAV, ADS-B airplane, Zumwalt, unknown air vehicle, and hundreds more)
- `ontology.specificType` when the platform field is too generic
- `milView.disposition` (hostile, friendly, unknown, ...)
- `milView.environment` (air, surface, space, ...)
- `provenance` (which integration / sensor published it)
- `entityId` (stable identity on the wire)

That package **is** an ontology in the operational sense: a shared catalog of what objects are, who typed them, and how sure the type is (including explicit unknown).

The goal of this project is to let **Osiris sit on that catalog** without becoming Lattice C2 and without becoming an engagement engine.

## What we are trying to accomplish

**Make open Osiris a serious platform for people who develop on Lattice.**

Not a screenshot of Lattice. Not a clone of the Lattice UI. A **typed common operating picture** that:

1. Pulls live (or mock) Lattice entities.
2. **Keeps the ontology on the wire all the way to the map feature.** No collapse to "hostile drone" unless you add that later in a private product.
3. Lets an operator **connect** (credentials + enable) and **disconnect** (enable off, Osiris still works).
4. Treats unknown as a first-class bucket. Fail closed. Do not invent class to look operational.
5. Leaves **engage / ROE / authority** in whatever C2 the user already has. Osiris does not authorize shots.

If you operate a private downstream (for example a decision engine that maps Lattice Platform into a closed threat code), that mapping stays **your** product. This kit stops at Lattice vocabulary.

## What "ontology system" means here

It does **not** mean a research knowledge graph, OWL, or a new taxonomy we invented.

It means:

| Layer | Owner | Job |
|-------|--------|-----|
| Lattice | Anduril environment you are allowed to use | System of record for live entity type |
| This connector | Your Osiris (or similar) app | Auth, stream, GeoJSON, fail-closed helpers |
| Osiris map | Osiris | Inspect, filter, count, leave unknown visible |
| Optional C2 | Not this repo | Map known types into engage codes; refuse unknown |

Three columns on one object (the product idea):

1. **Lattice type** - what Lattice says (`platformType` / `specificType`)
2. **Osiris display** - name, lat/lon, speed, heading
3. **Fail-closed class** - resolved label, or `null` if unknown/empty

Mismatch between (1) and (3) is signal. Inventing a type to force agreement is a bug.

## What you can actually do after you wire this into Osiris

### As an Osiris operator / integrator

- Turn Lattice **off** and Osiris is unchanged: public OSINT only.
- Turn Lattice **on** (`LATTICE_ENABLED=1` plus OAuth env) and a **Lattice Tracks** (or equivalent) layer appears when the probe says configured.
- Click a track and read ontology instead of a cartoon class.
- Filter later by Platform / disposition / environment using fields that are already on the feature (the connector ships the fields; your UI adds chips when you want them).
- Point at mock Lattice in CI or on a laptop with no sandbox.
- Point at a real Sandboxes env when you have credentials. Use the Sandboxes Bearer in `LATTICE_ENV_TOKEN`. Do not put the Lattice UI password there.

### As a Lattice door developer

- Use the same token and PUT path as other Polybolos samples.
- Put ontology on every publish. If you do not know the type, publish `UNKNOWN AIR VEHICLE` or skip. Do not pick a combat class to "be helpful."
- Public ADS-B should stay `DISPOSITION_UNKNOWN` unless your product has actually classified it.
- Osiris can **display** those doors. It should not silently reclassify them.

### As someone building a larger stack

- Osiris becomes the **wide-area typed COP**.
- Lattice remains the **live type store**.
- A separate engagement product may consume Lattice (or a mapped ICD) fail-closed. That product is not Osiris and is not this connector.
- Disconnecting Osiris from Lattice must not be required to keep that C2 alive. They are different connect switches.

## What this does not allow

- Tasking, missions, Assign Task, Anduril tiles, or a Lattice C2 clone.
- Declaring friend/foe as a moral or legal finding. Disposition is a field on the entity, not a verdict you should launder into "Osiris decided."
- Predicting that a type will transfer crash rates or tactics from one airframe to another. Ontology is identity and class, not a physics proof.
- Shipping secrets. No tokens in git. Disconnect does not require wiping env unless you are done with that sandbox.

## Default off (Osiris)

For a drop-in Osiris route, treat the layer as **unconfigured** until `LATTICE_ENABLED=1` **and** endpoint / client id / secret / env token are set. Probe `GET /api/lattice?probe=1` should return `{ configured: false }` on a stock Osiris install. That matches other optional Osiris feeds (scanner, Cloudflare Radar): hidden until you opt in.

## Mental model

```
Public OSINT feeds ---------> Osiris map (untyped dots)
                                      ^
Lattice world model --(this kit)--+   |
  ontology + milView + provenance     |
                                      |
Enable flag off: right-hand arrow cut. Left-hand OSINT still runs.
```

Osiris plus this kit is how an open OSINT shell becomes a Lattice-capable **ontology front end**. Lattice still owns the types. Osiris learns to show them honestly.

## Related reading

- [CONNECT.md](CONNECT.md) - connect / disconnect
- [ONTOLOGY.md](ONTOLOGY.md) - field table and lookup rule
- Upstream connector repo: this file lives in [osiris-lattice](https://github.com/Polybolos-Institute/osiris-lattice)
- Osiris project: [simplifaisoul/osiris](https://github.com/simplifaisoul/osiris)

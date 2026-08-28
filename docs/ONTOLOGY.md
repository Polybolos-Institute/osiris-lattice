# Ontology fields this connector keeps

Lattice types tracks with `ontology` plus `milView` and `provenance`. This kit **passes those fields through**. It does not invent a combat class.

## Lookup rule

1. Use `ontology.platformType` when it is present and not generic (`AIR VEHICLE` / `OBJECT_CLASS_AIR_VEHICLE`).
2. Otherwise use `ontology.specificType`.
3. If the label is empty or an unknown bucket (`UNKNOWN`, `UNKNOWN AIR VEHICLE`, `UNKNOWN VEHICLE`), `failClosedClass` is `null`. Do not substitute `SMALL_UAS` or a fighter type to make the map look busy.

`template`, `disposition`, and `environment` are **not** class. Show them. Do not classify from them.

## GeoJSON properties

Each point feature includes:

| Property | Source |
|----------|--------|
| `platformType` | `ontology.platformType` |
| `specificType` | `ontology.specificType` |
| `ontologyTemplate` | `ontology.template` |
| `ontologyLabel` | resolved label (step 1-2) |
| `failClosedClass` | resolved label or `null` |
| `disposition` | `milView.disposition` |
| `environment` | `milView.environment` |
| `provenanceDataType` | `provenance.dataType` |
| `provenanceIntegration` | `provenance.integrationName` |

## Publish defaults

If you later publish tracks *into* Lattice, start from the cheat sheet in [anduril-lattice-sandbox-dx](https://github.com/Polybolos-Institute/anduril-lattice-sandbox-dx/blob/main/ontology/README.md). Uncorrelated public ADS-B stays `DISPOSITION_UNKNOWN`. Unknown air stays unknown.

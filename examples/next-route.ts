/**
 * Optional Next.js App Router example. Copy into app/api/lattice/route.ts.
 * Default off until LATTICE_ENABLED=1 and credentials are set.
 */
import { snapshotLattice } from "../src/index.ts";

export async function GET() {
  const collection = await snapshotLattice();
  const status = collection.connected ? 200 : collection.error === "Lattice not configured" ? 503 : 200;
  return Response.json(collection, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

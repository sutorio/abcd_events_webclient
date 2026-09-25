/**
 * Explanatory tests for the throwaway mock API.
 *
 * In dev, the browser hits same-origin `/api/...` on Vite. The plugin bridges
 * that to a loopback json-server (see `vite-plugin.ts`). These tests talk to
 * that same loopback server directly — so they document the REST shape without
 * spinning up HTTPS Vite.
 *
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startMockServer } from "./vite-plugin.ts";

let origin: string;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ origin, close } = await startMockServer());
});

afterAll(async () => {
  await close();
});

async function api(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return await fetch(new URL(path, origin), init);
}

describe("mock REST (json-server over mock/db.json)", () => {
  it("exposes one profile and one organisation (MVP singletons as arrays-of-one)", async () => {
    const profile = await (await api("/profile/1")).json();
    const organisation = await (await api("/organisation/1")).json();

    expect(profile).toMatchObject({ id: 1, name: expect.any(String) });
    expect(organisation).toMatchObject({
      id: 1,
      name: expect.any(String),
      description: expect.any(String),
    });
  });

  it("lists events with listing fields the public UI will need", async () => {
    const events = await (await api("/events")).json();

    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toMatchObject({
      id: expect.any(Number),
      organisationId: 1,
      title: expect.any(String),
      startsAt: expect.any(String),
      venue: expect.any(String),
      description: expect.any(String),
    });
  });

  it("keeps customers + bookings empty until a booking screen writes them", async () => {
    expect(await (await api("/customers")).json()).toEqual([]);
    expect(await (await api("/bookings")).json()).toEqual([]);
  });

  it("persists PATCH back into db.json (and we restore the seed name)", async () => {
    const before = await (await api("/profile/1")).json();

    const patched = await (
      await api("/profile/1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Temp Test Name" }),
      })
    ).json();
    expect(patched.name).toBe("Temp Test Name");

    // Prove a fresh read sees the write (same process, living file).
    const reread = await (await api("/profile/1")).json();
    expect(reread.name).toBe("Temp Test Name");

    await api("/profile/1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: before.name }),
    });
  });

  it("filters with query strings — bookings for an event (admin 'who's coming')", async () => {
    // Shape we'll use later: POST /customers, POST /bookings { customerId, eventId },
    // then GET /bookings?eventId=1. Empty filter still returns [].
    const forEvent = await (await api("/bookings?eventId=1")).json();
    expect(forEvent).toEqual([]);
  });
});

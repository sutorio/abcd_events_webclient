/**
 * Explanatory tests for the org-scoped mock API (ky + resources + ops).
 *
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApi, ensureCustomer, type KyInstance } from "../src/api-client.ts";
import {
  booking,
  bookings,
  event,
  events,
  memberships,
  organisation,
  priceTier,
  ticket,
  tickets,
  user,
  venue,
} from "../src/api-resources.ts";
import { startMockServer } from "./vite-plugin.ts";

const organisationId = 1;

let api: KyInstance;
let close: () => Promise<void>;

beforeAll(async () => {
  const mock = await startMockServer();
  close = mock.close;
  api = createApi(`${mock.origin}/`);
});

afterAll(async () => {
  await close();
});

describe("org-scoped mock shape", () => {
  it("keeps User outside the org box, linked via Membership", async () => {
    const found = await api.get(user.path(1)).json(user.schema);
    const forUser = await api
      .get(memberships.path, { searchParams: { userId: 1 } })
      .json(memberships.schema);

    expect(found.email).toContain("@");
    expect(forUser).toEqual([
      expect.objectContaining({
        userId: 1,
        organisationId: 1,
        role: "owner",
      }),
    ]);
  });

  it("organisation references a Venue; featured lives on Event", async () => {
    const org = await api
      .get(organisation.path(organisationId))
      .json(organisation.schema);
    const foundVenue = await api
      .get(venue.path(org.defaultVenueId))
      .json(venue.schema);

    expect(foundVenue.organisationId).toBe(1);
    expect(foundVenue.name.length).toBeGreaterThan(0);
    expect(foundVenue.coordinates).toEqual(
      expect.objectContaining({
        lat: expect.any(Number),
        lng: expect.any(Number),
      }),
    );

    const featured = (
      await api
        .get(events.path, {
          searchParams: { organisationId, featured: true },
        })
        .json(events.schema)
    )[0];
    expect(featured?.featured).toBe(true);
    expect(featured?.organisationId).toBe(1);
  });

  it("public Events use visibility + per-Event price tiers (not a global TicketType)", async () => {
    const publicEvents = await api
      .get(events.path, {
        searchParams: { organisationId, visibility: "public" },
      })
      .json(events.schema);
    expect(publicEvents).toHaveLength(2);
    expect(publicEvents.every((e) => e.visibility === "public")).toBe(true);

    const tiers = await api
      .get(priceTier.list.path, {
        searchParams: { organisationId, eventId: publicEvents[0]!.id },
      })
      .json(priceTier.list.schema);
    expect(tiers.map((t) => t.label).sort()).toEqual([
      "Adult",
      "Baby",
      "Child",
    ]);
    expect(tiers.find((t) => t.label === "Baby")?.consumesCapacity).toBe(false);
  });

  it("records a party Booking with tier-based Tickets", async () => {
    const publicEvent = (
      await api
        .get(events.path, {
          searchParams: { organisationId, visibility: "public" },
        })
        .json(events.schema)
    )[0]!;
    const tiers = await api
      .get(priceTier.list.path, {
        searchParams: { organisationId, eventId: publicEvent.id },
      })
      .json(priceTier.list.schema);
    const adultTier = tiers.find((t) => t.label === "Adult")!;
    const childTier = tiers.find((t) => t.label === "Child")!;
    const babyTier = tiers.find((t) => t.label === "Baby")!;

    const payer = await ensureCustomer(api, {
      email: "parent@example.com",
      name: "Alex Parent",
      phone: "+447700900001",
      marketingOptIn: true,
    });
    expect(payer.organisationId).toBe(1);

    const createdBooking = await api
      .post(bookings.path, {
        json: {
          organisationId,
          customerId: payer.id,
          eventId: publicEvent.id,
          status: "paid",
          stripeSessionId: null,
          createdAt: new Date().toISOString(),
        },
      })
      .json(booking.schema);

    const adult = await api
      .post(tickets.path, {
        json: {
          organisationId,
          bookingId: createdBooking.id,
          priceTierId: adultTier.id,
          name: "Alex Parent",
          phone: "+447700900001",
          ageYears: null,
          responsibleAdultTicketId: null,
        },
      })
      .json(ticket.schema);

    await api
      .post(tickets.path, {
        json: {
          organisationId,
          bookingId: createdBooking.id,
          priceTierId: childTier.id,
          name: "Sam",
          phone: null,
          ageYears: 6,
          responsibleAdultTicketId: adult.id,
        },
      })
      .json(ticket.schema);

    await api
      .post(tickets.path, {
        json: {
          organisationId,
          bookingId: createdBooking.id,
          priceTierId: babyTier.id,
          name: "Jo",
          phone: null,
          ageYears: 0,
          responsibleAdultTicketId: adult.id,
        },
      })
      .json(ticket.schema);

    const partyTickets = await api
      .get(tickets.path, {
        searchParams: {
          organisationId,
          bookingId: createdBooking.id,
        },
      })
      .json(tickets.schema);
    expect(partyTickets).toHaveLength(3);

    const paid = partyTickets.filter((t) => {
      const tier = tiers.find((x) => x.id === t.priceTierId);
      return tier?.consumesCapacity;
    });
    expect(paid).toHaveLength(2);

    // Schema round-trip on a single Event fetch
    await api.get(event.path(publicEvent.id)).json(event.schema);
  });
});

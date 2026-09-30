/**
 * Resource catalogue — paths + response schemas.
 * Call sites use HTTP verbs: `api.get(user.path(id)).json(user.schema)`.
 */
import {
  BookingSchema,
  BookingsSchema,
  CreateBookingInputSchema,
  CreateCustomerInputSchema,
  CreateTicketInputSchema,
  CustomerSchema,
  CustomersSchema,
  EventSchema,
  EventsSchema,
  MembershipSchema,
  MembershipsSchema,
  OrganisationSchema,
  PriceTierSchema,
  TicketSchema,
  TicketsSchema,
  UserSchema,
  VenueSchema,
  VenuesSchema,
} from "./api-schema.ts";

export const user = {
  path: (id: number) => `users/${id}`,
  schema: UserSchema,
} as const;

export const memberships = {
  path: "memberships",
  schema: MembershipsSchema,
  item: MembershipSchema,
} as const;

export const organisation = {
  path: (id: number) => `organisation/${id}`,
  schema: OrganisationSchema,
} as const;

export const venue = {
  path: (id: number) => `venues/${id}`,
  schema: VenueSchema,
} as const;

export const venues = {
  path: "venues",
  schema: VenuesSchema,
} as const;

export const event = {
  path: (id: number) => `events/${id}`,
  schema: EventSchema,
} as const;

export const events = {
  path: "events",
  schema: EventsSchema,
} as const;

export const priceTier = {
  path: (id: number) => `priceTiers/${id}`,
  schema: PriceTierSchema,
  list: {
    path: "priceTiers",
    schema: PriceTierSchema.array(),
  },
} as const;

export const customer = {
  path: (id: number) => `customers/${id}`,
  schema: CustomerSchema,
} as const;

export const customers = {
  path: "customers",
  schema: CustomersSchema,
  createSchema: CreateCustomerInputSchema,
} as const;

export const booking = {
  path: (id: number) => `bookings/${id}`,
  schema: BookingSchema,
} as const;

export const bookings = {
  path: "bookings",
  schema: BookingsSchema,
  createSchema: CreateBookingInputSchema,
} as const;

export const ticket = {
  path: (id: number) => `tickets/${id}`,
  schema: TicketSchema,
} as const;

export const tickets = {
  path: "tickets",
  schema: TicketsSchema,
  createSchema: CreateTicketInputSchema,
} as const;

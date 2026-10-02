/**
 * Zod schemas for the AbCD Events API sketch (SSOT for shapes).
 * Types are inferred — do not duplicate as hand-written interfaces.
 *
 * Tenancy: almost everything is scoped to an Organisation. Users live outside
 * that box and join Orgs via Membership (many-to-many). Day-one mock has one Org.
 */
import { z } from "zod";

/** Wall-clock event time without offset (e.g. `2026-11-14T14:00:00`). */
export const PlainDateTimeStringSchema = z.string().refine(
  (value) => {
    try {
      Temporal.PlainDateTime.from(value);
      return true;
    } catch {
      return false;
    }
  },
  { error: "Invalid PlainDateTime" },
);
export const EventVisibilitySchema = z.enum(["public", "private"]);
export type EventVisibility = z.infer<typeof EventVisibilitySchema>;

export const BookingStatusSchema = z.enum(["paid", "cancelled"]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const MembershipRoleSchema = z.enum(["owner", "member"]);
export type MembershipRole = z.infer<typeof MembershipRoleSchema>;

/** E.164 — store international form (e.g. +447700900001); normalise on input. */
export const PhoneSchema = z.e164();
export type Phone = z.infer<typeof PhoneSchema>;

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

/** User — outside the Organisation data box (auth/identity). */
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
});
export type User = z.infer<typeof UserSchema>;

/** User ↔ Organisation (many-to-many). */
export const MembershipSchema = z.object({
  id: z.number(),
  userId: z.number(),
  organisationId: z.number(),
  role: MembershipRoleSchema,
});
export type Membership = z.infer<typeof MembershipSchema>;

export const VenueSchema = z.object({
  id: z.number(),
  organisationId: z.number(),
  name: z.string(),
  /** Free-text for now; split later if needed. */
  address: z.string(),
  coordinates: CoordinatesSchema,
});
export type Venue = z.infer<typeof VenueSchema>;

export const OrganisationSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  about: z.string(),
  contactEmail: z.email(),
  contactPhone: PhoneSchema,
  defaultVenueId: z.number(),
  branding: z.string(),
});
export type Organisation = z.infer<typeof OrganisationSchema>;

export const EventSchema = z.object({
  id: z.number(),
  organisationId: z.number(),
  venueId: z.number(),
  visibility: EventVisibilitySchema,
  /** Homepage hero — at most one true per Organisation (enforced later). */
  featured: z.boolean(),
  title: z.string(),
  startsAt: PlainDateTimeStringSchema,
  description: z.string(),
  /** Max Tickets that consume capacity (see PriceTier.consumesCapacity). */
  capacity: z.number().int().nonnegative(),
});
export type Event = z.infer<typeof EventSchema>;

/**
 * Fare / age band for an Event — replaces a global adult|child|baby enum.
 * Ticket references a tier; label + age bounds define what “child” means here.
 */
export const PriceTierSchema = z.object({
  id: z.number(),
  organisationId: z.number(),
  eventId: z.number(),
  label: z.string(),
  minAgeYears: z.number().int().nullable(),
  maxAgeYears: z.number().int().nullable(),
  pricePence: z.number().int().nonnegative(),
  consumesCapacity: z.boolean(),
});
export type PriceTier = z.infer<typeof PriceTierSchema>;

/** Org-scoped marketing contact (payer). Unique per (organisationId, email). */
export const CustomerSchema = z.object({
  id: z.number(),
  organisationId: z.number(),
  email: z.email(),
  name: z.string(),
  phone: PhoneSchema,
  marketingOptIn: z.boolean(),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const BookingSchema = z.object({
  id: z.number(),
  organisationId: z.number(),
  customerId: z.number(),
  eventId: z.number(),
  status: BookingStatusSchema,
  /** Opaque until Stripe is wired; mock may use null. */
  stripeSessionId: z.string().nullable(),
  createdAt: z.string(),
});
export type Booking = z.infer<typeof BookingSchema>;

export const TicketSchema = z.object({
  id: z.number(),
  organisationId: z.number(),
  bookingId: z.number(),
  priceTierId: z.number(),
  /** Adult: full name. Child/baby-style tiers: first name. */
  name: z.string(),
  /** Emergency contact — expected for adult-style tiers. */
  phone: PhoneSchema.nullable(),
  /** Years; typical for child/baby-style tiers. */
  ageYears: z.number().int().nonnegative().nullable(),
  /** Child/baby-style tiers → adult Ticket on the same Booking. */
  responsibleAdultTicketId: z.number().nullable(),
});
export type Ticket = z.infer<typeof TicketSchema>;

export const CreateCustomerInputSchema = z.object({
  organisationId: z.number(),
  email: z.email(),
  name: z.string(),
  phone: PhoneSchema,
  marketingOptIn: z.boolean(),
});
export type CreateCustomerInput = z.infer<typeof CreateCustomerInputSchema>;

export const CreateBookingInputSchema = z.object({
  organisationId: z.number(),
  customerId: z.number(),
  eventId: z.number(),
  status: BookingStatusSchema.optional(),
  stripeSessionId: z.string().nullable().optional(),
});
export type CreateBookingInput = z.infer<typeof CreateBookingInputSchema>;

export const CreateTicketInputSchema = z.object({
  organisationId: z.number(),
  bookingId: z.number(),
  priceTierId: z.number(),
  name: z.string(),
  phone: PhoneSchema.nullable().optional(),
  ageYears: z.number().int().nonnegative().nullable().optional(),
  responsibleAdultTicketId: z.number().nullable().optional(),
});
export type CreateTicketInput = z.infer<typeof CreateTicketInputSchema>;

/**
 * Collection schemas for list endpoints.
 * PriceTier is already plural-shaped — use `PriceTierSchema.array()`.
 */
export const UsersSchema = z.array(UserSchema);
export const MembershipsSchema = z.array(MembershipSchema);
export const VenuesSchema = z.array(VenueSchema);
export const EventsSchema = z.array(EventSchema);
export const CustomersSchema = z.array(CustomerSchema);
export const BookingsSchema = z.array(BookingSchema);
export const TicketsSchema = z.array(TicketSchema);

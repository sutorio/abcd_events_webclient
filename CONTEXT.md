# AbCD Events

Sole-trader events business: publish gatherings, take paid bookings (Stripe), and grow a customer list for marketing. The backend is **multitenant by Organisation**: org-owned data (customers, events, bookings, …) does not cross tenants. **Users** sit outside that box and link to Orgs via membership (many-to-many).

## Language

**User**:
A person who can sign in (identity). Exists outside any single Organisation; may belong to many Organisations.
_Avoid_: Account (unless meaning login), Customer

**Membership**:
The link between a User and an Organisation (with a role such as owner).
_Avoid_: Permission, ACL (as the entity)

**Organisation**:
The tenant / business presence on the site (name, description, branding, about/contact, default Venue). Owns Customers, Events, Bookings, etc.
_Avoid_: Company, business, tenant, brand (as the entity)

**Owner**:
A User with an owner Membership for the Organisation. Day-one Owner UI can be deferred.
_Avoid_: Admin, account

**Customer**:
Org-scoped paying adult and marketing contact (email, phone, marketing consent). No login. Unique per Organisation by email.
_Avoid_: Client, user, guest, booker

**Attendee**:
A person on a Booking (via a Ticket), described by a **PriceTier** (label/age bounds), not a global adult/child/baby enum. Soft-play style fields for day one; child/baby-style Tickets reference a responsible adult Ticket.
_Avoid_: Guest, participant

**Ticket**:
One Attendee place on a Booking, tied to a PriceTier. Tiers that `consumesCapacity` count toward Event capacity.
_Avoid_: RSVP, seat, line item

**Price tier**:
An Event-owned fare band (label, optional age range, price, whether it consumes capacity).
_Avoid_: TicketType, adult/child/baby (as global enums)

**Booking**:
A Customer’s Stripe-paid purchase of Tickets for an Event within an Organisation. Counts after payment succeeds. Cancellation Owner-mediated; refunds outside the product.
_Avoid_: Order, cart, checkout (the flow)

**Event**:
A single bookable date/time for an Organisation, at a Venue, with **visibility** public or private, optional **featured** for the homepage hero. Day one only uses public One-off-style Events (two silent discos).
_Avoid_: Listing, product, class, One-off (as a kind enum — visibility covers private catalogue)

**Term**:
A future grouping of Events (collection), not an Event kind. Out of day-one delivery.
_Avoid_: Course, programme

**Private (visibility)**:
Event not shown on the public upcoming catalogue (e.g. hire flow). Out of day-one delivery beyond the `visibility` field.
_Avoid_: Private hire (as a separate kind name unless product language needs it)

**Venue**:
Org-owned place. Organisation has a default Venue; each Event references a Venue.
_Avoid_: Location, address (as the entity)

**Featured Event**:
An Event with `featured: true` for the homepage hero (at most one per Organisation, enforced later).
_Avoid_: featuredEventId on Organisation

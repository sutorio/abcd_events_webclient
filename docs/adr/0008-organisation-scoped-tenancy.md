# Organisation-scoped multitenancy

Customer, Event, Booking, Ticket, Venue, and PriceTier data belong to an Organisation. Users sit outside that box and relate to Organisations through Membership (many-to-many). The day-one mock uses a single Organisation; the ApiClient carries `organisationId` so the client sketch matches the eventual backend boundary.

# Stripe for Booking payments from day one

Bookings are paid commitments, not RSVPs. We integrate Stripe in the first release so payment success is part of the Booking flow, rather than bolting on a provider after unpaid “pending” Bookings accumulate. Alternatives considered: offline/mark-as-paid only, or external pay links with manual reconciliation — rejected because the first Event out the door must be payable in-flow.

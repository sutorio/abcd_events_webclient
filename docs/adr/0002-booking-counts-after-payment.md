# Booking counts only after successful Stripe payment (day one)

For the first release, a Booking consumes capacity and creates/updates a Customer only when Stripe payment succeeds. Abandoned checkouts do not hold places. A short-lived hold at checkout start (Stripe-friendly) is preferred later if double-booking becomes a problem; it is deliberately out of day-one scope to keep the flow simple.

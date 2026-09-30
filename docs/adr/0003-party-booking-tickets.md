# Party Booking with Tickets (adult / child / baby)

Silent-disco-style Events need health-and-safety registration for every person attending, including free babies. A Booking is a single Stripe payment by a Customer (paying adult) that covers one or more Tickets; each Ticket is one Attendee with a type that drives price (adult/child paid, baby free). This matches common “group fare” flows (e.g. train tickets) better than one-person-per-Booking or treating the child as the Customer.

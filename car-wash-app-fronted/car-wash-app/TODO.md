# TODO: Implement Notification-Based Washer Assignment

## Backend Changes
- [x] Add washer availability endpoint in user-service: GET /api/users/washers/available (return active washers with low current bookings)
- [x] Modify BookingServiceImpl.createBooking: After saving, fetch available washers and send notifications with booking details (user name, amount, location, service plans, etc.)
- [x] Update BookingServiceImpl.washerAcceptBooking: Allow acceptance from PENDING status, set washerId and status to ACCEPTED, handle race conditions with optimistic locking
- [ ] Add new endpoint in booking-service: GET /api/bookings/washer/{washerId}/report (earnings, total accepted orders, etc., filter by date if needed)
- [ ] Enhance notification payload in notification-service if needed for richer details

## Frontend Changes
- [ ] Create notification component: Animated notifications (slide in, stack), show booking details, accept/skip buttons
- [ ] Update washer dashboard: Add report section (earnings, total orders accepted, today's date), integrate notification component, show pending bookings list with accept button
- [ ] Add real-time updates: Use polling or WebSockets to refresh notifications and pending bookings

## Testing
- [ ] Test booking creation: Verify notifications sent to washers
- [ ] Test washer accept: Ensure status changes, notifications to user/other washers
- [ ] Test dashboard: Reports display correctly, animations work
- [ ] Test concurrency: Multiple washers accepting same booking (only first succeeds)

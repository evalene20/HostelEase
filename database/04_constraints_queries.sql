SELECT r.room_id, r.capacity, COUNT(b.booking_id) AS total_bookings
FROM Room r
JOIN Booking b ON r.room_id = b.room_id
WHERE b.status = 'APPROVED'
GROUP BY r.room_id, r.capacity
HAVING COUNT(b.booking_id) > r.capacity;

SELECT * FROM Payment WHERE amount <= 0;

SELECT transaction_ref, COUNT(*)
FROM Payment_Details
GROUP BY transaction_ref
HAVING COUNT(*) > 1;
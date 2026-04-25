function toNumber(value) {
  return Number(value || 0);
}

export function getStudentRecord(students, studentId) {
  return (
    students.find((student) => Number(student.student_id) === Number(studentId)) ||
    students[0] ||
    null
  );
}

export function getStudentBookings(bookings, studentId) {
  return bookings.filter((booking) => Number(booking.student_id) === Number(studentId));
}

export function getStudentComplaints(complaints, studentId) {
  return complaints.filter((complaint) => Number(complaint.student_id) === Number(studentId));
}

export function getStudentPayments(payments, studentId) {
  return payments.filter((payment) => Number(payment.student_id) === Number(studentId));
}

export function getCurrentBooking(bookings) {
  return (
    bookings.find((booking) => booking.status === "APPROVED") ||
    bookings.find((booking) => booking.status === "REQUESTED") ||
    bookings[0] ||
    null
  );
}

export function getRoomComplaintCounts(bookings, complaints) {
  const bookingByStudent = new Map();

  bookings
    .filter((booking) => booking.status === "APPROVED")
    .forEach((booking) => {
      if (!bookingByStudent.has(booking.student_id)) {
        bookingByStudent.set(booking.student_id, booking.room_id);
      }
    });

  return complaints.reduce((accumulator, complaint) => {
    const roomId = bookingByStudent.get(complaint.student_id);
    if (!roomId) return accumulator;
    return {
      ...accumulator,
      [roomId]: (accumulator[roomId] || 0) + 1,
    };
  }, {});
}

export function getRecommendedRoom({ student, rooms, bookings, complaints, students }) {
  if (!student) {
    return null;
  }

  const complaintCounts = getRoomComplaintCounts(bookings, complaints);
  const currentApprovedBooking = bookings.find(
    (booking) =>
      Number(booking.student_id) === Number(student.student_id) && booking.status === "APPROVED"
  );

  const rankedRooms = rooms
    .filter((room) => room.occupancy_status !== "FULL")
    .map((room) => {
      const peerCount = bookings.filter((booking) => {
        const roommate = students.find(
          (candidate) => Number(candidate.student_id) === Number(booking.student_id)
        );

        return (
          booking.status === "APPROVED" &&
          Number(booking.room_id) === Number(room.room_id) &&
          roommate?.college_name === student.college_name
        );
      }).length;

      const occupancy = toNumber(room.current_occupancy);
      const capacity = Math.max(toNumber(room.capacity), 1);
      const complaintCount = complaintCounts[room.room_id] || 0;
      const isCurrentRoom = Number(currentApprovedBooking?.room_id) === Number(room.room_id);
      const score = capacity - occupancy + peerCount * 1.5 - complaintCount * 1.2 - (isCurrentRoom ? 4 : 0);

      return {
        ...room,
        score,
        peerCount,
        complaintCount,
      };
    })
    .sort((left, right) => right.score - left.score);

  const topRoom = rankedRooms[0];

  if (!topRoom) {
    return null;
  }

  const reasons = [
    topRoom.current_occupancy < topRoom.capacity ? "low occupancy" : null,
    topRoom.peerCount > 0 ? "same academic cohort already staying there" : "space for a calmer study mix",
    topRoom.complaintCount <= 1 ? "fewer complaint patterns in that room" : "still manageable complaint volume",
  ].filter(Boolean);

  return {
    ...topRoom,
    reasons,
  };
}

export function getStudentAlerts({ student, bookings, complaints, payments, recommendedRoom }) {
  const currentBooking = getCurrentBooking(bookings);
  const pendingComplaints = complaints.filter(
    (complaint) => complaint.complaint_status !== "ASSIGNED"
  ).length;
  const hasFailedPayment = payments.some((payment) => payment.payment_status === "FAILED");
  const roomAlmostFull =
    currentBooking &&
    currentBooking.status === "APPROVED" &&
    recommendedRoom &&
    Number(currentBooking.room_id) === Number(recommendedRoom.room_id)
      ? "Your current room is a strong match, but it is filling up."
      : null;

  return [
    roomAlmostFull,
    pendingComplaints ? `You have ${pendingComplaints} pending complaint update${pendingComplaints > 1 ? "s" : ""}.` : null,
    hasFailedPayment ? "Payment risk warning: one of your recent payments needs attention." : "Payment due in 3 days based on your monthly cycle.",
    student?.booking_status === "REQUESTED" ? "Your booking request is still awaiting approval." : null,
  ].filter(Boolean);
}

export function getAdminMetrics(data) {
  const totalCapacity = data.rooms.reduce((sum, room) => sum + toNumber(room.capacity), 0);
  const occupiedBeds = data.rooms.reduce(
    (sum, room) => sum + toNumber(room.current_occupancy),
    0
  );
  const totalRevenue = data.payments
    .filter((payment) => payment.payment_status === "SUCCESS")
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

  return {
    totalStudents: data.students.length,
    totalRooms: data.rooms.length,
    occupiedBeds,
    availableBeds: Math.max(totalCapacity - occupiedBeds, 0),
    totalComplaints: data.complaints.length,
    totalRevenue,
    occupancyRate: totalCapacity ? Math.round((occupiedBeds / totalCapacity) * 100) : 0,
  };
}

export function getAdminInsights(data) {
  const complaintsByHostel = data.complaints.reduce((accumulator, complaint) => {
    const booking = data.bookings.find(
      (candidate) =>
        Number(candidate.student_id) === Number(complaint.student_id) &&
        candidate.status === "APPROVED"
    );
    const key = booking?.hostel_name || "Unassigned";
    return {
      ...accumulator,
      [key]: (accumulator[key] || 0) + 1,
    };
  }, {});

  const topComplaintHostel =
    Object.entries(complaintsByHostel).sort((left, right) => right[1] - left[1])[0] || [];

  const nearFullRooms = data.rooms.filter(
    (room) => room.occupancy_status === "NEARLY_FULL" || room.occupancy_status === "FULL"
  );

  const highRiskStudents = data.students.filter((student) => {
    const studentComplaints = getStudentComplaints(data.complaints, student.student_id).length;
    const studentPayments = getStudentPayments(data.payments, student.student_id);
    const hasLateRisk =
      studentPayments.length === 0 ||
      studentPayments.some((payment) => payment.payment_status === "FAILED");

    return studentComplaints >= 2 || hasLateRisk;
  });

  return {
    topComplaintHostel,
    nearFullRooms,
    highRiskStudents,
  };
}

export function getAutoPriority(complaints, studentId, complaintType) {
  const repeatedCount = complaints.filter(
    (complaint) =>
      Number(complaint.student_id) === Number(studentId) &&
      complaint.complaint_type === complaintType
  ).length;

  if (repeatedCount >= 1 || complaintType === "ELECTRICITY" || complaintType === "WATER") {
    return "HIGH";
  }

  if (complaintType === "INTERNET" || complaintType === "CLEANING") {
    return "MEDIUM";
  }

  return "LOW";
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

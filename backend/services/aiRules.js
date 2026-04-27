/*
  AI Engine (Rule-Based)
  1. Room Recommendation
  2. Complaint Priority Prediction
  3. Staff Auto Assignment
  4. Payment Risk Detection
  5. Admin Insights Generator
  6. Booking Suggestions
  7. Room Risk Notes
  8. Student Risk Summary
  9. Staff Focus Notes
  10. Mess Summary
*/

function recommendRoom(rooms, bookings, student) {
    let bestRoom = null;
    let bestScore = -Infinity;

    rooms.forEach((room) => {
        let score = 0;

        const occupancy = bookings.filter(
            (booking) => booking.room_id === room.room_id && booking.status === "APPROVED"
        ).length;

        if (room.capacity - occupancy > 0) {
            score += 10;
        } else {
            score -= 100;
        }

        score += room.capacity - occupancy;

        const sameCollegeCount = bookings.filter(
            (booking) =>
                booking.room_id === room.room_id && booking.college_id === student.college_id
        ).length;

        score += sameCollegeCount * 2;

        if (score > bestScore) {
            bestScore = score;
            bestRoom = room;
        }
    });

    return {
        recommendedRoom: bestRoom,
        score: bestScore,
        reason: "Based on availability, occupancy, and compatibility",
    };
}

function predictComplaintPriority(complaints, newComplaint) {
    let priority = "LOW";

    const similarComplaints = complaints.filter(
        (complaint) =>
            complaint.student_id === newComplaint.student_id &&
            complaint.complaint_type === newComplaint.complaint_type
    ).length;

    if (similarComplaints >= 2) {
        priority = "HIGH";
    }

    if (
        newComplaint.complaint_type === "WATER" ||
        newComplaint.complaint_type === "ELECTRICITY"
    ) {
        priority = "HIGH";
    }

    if (priority !== "HIGH" && similarComplaints === 1) {
        priority = "MEDIUM";
    }

    return {
        predictedPriority: priority,
        reason: "Based on complaint type and history",
    };
}

function assignStaff(complaintType, staffList) {
    let roleNeeded = "";

    switch (complaintType) {
        case "WATER":
        case "ELECTRICITY":
        case "INTERNET":
            roleNeeded = "MAINTENANCE";
            break;
        case "CLEANING":
            roleNeeded = "HOUSEKEEPING";
            break;
        default:
            roleNeeded = "WARDEN";
    }

    const staff = staffList.find((member) => member.role === roleNeeded);

    return {
        assignedStaff: staff || null,
        role: roleNeeded,
        reason: "Assigned based on complaint type",
    };
}

function detectPaymentRisk(payments) {
    let risk = "LOW";

    const failedPayments = payments.filter(
        (payment) => payment.payment_status === "FAILED"
    ).length;

    const pendingPayments = payments.filter(
        (payment) => payment.payment_status === "PENDING"
    ).length;

    if (failedPayments >= 2) {
        risk = "HIGH";
    } else if (pendingPayments >= 2 || failedPayments >= 1) {
        risk = "MEDIUM";
    }

    return {
        riskLevel: risk,
        reason: "Based on failed and pending payments",
    };
}

function generateAdminInsights(rooms, bookings, complaints) {
    const insights = [];

    rooms.forEach((room) => {
        const approvedCount = bookings.filter(
            (booking) => booking.room_id === room.room_id && booking.status === "APPROVED"
        ).length;

        if (approvedCount > room.capacity) {
            insights.push(`Room ${room.room_no} is overcrowded`);
        }
    });

    const complaintCountByType = {};
    complaints.forEach((complaint) => {
        complaintCountByType[complaint.complaint_type] =
            (complaintCountByType[complaint.complaint_type] || 0) + 1;
    });

    Object.keys(complaintCountByType).forEach((type) => {
        if (complaintCountByType[type] > 2) {
            insights.push(`High number of ${type} complaints`);
        }
    });

    return insights;
}

function suggestBookingDecision(booking) {
    const occupancy = Number(booking.current_occupancy || 0);
    const capacity = Number(booking.capacity || 0);

    if (occupancy >= capacity) {
        return {
            decision: "REJECT",
            reason: "Room full - reject recommendation",
        };
    }

    if (booking.status === "REQUESTED") {
        return {
            decision: "APPROVE",
            reason: "Suggested approval based on availability",
        };
    }

    return {
        decision: booking.status,
        reason: "Booking already processed",
    };
}

function getRoomStatusNote(room) {
    const occupancy = Number(room.current_occupancy || 0);
    const capacity = Number(room.capacity || 0);

    if (occupancy > capacity) {
        return "Room is overcrowded";
    }

    if (occupancy === capacity) {
        return "Room is full";
    }

    if (occupancy === capacity - 1) {
        return "Room is almost full";
    }

    return "Room has safe occupancy";
}

function summarizeStudentRisk(complaints, payments) {
    const complaintCount = complaints.length;
    const paymentRisk = detectPaymentRisk(payments);

    if (complaintCount >= 2 || paymentRisk.riskLevel === "HIGH") {
        return {
            level: "HIGH",
            reason: "Repeated complaints or high payment risk detected",
        };
    }

    if (complaintCount >= 1 || paymentRisk.riskLevel === "MEDIUM") {
        return {
            level: "MEDIUM",
            reason: "Student has moderate support or payment risk",
        };
    }

    return {
        level: "LOW",
        reason: "No major complaint or payment risk signals",
    };
}

function predictComplaintFeedback(complaints, complaint) {
    const similarComplaints = complaints.filter(
        (item) => item.complaint_type === complaint.complaint_type
    ).length;

    if (similarComplaints >= 3) {
        return "High priority due to repeated complaints";
    }

    if (complaint.priority === "HIGH") {
        return "This issue may take longer to resolve";
    }

    return "Expected to resolve within the normal support window";
}

function getStaffFocus(role) {
    switch (role) {
        case "MAINTENANCE":
            return "Best suited for water, electricity, and internet complaints";
        case "HOUSEKEEPING":
            return "Best suited for cleaning and housekeeping tasks";
        case "MESS":
            return "Best suited for mess operations and food service issues";
        default:
            return "Best suited for approvals, supervision, and escalation";
    }
}

function getMessSummary(menuRows) {
    const mealCount = menuRows.filter((row) => row.meal_type).length;

    if (!mealCount) {
        return "Menu is available, feedback data can be connected later";
    }

    return `Weekly menu loaded with ${mealCount} scheduled meal entries`;
}

module.exports = {
    recommendRoom,
    predictComplaintPriority,
    assignStaff,
    detectPaymentRisk,
    generateAdminInsights,
    suggestBookingDecision,
    getRoomStatusNote,
    summarizeStudentRisk,
    predictComplaintFeedback,
    getStaffFocus,
    getMessSummary,
};

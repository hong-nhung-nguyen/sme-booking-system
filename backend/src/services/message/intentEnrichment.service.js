const clientRepository = require("../../repository/client.repository");
const serviceRepository = require("../../repository/service.repository");
const appointmentRepository = require("../../repository/appointment.repository");

const notAttempted = (reason) => ({
    status: "not_attempted",
    matchedId: null,
    candidateIds: [],
    reason
});

const classifyCandidates = (candidates, reasons) => {
    if (candidates.length === 0) {
        return {
            status: "not_found",
            matchedId: null,
            candidatesIds: [],
            reason: reasons.notFound
        };
    }

    if (candidates.length === 1) {
        return {
            status: "matched",
            matchedId: candidates[0]._id,
            candidatesIds: [],
            reason: null
        }
    }

    return {
        status: "ambiguous",
        matched: null,
        candidateIds: candidates.map(
            (candidate) => candidate._id
        ),
        reason: reasons.ambiguous
    };
}


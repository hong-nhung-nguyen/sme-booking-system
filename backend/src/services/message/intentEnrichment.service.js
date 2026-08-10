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
};

const splitContact = (clientContact) => {
    if (!clientContact) {
        return {
            email: null,
            phone: null
        }
    }

    const contact = clientContact.trim();

    if (contact.includes("@")) {
        return {
            email: contact.toLowerCase(),
            phone: null
        }
    }

    return {
        email: null,
        phone: contact 
    };
}

// Client enrichment 
const matchClient = async ({
    businessId,
    parsedIntent,
    knownClientId
}) => {
    if (knownClientId) {
        const candidates = await clientRepository.findCandidatesById({
            businessId,
            clientId: knownClientId
        });

        return classifyCandidates(candidates, {
            notFound: "Known client was not found in the business",
            ambiguous: "Multiple client records matched"
        });
    }

    const { email, phone } = splitContact(parsedIntent.clientContact);

    if (!email && !phone) {
        return notAttempted("The intent contains no customer contact");
    }

    const candidates = await clientRepository.findCandidatesForIntent({
        businessId,
        email,
        phone
    });

    return classifyCandidates(candidates, {
        notFound: "No client matched the supplied contact",
        ambiguous: "Multiple clients matched the supplied contact"
    });
};

// Service enrichment
const matchService = async ({
    businessId,
    parsedIntent
}) => {
    if (!parsedIntent.service) {
        return notAttempted("The intent contains no requested service")
    };

    const candidates = await serviceRepository.findCandidatesForIntent({
        businessId,
        serviceName: parsedIntent.service
    });

    return classifyCandidates(candidates, {
        notFound: "No active service matched",
        ambiguous: "Multiple active services matched"
    });
};

// Appointment enrichment
const matchAppointment = async ({
    businessId,
    locationId,
    parsedIntent,
    clientMatch,
    serviceMatch
}) => {
    if (clientMatch.status !== "matched") {
        return notAttempted("A unique client is required");
    }

    const candidates = await appointmentRepository.findCandidatesForIntent({
        businessId,
        locationId,
        clientId: clientMatch.matchedId,
        serviceId: serviceMatch.status === "matched"
            ? serviceMatch.matchedId
            : null,
        data: parsedIntent.preferredData
    });

    return classifyCandidates(candidates, {
        notFound: "No active appointment matched",
        ambiguous: "Multiple active appointments matched"
    })
};

module.exports.enrich = async ({
    businessId,
    locationId = null,
    knownClientId = null,
    parsedIntent
}) => {
    if (!businessId) {
        throw new TypeError("businessId is required");
    }

    const client = await matchClient({
        businessId,
        parsedIntent,
        knownClientId
    });

    const service = await matchService({
        businessId,
        parsedIntent
    });

    const appointment = await matchAppointment({
        businessId,
        locationId,
        parsedIntent,
        clientMatch: client,
        serviceMatch: service
    });

    /**
     * run sequentially because appointment matching depends on
     * client and service matchings
     */

    return {
        client,
        appointment,
        service, 
        enrichedAt: new Date()
    };
};


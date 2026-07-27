export function getId(value) {
    if (!value) return null;

    return typeof value === "object" ? value._id : value;
}

export function shortId(value) {
    const id = getId(value);

    return id ? String(id).slice(-4).toUpperCase() : "-";
}

export function getClient(appointment) {
    const client = appointment?.clientId;

    return client && typeof client === "object" ? client : null;
}

export function getGuestName(appointment) {
    const client = getClient(appointment);

    if (client) {
        const fullName = [client.firstName, client.lastName]
            .filter(Boolean)
            .join(" ");

        if (fullName) return fullName;
        if (client.email) return client.email;
        if (client.phone) return client.phone;
    }

    return `Guest ${shortId(appointment?.clientId)}`;
}

export function getServiceName(appointment) {
    const service = appointment?.serviceId;

    if (service && typeof service === "object") {
        return service.name || shortId(service);
    }

    return service ? shortId(service) : "-";
}

export function getResourceName(appointment) {
    const resource = appointment?.resourceId;

    if (resource && typeof resource === "object") {
        return resource.number ? String(resource.number) : "Unassigned";
    }

    return resource ? shortId(resource) : "Unassigned";
}

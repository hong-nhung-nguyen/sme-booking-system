const mongoose = require("mongoose");
const locationRepository = require("../../repository/location.repository");
const serviceService = require("./service.service");

module.exports.findOneForBusiness = async ({ businessId, locationId }) => {
    return await locationRepository.findOne({ businessId, locationId });
};

module.exports.findLocationServices = async ({ businessId, locationId }) => {
    const location = await module.exports.findOneForBusiness({ businessId, locationId });

    if (!location) {
        const error = new Error("Location not found");
        error.status = 404;
        throw error;
    }

    return location.services
        .filter((entry) => entry.serviceId)
        .map((entry) => ({
            assignmentId: entry._id,
            serviceId: entry.serviceId._id,
            name: entry.serviceId.name,
            description: entry.serviceId.description,
            defaultDurationMinutes: entry.serviceId.defaultDurationMinutes,
            globalStatus: entry.serviceId.status,
            localStatus: entry.status,
            status: entry.status,
            timeslots: entry.timeslots
        }));
};

module.exports.create = async ({ input, businessId, actorId }) => {
    const locationData = {
        businessId,
        name: input.name,
        phone: input.phone,
        address: {
            street: input.address.street,
            suburb: input.address.suburb,
            state: input.address.state,
            postcode: input.address.postcode,
            country: input.address.country
        },
        timezone: input.timezone || "Australia/Sydney",
        maxCapacity: input.maxCapacity ?? null,
        services: [],
        status: "active"
    };

    const location = locationRepository.create(locationData);

    return location;
};

module.exports.assignServices = async ({ businessId, locationId, serviceIds=[], actorId }) => {
    const location = await locationRepository.findOne({ businessId, locationId });

    if (!location) {
        const error = new Error("Location not found");
        error.status = 404;
        throw error;
    };

    const services = await serviceService.findManyForBusiness({ businessId, serviceIds });

    if (services.length !== serviceIds.length) {
        const error = new Error("One or more services were not found");
        error.status = 404;
        throw error;
    }

    const oldServices = location.services
        .filter((entry) => entry.serviceId)
        .map((entry) => ({
            serviceId: entry.serviceId._id.toString(),
            name: entry.serviceId.name
        }));
    
    const newServices = services.map((service) => ({
        serviceId: service._id.toString(),
        name: service.name
    }));

    if (services.length > 0) {
        location.services = services.map((service) => ({
            serviceId: service._id,
            status: "active",
            timeslots: []
        }));
    } else {
        return location;
    }

    location.changeHistory.push({
        changes: [
            {
                field: "services",
                oldValue: oldServices,
                newValue: newServices
            }
        ],
        updatedBy: actorId,
        updatedAt: new Date()
    })

    const assignedLocation = locationRepository.editOne(location);
    return assignedLocation;
};

module.exports.createAndAssignService = async ({ businessId, locationId, input, actorId }) => {
    let result;

    await mongoose.connection.transaction(async (session) => {
        const location = await locationRepository.findOne(
            { businessId, locationId },
            session 
        );

        if (!location) {
            const error = new Error("Location not found");
            error.status = 404;
            throw error;
        }

        const oldServices = location.services.map((service) => service.serviceId.name);
        const service = await serviceService.create({ businessId, input, session });

        location.services.push({
            serviceId: service._id,
            status: "active",
            timeslots: []
        });

        location.changeHistory.push({
            changes: [
                {
                    field: "services",
                    oldValue: oldServices,
                    newValue: [...oldServices, service.name]
                }
            ],
            updatedBy: actorId,
            updatedAt: new Date()
        });

        await locationRepository.editOne(location, session);

        result = {
            service,
            location
        };
    });

    /**
     * If service creation succeeds but location saving throws, the transaction aborts 
     * and the new service is not retained
     * 
     * If both succeed, the transaction commits them together 
     */
    return result; 
};

module.exports.unassignService = async ({ businessId, locationId, serviceId, actorId }) => {
    const location = await locationRepository.findOne({ businessId, locationId });

    if (!location) {
        const error = new Error("Location not found");
        error.status = 404;
        throw error;
    }

    const serviceExistsInLocation = location.services.some(
        (entry) => entry.serviceId && entry.serviceId._id.toString() === serviceId 
    );

    if (!serviceExistsInLocation) {
        const error = new Error("Service is not assigned to this location");
        error.status = 404;
        throw error;
    }

    const oldServices = location.services
        .filter((entry) => entry.serviceId)
        .map((entry) => ({
            serviceId: entry.serviceId._id.toString(),
            name: entry.serviceId.name 
        }));

    location.services = location.services
        .filter((entry) => entry.serviceId && entry.serviceId._id.toString() !== serviceId);
    
    const newServices = location.services
        .filter((entry) => entry.serviceId)
        .map((entry) => ({
            serviceId: entry.serviceId._id.toString(),
            name: entry.serviceId.name
        }));
    
    location.changeHistory.push({
        changes: [
            {
                field: "services",
                oldValue: oldServices,
                newValue: newServices
            }
        ],
        updatedBy: actorId,
        updatedAt: new Date()
    });

    return await locationRepository.editOne(location);
}

module.exports.updateServiceStatus = async ({ businessId, locationId, serviceId, status, actorId }) => {
    const location = await locationRepository.findOne({ businessId, locationId });

    if (!location) {
        const error = new Error("Location not found");
        error.status = 404;
        throw error;
    }

    const updatedService = location.services.find(
        (entry) => entry.serviceId && entry.serviceId._id.toString() === serviceId
    );

    if (!updatedService) {
        const error = new Error("Service is not assigned to this location");
        error.status = 404;
        throw error;
    }

    const oldServiceState = {
        serviceId: updatedService.serviceId._id.toString(),
        name: updatedService.serviceId.name,
        status: updatedService.status,
        timeslots: updatedService.timeslots
    };

    updatedService.status = status;

    const newServiceState = {
        serviceId: updatedService.serviceId._id.toString(),
        name: updatedService.serviceId.name,
        status: updatedService.status,
        timeslots: updatedService.timeslots
    }

    location.changeHistory.push({
        changes: [
            {
                field: "services",
                oldValue: oldServiceState,
                newValue: newServiceState
            }
        ],
        updatedBy: actorId,
        updatedAt: new Date()
    });

    return locationRepository.editOne(location);
};


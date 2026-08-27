const serviceRepository = require("../../repository/service.repository");

module.exports.findAllForBusiness = async (data) => {
    const businessId = data.businessId;
    return serviceRepository.findAllForBusiness({businessId});
}
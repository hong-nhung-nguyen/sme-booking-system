const clientRepository = require("../../repository/client.repository");

module.exports.findOne = async (findObject) => {
    const client = await clientRepository.findOne(findObject);

    return client || null;
};

module.exports.createOne = async (createObject) => {
    const newClient = await clientRepository.createOne(createObject);

    return newClient;
}
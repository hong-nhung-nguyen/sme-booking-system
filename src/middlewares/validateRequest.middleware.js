const validate = (schema) => (req, res, next) => {
    const validationOptions = {
        // get all the errors
        abortEarly: false,

        // allow undefined fields
        allowUnknown: true,
        
        // remove all undefined fields => no crash out when undefined fields
        stripUnknown: true
    };

    const data = {
        body: req.body || {},
        query: req.query || {},
        params: req.params || {}
    };

    const { error, value } = schema.validate(data, validationOptions);

    if (error) {
        return res.status(400).json({
            message: "Validation error",
            errors: error.details.map((detail) => detail.message)
        });
    }

    // if value.body is null or undefined => fall back to req.body
    req.body = value.body ?? req.body;
    req.query = value.query ?? req.query;
    req.params = value.params ?? req.params;

    next();
};

module.exports = validate;
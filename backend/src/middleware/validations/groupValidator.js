const Joi = require('joi');
const {HTTP_STATUS, STATUS_STRING}= require('../../constants/index');

const groupSchema = Joi.object({
    name: Joi.string().required()
});

//even we have just 1 attribute for Group entity, we implement this validator function for update Group for future implementations
const updateGroupSchema = Joi.object({
    //we need at least that the object passed is not empty
    //we check the formats here based on what body we receive
    name: Joi.string().trim().messages({
        'string.empty': 'name cannot be empty'
    })
})
.min(1)
.messages({
    'object.min': 'request body must be at least one valid field must be provided for update!'
});

const validateGroup = (req, res, next) => {
    const { error } = groupSchema.validate(req.body);
    if (error) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: STATUS_STRING.ERROR, code: "invalid_group_params", message: error.details[0].message });
    }
    next();//ok: passed our validation
};

const updateValidateGroup= (req, res, next) => {
    const { error } = updateGroupSchema.validate(req.body);
    if (error) {
        console.error(error);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: STATUS_STRING.ERROR, code: 'invalid_group_params', message: error.details[0].message });
    }
    next(); //ok: passed our validation
};

module.exports = {
    validateGroup,
    updateValidateGroup
};
const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().trim().required(),
    surname: Joi.string().trim().required(),
    birth_date: Joi.date().iso().required(),
    sex: Joi.string().valid('male', 'female', 'other').required()
});

const updateUserSchema = Joi.object({
    //we need at least that the object passed is not empty
    //we check the formats here based on what body we receive
    name: Joi.string().trim().messages({
        'string.empty': 'name cannot be empty'
    }),
    surname: Joi.string().trim().messages({
        'string.empty': 'surname cannot be empty'
    }),
    birth_date: Joi.date().iso().messages({
        'date.format': 'birth_date must be with this format: YYYY-MM-DD'
    }),
    sex: Joi.string().valid('male', 'female', 'other').messages({
        'any.only': 'sex must be one of [male, female, other]'
    })
})
.min(1)
.messages({
    'object.min': 'request body must be at least one valid field must be provided for update!'
});


const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        console.error(error);
        return res.status(400).json({ status: 'error', code: 'invalid_user_params', message: error.details[0].message });
    }
    next(); //ok: passed our validation
};

const updateValidateUser = (req, res, next) => {
    const { error } = updateUserSchema.validate(req.body);
    if (error) {
        console.error(error);
        return res.status(400).json({ status: 'error', code: 'invalid_user_params', message: error.details[0].message });
    }
    next(); //ok: passed our validation
};

module.exports = {
    validateUser,
    updateValidateUser
};
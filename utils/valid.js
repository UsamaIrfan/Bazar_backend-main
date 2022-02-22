const Joi = require('joi');

const isValidateEmail = (email) => {
    if (
        String(email)
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    ) {
        return true;
    } else {
        return false;
    }
};

const ChangePasswordValidation = async (body) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).max(54).required(),
    })
    try {
        await schema.validateAsync(body);
    } catch (error) {
        return error;
    }
}

const RegisterUserValidation = async (body) => {
    const schema = Joi.object({
        email: Joi.string().email(),
        phone: Joi.string().min(11).max(11).required(),
        password: Joi.string().min(6).max(54).required(),
        nic: Joi.string().min(14).max(14).required(),
        name: Joi.string().required(),
        nnn: Joi.string().when('a', { is: 'avalue', then: Joi.string().required() }).concat(Joi.string().when('b', { is: 'bvalue', then: Joi.string().required() }))
    })
    try {
        await schema.validateAsync(body);
    } catch (error) {
        return error;
    }
}

module.exports = {
    isValidateEmail,
    ChangePasswordValidation,
    RegisterUserValidation,
};

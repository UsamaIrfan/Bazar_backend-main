const Joi = require("joi");

const isValidateEmail = (email) => {
  if (
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
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
  });
  try {
    await schema.validateAsync(body);
  } catch (error) {
    return error;
  }
};

const RegisterUserWithProviderValidation = async (body) => {
  const schema = Joi.object({
    provider: Joi.string().valid("facebook", "google").required(),
    oauthToken: Joi.string().required(),
  });
  try {
    await schema.validateAsync(body);
  } catch (error) {
    return error;
  }
};

const RegisterUserValidation = async (body) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().length(13),
    password: Joi.string().min(6).max(54).required(),
    name: Joi.string().required(),
    address: Joi.string(),
    country: Joi.string(),
    city: Joi.string(),
  });
  try {
    await schema.validateAsync(body);
  } catch (error) {
    return error;
  }
};

const UpdateUserValidation = async (body) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().length(11),
    password: Joi.string().min(6).max(54),
    name: Joi.string(),
    address: Joi.string(),
    country: Joi.string(),
    city: Joi.string(),
    image: Joi.string(),
  });
  try {
    await schema.validateAsync(body);
  } catch (error) {
    return error;
  }
};

const LoginUserValidation = async (body) => {
  const schema = Joi.object({
    user: Joi.string().required(),
    password: Joi.string().required(),
  });
  try {
    await schema.validateAsync(body);
  } catch (error) {
    return error;
  }
};

// Admin
const RegisterAdminValidation = async (body) => {
  const schema = Joi.object({
    phone: Joi.string().min(11).max(12),
    userName: Joi.string().min(8).max(24).required(),
    password: Joi.string().min(6).max(54).required(),
    roles: Joi.array().items(Joi.string()).required(),
    name: Joi.string().required(),
  });
  try {
    await schema.validateAsync(body);
  } catch (error) {
    return error;
  }
};
const LoginAdminValidation = async (body) => {
  const schema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required(),
  });
  try {
    await schema.validateAsync(body);
  } catch (error) {
    return error;
  }
};
const ChangePasswordAdminValidation = async (body) => {
  const schema = Joi.object({
    userName: Joi.string().required(),
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(54).required(),
  });
  try {
    await schema.validateAsync(body);
  } catch (error) {
    return error;
  }
};

module.exports = {
  isValidateEmail,
  ChangePasswordValidation,
  RegisterUserValidation,
  LoginUserValidation,
  UpdateUserValidation,
  RegisterUserWithProviderValidation,
  // Admin
  RegisterAdminValidation,
  LoginAdminValidation,
  ChangePasswordAdminValidation,
};

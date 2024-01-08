const Joi = require("joi");
const {  user_type_constant } = require("../utils/constants");


const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/

class JOI_Service {
    // Check email pattern
    static joi_email_string() {
        return Joi.string().email().required()
    }

    // Check password pattern
    static joi_password_pattern() {
        return Joi.string()
        // .pattern(passwordPattern)
        .required()
    }
    static joi_first_name_pattern() {
        return Joi.string()
        .required()
    }
    static joi_last_name_pattern() {
        return Joi.string()
        .required()
    }
    static joi_last_profile_image_pattern() {
        return Joi.string()
        .required()
    }

    // Check confirm password
    static joi_confirm_password_pattern() {
        return Joi.ref("password")
    }
    // Check contact number
    static joi_contact_number_pattern() {
        return Joi.number().required()
    }

    // Check user type enum
    static joi_user_type_enum() {
        return Joi.string().valid(...Object.values(user_type_constant)).required();
    }
}


class JOI_Validations {
    static user_register_joi_validation(payload) {
        const userRegisterSchema = Joi.object({
            email: JOI_Service.joi_email_string(),
            password: JOI_Service.joi_password_pattern(),
            first_name: JOI_Service.joi_first_name_pattern(),
            last_name: JOI_Service.joi_last_name_pattern(),
            // profile_image: JOI_Service.joi_last_profile_image_pattern(),
        })
        const { error } = userRegisterSchema.validate(payload);
        return error
    }
    static user_login_joi_validation(payload) {
        const userRegisterSchema = Joi.object({
            email: JOI_Service.joi_email_string(),
            password: JOI_Service.joi_password_pattern(),
        })
        const { error } = userRegisterSchema.validate(payload);
        return error
    }

    static user_joi_validation(payload) {
        const userPopupSchema = Joi.object({
            email: JOI_Service.joi_email_string(),
            password: JOI_Service.joi_password_pattern(),
        })
        const { error } = userPopupSchema.validate(payload);
        return error
    }

}



module.exports = { JOI_Service, JOI_Validations }
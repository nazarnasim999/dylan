const { JOI_Validations } = require("../../services/joi_services");
const { Bcrypt_Service } = require("../../services/bcrypt_services");
const { User_Auth_Schema } = require("../../models/user_auth_model");
const User_DTO = require("../../dto/user_dto");
const { JWT_Generate_Token_Handle } = require("../../services/jwt_services");
const Auth_Token_DTO = require("../../dto/auth_tokens_dto");
const { User_Tokens_Schema } = require("../../models/user_tokens_model");
const { generateOtp } = require("../../utils/generate_OTP");
const {
  reset_password_email,
} = require("../../utils/email_transport_config");
const verifyEmailSchema = require("../../models/verification/verifyEmailTokenSchema");

const register_user = async (req, res, next) => {
  const { body, user_id } = req;
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      profile_image,
    } = body;
    // 2. if error in validation -> return error via middleware
    const validation_error = JOI_Validations.user_register_joi_validation(body);
    if (validation_error) {
      return next(validation_error);
    }
    const is_email_exist = await User_Auth_Schema.exists({ email });
    if (is_email_exist) {
      const error = {
        status: 409,
        message: "User is already exist with this email!",
      };
      return next(error);
    }
    const secure_password = await Bcrypt_Service.bcrypt_hash_password(password);

    const store_user_data = {
      email,
      password: secure_password,
      first_name: first_name,
      last_name: last_name,
      profile_image: profile_image
    };

    const save_user = await User_Auth_Schema.create({
      ...store_user_data,
    });

    const user_dto = new User_DTO(save_user);

    const generate_tokens = await JWT_Generate_Token_Handle.save_user_tokens(
      user_dto._id
    );

    const save_tokens = await User_Tokens_Schema.create({
      ...generate_tokens,
      user_id: user_dto._id,
    });

    const tokens_dto = new Auth_Token_DTO(save_tokens);

    const send_data = {
      email,
      first_name: first_name,
      last_name: last_name,
      profile_image: profile_image
    };

    return res.json({
      message: "Registered successfully!",
      data: store_user_data,
      // tokens: tokens_dto,
    });
  } catch (error) {
    return next(error);
  }
};

// ============= Login   ================ //
const login_user = async (req, res, next) => {
  const { body } = req;
  try {
    const { email, password } = body;
    // 2. if error in validation -> return error via middleware
    const validation_error = JOI_Validations.user_login_joi_validation(body);
    if (validation_error) {
      return next(validation_error);
    }
    const find_user = await User_Auth_Schema.findOne({ email });
    if (!find_user) {
      const error = {
        status: 401,
        message: "Invalid credentials!",
      };
      return next(error);
    }


    const compare_password = await Bcrypt_Service.bcrypt_compare_password(
      password,
      find_user.password
    );

    if (!compare_password) {
      const error = {
        status: 401,
        message: "Invalid credentials!",
      };
      return next(error);
    }

    const user_dto = new User_DTO(find_user);

    const generate_tokens = await JWT_Generate_Token_Handle.save_user_tokens(
      user_dto._id
    );

    const save_tokens = await User_Tokens_Schema.create({
      ...generate_tokens,
      user_id: user_dto._id,

    });
    const obj = {
      first_name: find_user.first_name,
      last_name: find_user.last_name,
      email: find_user.email,
      user_id: user_dto._id,

    };

    const tokens_dto = new Auth_Token_DTO(save_tokens);

    return res.json({
      message: "logged in successfully!",
      data: obj,
      tokens: tokens_dto,
    });
  } catch (error) {
    return next(error);
  }
};

const check_auth_controller = async (req, res, next) => {
  const { body, user_data, user_id, token_id } = req;
  try {
    return res.status(200).json({ success: true, data: user_data });
  } catch (error) {
    return next(error);
  }
};


// ============= Reset Password Section Start   ================ //

const reset_user_password_request = async (req, res, next) => {
  const { email } = req.body;

  try {
    const find_user = await User_Auth_Schema.findOne({ email }).select(
      "-password"
    );

    if (!find_user) {
      return res
        .status(401)
        .send({ success: false, message: "No user found!" });
    }
    const OTP = generateOtp();
    console.log(OTP);
    await reset_password_email(email, OTP);
    const varificationtoken = await verifyEmailSchema.create({
      user: find_user._id,
      OTP: OTP,
    });

    return res.json({
      success: true,
      message: "Email successfully sent with verification OTP!",
      data: email,
    });
  } catch (error) {
    return next(error);
  }
};

const verify_reset_password_OTP = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const find_user = await User_Auth_Schema.findOne({ email }).select(
      "-password"
    );

    if (!find_user) {
      return res
        .status(401)
        .send({ success: false, message: "No user found!" });
    }

    const find_token = await verifyEmailSchema.findOne({
      user: find_user._id,
      OTP: otp.toString(),
    });

    if (!find_token) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid OTP or email!" });
    }

    let obj = {
      email,
      otp,
    };
    // await verifyEmailModel.findByIdAndDelete(find_token.id)
    return res.json({
      success: true,
      message: "OTP Successfully verified!",
      data: obj,
    });
  } catch (error) {
    return next(error);
  }
};

const verify_OTP_and_create_password = async (req, res, next) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  try {
    const find_user = await User_Auth_Schema.findOne({ email }).select(
      "-password"
    );

    if (!find_user) {
      return res
        .status(401)
        .send({ success: false, message: "No user found!" });
    }

    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }
    const find_token = await verifyEmailSchema.findOne({
      user: find_user._id,
      OTP: otp.toString(),
    });

    if (!find_token) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid OTP or email!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "new password and confirm password are not same!",
      });
    }

    // const salt = await bcrypt.genSalt(10)
    // const secPass = await bcrypt.hash(newPassword, salt)

    const updated_password = await Bcrypt_Service.bcrypt_hash_password(
      newPassword
    );

    const updated_pass = await User_Auth_Schema.findByIdAndUpdate(
      find_user.id,
      { password: updated_password },
      { new: true }
    );
    await verifyEmailSchema.findByIdAndDelete(find_token.id);

    return res.json({
      success: true,
      message: "Password successfully updated!",
    });
  } catch (error) {
    return next(error);
  }
};

const renew_token_controller = async (req, res) => {
  const { user_data, user_id, token_id } = req;

  const generate_tokens = await JWT_Generate_Token_Handle.save_user_tokens(
    user_id
  );

  const update_token_record = await User_Tokens_Schema.findByIdAndUpdate(
    token_id,
    { ...generate_tokens },
    { new: true }
  );

  const tokens_dto = new Auth_Token_DTO(update_token_record);

  return res.status(200).json({ success: true, tokens: tokens_dto });
};



const logout_controller = async (req, res, next) => {
  const { body, user_data, user_id, token_id } = req;

  try {
    await User_Tokens_Schema.findByIdAndDelete(token_id);
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register_user,
  login_user,
  check_auth_controller,
  renew_token_controller,
  logout_controller,
  reset_user_password_request,
  verify_OTP_and_create_password,
  verify_reset_password_OTP,

};

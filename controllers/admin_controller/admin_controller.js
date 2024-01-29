const Auth_Token_DTO = require("../../dto/auth_tokens_dto");
const User_DTO = require("../../dto/user_dto");
const { Admin_Auth_Schema } = require("../../models/admin_auth_model copy");
const Message = require("../../models/messageModel");
const { User_Tokens_Schema } = require("../../models/user_tokens_model");
const { Bcrypt_Service } = require("../../services/bcrypt_services");
const { JWT_Generate_Token_Handle } = require("../../services/jwt_services");
const { ObjectId } = require('mongodb');

const nodemailer = require("nodemailer");
require("dotenv").config();


const admin_register_user = async (req, res, next) => {
    const { body, user_id } = req;
    try {
        const {
            email,
            password,
            role,
            Name,


            selected_queries,
            phoneno

        } = body;

        const secure_password = await Bcrypt_Service.bcrypt_hash_password(password);

        const store_user_data = {
            email,
            password: secure_password,
            role,
            Name,

            selected_queries,
            phoneno

        };  

        const save_user = await Admin_Auth_Schema.create({
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
            user_id: user_dto._id,

        };

        return res.json({
            message: "Registered successfully!",
            data: send_data,
            // tokens: tokens_dto,
        });
    } catch (error) {
        return next(error);
    }
};

const admin_login = async (req, res, next) => {
    const { body } = req;
    try {
        const { email, password } = body;

        const find_user = await Admin_Auth_Schema.findOne({ email });
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
            Name: find_user.Name,
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
}

const get_upcoming_msg_in_admin_panel = async (req, res, next) => {

    try {
        const pipeline = [
            {
                $match: {
                    receiver: new ObjectId("6570a161252b429f66e5980f"), // Admin's ID
                },
            },
            {
                $sort: { timestamp: -1 },
            },
            {
                $group: {
                    _id: {
                        sender: "$sender",
                        receiver: "$receiver",
                    },
                    latestMessage: { $first: "$$ROOT" },
                },
            },
            {
                $lookup: {
                    from: "create_vendors",
                    localField: "_id.sender",
                    foreignField: "_id",
                    as: "senderDetails",
                },
            },
            {
                $lookup: {
                    from: "create_customers",
                    localField: "_id.sender",
                    foreignField: "_id",
                    as: "senderCustomerDetails",
                },
            },
            {
                $unwind: {
                    path: "$senderDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$senderCustomerDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    senderDetails: {
                        $mergeObjects: ["$senderDetails", "$senderCustomerDetails"],
                    },
                    message: "$latestMessage.message",
                    timestamp: "$latestMessage.timestamp",
                },
            },
        ]

        const resultVariable = await Message.aggregate([...pipeline,]);

        return res.json({
            message: "Successfully Get",
            data: resultVariable
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = { admin_register_user, admin_login, get_upcoming_msg_in_admin_panel }

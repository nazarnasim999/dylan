const Auth_Token_DTO = require("../../dto/auth_tokens_dto");
const User_DTO = require("../../dto/user_dto");
const { Customer_Job_Schema } = require("../../models/customer_job_model");
const { Customer_Schema } = require("../../models/customer_model");
const Message = require("../../models/messageModel");
const { User_Auth_Schema } = require("../../models/user_auth_model");
const { User_Tokens_Schema } = require("../../models/user_tokens_model");
const { Vendor_Schema } = require("../../models/vendor_model");
const { Bcrypt_Service } = require("../../services/bcrypt_services");
const { JOI_Validations } = require("../../services/joi_services");
const { JWT_Generate_Token_Handle } = require("../../services/jwt_services");
// const { ObjectId } = require('mongodb');
const { ObjectId } = require('mongoose').Types;




const requiredFields = [
    'type',
    'zipCode',
    'Profile_Image',
    'Name',
    'email',
    'password',
    'Home_Address',
];

const create_customer = async (req, res, next) => {

    const { body } = req;
    try {
        const {
            type,
            Name,
            email,
            password,
            // Profile_Image,
            Home_Address,
            zipCode,

        } = body;

        const missingFields = requiredFields.filter(field => !(field in body));

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        const secure_password = await Bcrypt_Service.bcrypt_hash_password(password);

        const store_user_data = {
            type,
            Name,
            // Profile_Image,
            email,
            password: secure_password,
            Home_Address,
            zipCode,

        };

        const save_user = await Customer_Schema.create({
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
            Name: Name,
            email: email,
            Profile_Image: Profile_Image,
            user_id: user_dto._id,

        };



        return res.json({
            message: "Registered Successfully",
            data: send_data,
            tokens: tokens_dto,
        });
    } catch (error) {
        return next(error);
    }
}

const login_customer = async (req, res, next) => {
    const { body } = req;
    try {
        const { email, password } = body;
        // 2. if error in validation -> return error via middleware
        const validation_error = JOI_Validations.user_login_joi_validation(body);
        if (validation_error) {
            return next(validation_error);
        }
        const find_user = await Customer_Schema.findOne({ email });
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
            Profile_Image: find_user.Profile_Image,
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

const create_customer_job = async (req, res, next) => {
 
    const { body } = req
    try {
        const {
            type,
            selected_queries,
            user_id,
            details,
            images,
            // title,
            location,
            // to_date,
            // to_time,
            // from_time
            available,
            zipcode,
            emergency,
        


            
           
           
        } = body;

        const availabilities = available.map((item) => ({
            date: item.date,
            times: item.times,
        }));

        


        const store_user_data = {
            type,
            selected_queries,
            user_id: new ObjectId(user_id),
            details,
            images,
            // title,
            location,
            // to_date, 
            // to_time,
            // from_time
           availablity_times: availabilities,
           zipcode,
           emergency,
         
            
           

        };

        const save_user = await Customer_Job_Schema.create({
            ...store_user_data,
        });

        return res.json({
            message: "Create Successfully",
            data: save_user,
        });
    } catch (error) {
        return next(error);
    }
}

const get_createed_job_by_user_id = async (req, res, next) => {

    const { body } = req;
    try {
        const { user_id } = body;
        const resultVariable = await Customer_Job_Schema.find({ user_id: user_id });

        if (resultVariable) {
            return res.json({
                message: "Get Successfully",
                data: resultVariable
            });
        } else {
            return res.json({
                message: "User not found",
                data: null
            });
        }
    } catch (error) {
        return next(error);
    }

}


const get_matching_vendors = async (req, res, next) => {

    const { customerId } = req.body

    try {


        // const pipeline = [
        //     {
        //         $match: {
        //             _id: new ObjectId(customerId),
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "create_customer_jobs",
        //             localField: "_id",
        //             foreignField: "user_id",
        //             as: "user_jobs",
        //         },
        //     },
        //     {
        //         $unwind: "$user_jobs",
        //     },
        //     {
        //         $lookup: {
        //             from: "create_vendors",
        //             localField: "user_jobs.selected_queries",
        //             foreignField: "selected_queries",
        //             as: "matching_vendors",
        //         },
        //     },
        //     {
        //         $unwind: "$matching_vendors",
        //     },
        //     {
        //         $addFields: {
        //             overlapping_times: {
        //                 $filter: {
        //                     input: "$matching_vendors.availablity_times",
        //                     as: "vendor_time",
        //                     cond: {
        //                         $anyElementTrue: {
        //                             $map: {
        //                                 input: "$user_jobs.availablity_times",
        //                                 as: "user_time",
        //                                 in: {
        //                                     $and: [
        //                                         {
        //                                             $and: [
        //                                                 {
        //                                                     $lte: ["$$user_time.from", "$$vendor_time.to"],
        //                                                 },
        //                                                 {
        //                                                     $gte: ["$$user_time.to", "$$vendor_time.from"],
        //                                                 },
        //                                             ],
        //                                         },
        //                                         {
        //                                             $or: [
        //                                                 {
        //                                                     $lte: ["$$vendor_time.from", "$$user_time.to"],
        //                                                 },
        //                                                 {
        //                                                     $gte: ["$$vendor_time.to", "$$user_time.from"],
        //                                                 },
        //                                             ],
        //                                         },
        //                                     ],
        //                                 },
        //                             },
        //                         },
        //                     },
        //                 },
        //             },
        //         },
        //     },
        //     {
        //         $match: {
        //             overlapping_times: {
        //                 $ne: [],
        //             },
        //         },
        //     },
        //     {
        //         $project: {
        //             verdor_slot: {
        //                 $arrayElemAt: ["$overlapping_times", 0],
        //             },
        //             job_times: "$user_jobs.availablity_times",
        //             _id: "$matching_vendors._id",
        //             Name: "$matching_vendors.Name",
        //             email: "$matching_vendors.email",
        //             type: "$matching_vendors.type",
        //             selected_queries: "$matching_vendors.selected_queries",
        //             Home_Address: "$matching_vendors.Home_Address",
        //             Phone_Number: "$matching_vendors.Phone_Number",
        //             availablity_times: "$overlapping_times",
        //             experience: "$matching_vendors.experience",
        //             Profile_Image: "$matching_vendors.Profile_Image",
        //         },
        //     },
        //     {
        //         $group: {
        //             _id: "$_id",
        //             vendors: {
        //                 $addToSet: "$$ROOT",
        //             },
        //         },
        //     },
        //     {
        //         $limit: 3, // Limit to 3 vendors
        //     },
        // ]
        // const pipeline = [
        //     {
        //         $match: {
        //             _id: new ObjectId(customerId),
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "create_customer_jobs",
        //             localField: "_id",
        //             foreignField: "user_id",
        //             as: "CustomersJobs",
        //         },
        //     },
        //     {
        //         $unwind: "$CustomersJobs",
        //     },
        //     {
        //         $lookup: {
        //             from: "create_vendors",
        //             localField: "CustomersJobs.selected_queries",
        //             foreignField: "selected_queries",
        //             as: "VendorInfo",
        //         },
        //     },
        //     {
        //         $unwind: "$VendorInfo",
        //     },
        //     {
        //         $lookup: {
        //             from: "create_customer_jobs",
        //             localField: "VendorInfo.selected_queries",
        //             foreignField: "selected_queries",
        //             as: "JobDetails",
        //         },
        //     },
        //     {
        //         $project: {
        //             "VendorInfo._id": 1,
        //             "VendorInfo.type": 1,
        //             "VendorInfo.Name": 1,
        //             "VendorInfo.email": 1,
        //             "VendorInfo.experience": 1,
        //             "VendorInfo.Home_Address": 1,
        //             "VendorInfo.zipCode": 1,
        //             "VendorInfo.selected_queries": 1,
        //             "VendorInfo.Profile_Image": 1,
        //             "VendorInfo.JobDetails": {
        //                 $arrayElemAt: ["$JobDetails", 0]
        //             },
        //         },
        //     },
        // ]
        const pipeline = [
            {
                $match: {
                    _id: new ObjectId(customerId),
                },
            },
            {
                $lookup: {
                    from: "create_customer_jobs",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "CustomersJobs",
                },
            },
            {
                $unwind: "$CustomersJobs",
            },
            {
                $lookup: {
                    from: "create_vendors",
                    localField: "CustomersJobs.selected_queries",
                    foreignField: "selected_queries",
                    as: "VendorInfo",
                },
            },
            {
                $unwind: "$VendorInfo",
            },
            {
                $project: {
                    "VendorInfo._id": 1,
                    "VendorInfo.type": 1,
                    "VendorInfo.Name": 1,
                    "VendorInfo.email": 1,
                    "VendorInfo.experience": 1,
                    "VendorInfo.Home_Address": 1,
                    "VendorInfo.zipCode": 1,
                    "VendorInfo.selected_queries": 1,
                    "VendorInfo.Profile_Image": 1,
                    "CustomersJobs": 1,
                },
            },
        ]
        const resultVariable = await Customer_Schema.aggregate([...pipeline,]);

        if (resultVariable.length === 0) {
            return res.status(404).json({
                message: "No matching Vendors found ."
            });
        }
        return res.json({
            message: "Successfully Get",
            data: resultVariable
        });


    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
    }
}

const get_customer_profile_by_id = async (req, res, next) => {
    const { id } = req.params;
    try {
        const resultVariable = await Customer_Schema.findById(id)

        return res.json({
            message: "Get Successfully",
            data: resultVariable
        });
    } catch (error) {
        return next(error);
    }
}

const save_image1 = async (req, res, next) => {
    try {
      const { imagePath, userId } = req.body;
      // Find the document with the user ID in the create_vendor collection
      let customer = await Customer_Schema.findOne({ _id: userId });
      // let customer = await Customer_Schema.findOne({ _id: '658accf531fdde44bc3f16e1' });
      console.log('lllllTSCustomer' , userId);
      // console.log('lllllTSCustomer' , '658accf531fdde44bc3f16e1');
      // If the document doesn't exist, create a new one
      // Update the Profile_Image field with the image path
      customer.Profile_Image = imagePath;
      // Save the document in the create_vendor collection
      await customer.save();
      res.json({ message: 'Image path saved successfully' });
     } catch (error) {
      console.error('Error saving image path to customer table:', error);
      res.status(500).json({ error: 'Error saving image path to customer table' });
     }
  }

const get_vendors_recent_chats = async (req, res, next) => {

    const { current_customer_id } = req.body
    try {
        // const current_user_id = '656f94b34b11f396e456aed4'

        const pipeline = [
            {
                $match: {
                    $or: [
                        { sender: new ObjectId(current_customer_id) },
                        { receiver: new ObjectId(current_customer_id) },
                    ],
                },
            },
            {
                $sort: { timestamp: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', new ObjectId(current_customer_id)] },
                            '$receiver',
                            '$sender',
                        ],
                    },
                    latestMessage: { $first: '$$ROOT' },
                },
            },
            {
                $lookup: {
                    from: 'create_vendors', // Replace with the actual name of your users collection
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'messages', // Replace with the actual name of your messages collection
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$sender', '$$userId'] },
                                        { $eq: ['$receiver', '$$userId'] },
                                    ],
                                },
                            },
                        },
                        { $sort: { timestamp: -1 } },
                        { $limit: 1 },
                    ],
                    as: 'lastMessage',
                },
            },
            {
                $unwind: {
                    path: '$lastMessage',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    sender: 1,
                    receiver: 1,
                    message: '$lastMessage.message',
                    timestamp: '$lastMessage.timestamp',
                    'userDetails.Name': 1,
                    'userDetails.Home_Address': 1,
                    'userDetails.email': 1,
                    'userDetails.type': 1,
                    'userDetails.Profile_Image': 1,
                    'userDetails.zipCode': 1,
                    'userDetails._id': 1,






                    timeDifference: {
                        $abs: {
                            $subtract: [new Date(), '$lastMessage.timestamp'],
                        },
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    recentChats: {
                        $push: {
                            _id: '$_id',
                            sender: '$sender',
                            receiver: '$receiver',
                            message: '$message',
                            timestamp: '$timestamp',
                            userDetails: '$userDetails',
                            timeDifference: '$timeDifference',
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    recentChats: 1,
                },
            },
        ]

        const resultVariable = await Message.aggregate([
            ...pipeline,
        ]);

        return res.json({
            message: "Successfully Get",
            data: resultVariable
        });

    } catch (error) {
        return next(error);
    }
}

module.exports = {
    create_customer, login_customer,
    create_customer_job,
    get_createed_job_by_user_id,
    get_matching_vendors,
    get_customer_profile_by_id,
    get_vendors_recent_chats,
    save_image1
}


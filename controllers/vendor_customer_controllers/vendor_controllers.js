const Auth_Token_DTO = require("../../dto/auth_tokens_dto");
const User_DTO = require("../../dto/user_dto");
const { Customer_Schema } = require("../../models/customer_model");
const Message = require("../../models/messageModel");
const { User_Tokens_Schema } = require("../../models/user_tokens_model");
const { Vendor_Gig_Schema } = require("../../models/vendor_gig_model");
const { Vendor_Schema } = require("../../models/vendor_model");
const { Bcrypt_Service } = require("../../services/bcrypt_services");
const { JOI_Validations } = require("../../services/joi_services");
const { JWT_Generate_Token_Handle } = require("../../services/jwt_services");
const { ObjectId } = require('mongodb');


const requiredFields = [
    'type',
    'selected_queries',
    'Profile_Image',
    'Name',
    'email',
    'password',
    // 'experience',
    'Home_Address',
    'zipCode',


];

const create_vendor = async (req, res, next) => {

    const { body } = req;
    try {
        const {
            type,
            selected_queries,
            Profile_Image,
            Name,
            email,
            password,
            // experience,
            Home_Address,
            zipCode


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
            selected_queries,
            Profile_Image,
            Name,
            email,
            password: secure_password,
            // experience,
            Home_Address,
            zipCode


        };

        const save_user = await Vendor_Schema.create({
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
            selected_queries: selected_queries
        };

        return res.json({
            message: "Registered successfully!",
            data: send_data,
            tokens: tokens_dto,
        });

    } catch (error) {
        return next(error);
    }
}


const save_image = async (req, res, next) => {
    try {
        const { imagePath, userId } = req.body;
        
      
    
        // Find the document with the user ID in the create_vendor collection
        let vendor = await Vendor_Schema.findOne({ _id: userId });


        console.log('lllllvendor' , userId);
    
        // If the document doesn't exist, create a new one
       
    
        // Update the Profile_Image field with the image path
        vendor.Profile_Image = imagePath;
    
        // Save the document in the create_vendor collection
        await vendor.save();
    
        res.json({ message: 'Image path saved successfully' });
      } catch (error) {
        console.error('Error saving image path to vendor table:', error);
        res.status(500).json({ error: 'Error saving image path to vendor table' });
      }
}

const login_vendor = async (req, res, next) => {
    const { body } = req;
    try {
        const { email, password } = body;
        // 2. if error in validation -> return error via middleware
        const validation_error = JOI_Validations.user_login_joi_validation(body);
        if (validation_error) {
            return next(validation_error);
        }
        const find_user = await Vendor_Schema.findOne({ email });
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
            selected_queries: find_user.selected_queries,
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



const get_all_customers = async (req, res, next) => {
    try {
        // Retrieve all customers and sort them by creation timestamp in descending order
        const all_customers = await Customer_Schema.find().sort({ createdAt: -1 });

        return res.json({
            message: "Successfully retrieved all customers",
            data: all_customers
        });
    } catch (error) {
        return next(error);
    }
}

const get_matching_job = async (req, res, next) => {

   
    const { query, vendorId } = req.body
    const find_user = await Vendor_Schema.findOne({_id:  vendorId });
    // const datas = find_user.zipCode;
    const datas = find_user.zipCode.toString();
    console.log(datas)

    try {
        const pipeline = [
            {
                $match: {
                    _id: new ObjectId(vendorId),
                },
            },
            {
                $match: {
                    selected_queries: { $all: [query] },
                },
            },

            // {
            //                 $match: {
            //                     $or: [
            //                         { "jobs.zipcode": 2211 },
            //                         // { "jobs.zipcode": null },
                                    
            //                     ],
            //                 },
            //             },
            {
                $facet: {
                    jobs: [
                        {
                            $lookup: {
                                from: "create_customer_jobs",
                                localField: "selected_queries",
                                foreignField: "selected_queries",
                                as: "jobs",
                            },
                        },
                        {
                            $unwind: {
                                path: "$jobs",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $match: {
                                $or: [
                                    { "jobs.zipcode": datas},
                                    // { "jobs.zipcode": null },

                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "create_customers",
                                localField: "jobs.user_id",
                                foreignField: "_id",
                                as: "userDetails",
                            },
                        },
                        {
                            $unwind: {
                                path: "$userDetails",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $project: {
                                "jobs.user_id": 1,
                                "jobs.selected_queries": 1,
                                "jobs.details": 1,
                                "jobs.images": 1,
                                "jobs.availablity_times": 1,
                                "jobs.availablity_time": 1,
                                "jobs.to_date": 1,
                                "jobs.to_time": 1,
                                "jobs.from_time": 1,
                                "jobs.zipcode": 1,
                                "jobs.emergency": 1,
                                "jobs.note": 1,
                                "jobs.Budget": 1,
                                "jobs.createdAt": 1,
                                "jobs._id": 1,
                                "jobs.time1": 1,
                                
                                "userDetails.Name": 1,
                                "userDetails.email": 1,
                                "userDetails.Home_Address": 1,
                                "userDetails.Profile_Image": 1,
                                "userDetails._id": 1,
                            },
                        },
                    ],
                },
            },
        ];
        
        // const pipeline = [
        //     {
        //         $match: {
        //             // _id: new ObjectId("6577cccda4f38df702d24236"),
        //             _id: new ObjectId(vendorId),
        //         },
        //     },
        //     {
        //         $facet: {
        //             jobs: [
        //                 {
        //                     $lookup: {
        //                         from: "create_customer_jobs",
        //                         localField: "selected_queries",
        //                         foreignField: "selected_queries",
        //                         as: "vendorJobs",
        //                     },
        //                 },
        //                 {
        //                     $unwind: {
        //                         path: "$vendorJobs",
        //                         preserveNullAndEmptyArrays: true,
        //                     },
        //                 },

        //                 {
        //                     $addFields: {
        //                         overlapping_times: {
        //                             $filter: {
        //                                 input:
        //                                     "$vendorJobs.availablity_times",
        //                                 as: "vendor_time",
        //                                 cond: {
        //                                     $anyElementTrue: {
        //                                         $map: {
        //                                             input: "$availablity_times",
        //                                             as: "user_time",
        //                                             in: {
        //                                                 $and: [
        //                                                     {
        //                                                         $and: [
        //                                                             {
        //                                                                 $lte: [
        //                                                                     "$$user_time.from",
        //                                                                     "$$vendor_time.to",
        //                                                                 ],
        //                                                             },
        //                                                             {
        //                                                                 $gte: [
        //                                                                     "$$user_time.to",
        //                                                                     "$$vendor_time.from",
        //                                                                 ],
        //                                                             },
        //                                                         ],
        //                                                     },
        //                                                     {
        //                                                         $or: [
        //                                                             {
        //                                                                 $lte: [
        //                                                                     "$$vendor_time.from",
        //                                                                     "$$user_time.to",
        //                                                                 ],
        //                                                             },
        //                                                             {
        //                                                                 $gte: [
        //                                                                     "$$vendor_time.to",
        //                                                                     "$$user_time.from",
        //                                                                 ],
        //                                                             },
        //                                                         ],
        //                                                     },
        //                                                 ],
        //                                             },
        //                                         },
        //                                     },
        //                                 },
        //                             },
        //                         },
        //                     },
        //                 },
        //                 {
        //                     $match: {
        //                         overlapping_times: {
        //                             $ne: [],
        //                         },
        //                     },
        //                 },
        //                 {
        //                     $lookup: {
        //                         from: "create_customers",
        //                         localField: "vendorJobs.user_id",
        //                         foreignField: "_id",
        //                         as: "userDetails",
        //                     },
        //                 },
        //                 {
        //                     $unwind: {
        //                         path: "$userDetails",
        //                         preserveNullAndEmptyArrays: true,
        //                     },
        //                 },
        //                 {
        //                     $addFields: {
        //                         user_id: "$userDetails._id", // Rename _id to user_id
        //                         createdAt: {
        //                             $cond: {
        //                                 if: {
        //                                     $gt: [
        //                                         "$vendorJobs.createdAt",
        //                                         "$userDetails.createdAt",
        //                                     ],
        //                                 },
        //                                 then: "$vendorJobs.createdAt",
        //                                 else: "$userDetails.createdAt",
        //                             },
        //                         },
        //                     },
        //                 },
        //                 {
        //                     $replaceRoot: {
        //                         newRoot: {
        //                             $mergeObjects: [
        //                                 "$vendorJobs",
        //                                 "$userDetails",
        //                                 {
        //                                     job_id: "$vendorJobs._id",
        //                                     createdAt: "$createdAt",
        //                                 },
        //                             ],
        //                         },
        //                     },
        //                 },
        //             ],
        //         },
        //     },
        // ]
        const resultVariable = await Vendor_Schema.aggregate([...pipeline,]);

        if (resultVariable.length === 0) {
            return res.status(404).json({
                message: "No matching jobs found for the given query."
            });
        }
        return res.json({
            message: "Successfully Get",
            data: resultVariable
        });
    } catch (error) {
        return next(error);
    }

}

const delete_vendor_gig = async (req, res, next) => {
    const { _id } = await req.body; // Assuming the _id is passed in the request body
    console.log(req,"tsid" );
    console.log(_id,"tsgdfgfdid" );
    try {
        // Validate the ID format (optional)
        // Find and delete the record
        const deletedRecord = await Vendor_Gig_Schema.findByIdAndDelete(_id);
        if (!deletedRecord) {
            return res.status(404).json({ message: 'Record not found' });
        }
        return res.json({
            message: 'Record deleted successfully',
            deletedRecord,
        });
    } catch (error) {
        return next(error);
    }
};


const create_vendor_gig = async (req, res) => {
    const { body } = req;
    try {
        const {
            vender_id,
            gig_title,
            gig_discription,
            gig_image,
            keywords,
        } = body;

        const store_user_data = {
            vender_id,
            gig_title,
            gig_discription,
            gig_image,
            keywords

        };

        const save_user = await Vendor_Gig_Schema.create({
            ...store_user_data,
        });



        return res.json({
            message: "Successfully Created",
            data: save_user
        });
    } catch (error) {
        return next(error);
    }
}



const create_expert_gig = async (req, res) => {
    const { body } = req;
    try {
        const {
            vender_id,
            gig_title,
            gig_discription,
            gig_image,
            keywords,
        } = body;
        const store_user_data = {
            vender_id,
            gig_title,
            gig_discription,
            gig_image,
            keywords
        };
        const save_user = await Expert_Gig_Schema.create({
            ...store_user_data,
        });
        return res.json({
            message: "Successfully Created",
            data: save_user
        });
    } catch (error) {
        return next(error);
    }
}



const delete_expert_gig = async (req, res, next) => {
    const { _id } = await req.body; // Assuming the _id is passed in the request body
    console.log(req,"tsid" );
    console.log(_id,"tsgdfgfdid" );
    try {
        // Validate the ID format (optional)
        // Find and delete the record
        const deletedRecord = await Expert_Gig_Schema.findByIdAndDelete(_id);
        if (!deletedRecord) {
            return res.status(404).json({ message: 'Record not found' });
        }
        return res.json({
            message: 'Record deleted successfully',
            deletedRecord,
        });
    } catch (error) {
        return next(error);
    }
};


const get_expert_gig_by_id = async (req, res, next) => {
    const { vender_id } = req.body;
    try {
        const resultVariable = await Expert_Gig_Schema.find({ vender_id: vender_id })
        return res.json({
            message: "Get Successfully",
            data: resultVariable
        });
    } catch (error) {
        return next(error);
    }
}




























const get_vendor_git_by_id = async (req, res, next) => {
    const { vender_id } = req.body;
    try {
        const resultVariable = await Vendor_Gig_Schema.find({ vender_id: vender_id })

        return res.json({
            message: "Get Successfully",
            data: resultVariable
        });
    } catch (error) {
        return next(error);
    }
}

const get_vendor_profile_by_id = async (req, res, next) => {
    const { id } = req.params;

    try {
        const resultVariable = await Vendor_Schema.findById(id);

        if (!resultVariable) {
            return res.status(404).json({
                message: "Data not found",
            });
        }

        return res.json({
            message: "Get Successfully",
            data: resultVariable
        });
    } catch (error) {
        return next(error);
    }
}

const get_customers_recent_chats = async (req, res, next) => {
    const { current_vendor_id } = req.body

    try {
        // const current_user_id = '656f944f4b11f396e456aec2'

        const pipeline = [
            {
                $match: {
                    $or: [
                        {
                            sender: new ObjectId(
                                current_vendor_id
                            ),
                        },
                        {
                            receiver: new ObjectId(
                                current_vendor_id
                            ),
                        },
                    ],
                },
            },
            {
                $sort: {
                    timestamp: -1,
                },
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            {
                                $eq: [
                                    "$sender",
                                    new ObjectId(
                                        current_vendor_id
                                    ),
                                ],
                            },
                            "$receiver",
                            "$sender",
                        ],
                    },
                    latestMessage: {
                        $first: "$$ROOT",
                    },
                },
            },
            {
                $lookup: {
                    from: "create_customers",
                    // Replace with the actual name of your users collection
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "messages",
                    // Replace with the actual name of your messages collection
                    let: {
                        userId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $eq: ["$sender", "$$userId"],
                                        },
                                        {
                                            $eq: ["$receiver", "$$userId"],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $sort: {
                                timestamp: -1,
                            },
                        },
                        {
                            $limit: 1,
                        },
                    ],
                    as: "lastMessage",
                },
            },
            {
                $unwind: {
                    path: "$lastMessage",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    sender: 1,
                    receiver: 1,
                    message: "$lastMessage.message",
                    timestamp: "$lastMessage.timestamp",
                    "userDetails.Name": 1,
                    timeDifference: {
                        $abs: {
                            $subtract: [
                                new Date(),
                                "$lastMessage.timestamp",
                            ],
                        },
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    recentChats: {
                        $push: {
                            _id: "$_id",
                            sender: "$sender",
                            receiver: "$receiver",
                            message: "$message",
                            timestamp: "$timestamp",
                            userDetails: "$userDetails",
                            timeDifference: "$timeDifference",
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

module.exports = { create_vendor,get_expert_gig_by_id,delete_expert_gig, create_expert_gig, save_image,login_vendor,delete_vendor_gig, get_all_customers, create_vendor_gig, get_vendor_git_by_id, get_vendor_profile_by_id, get_matching_job, get_customers_recent_chats }
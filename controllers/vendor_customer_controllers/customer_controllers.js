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

const nodemailer = require("nodemailer");
require("dotenv").config();





const requiredFields = [
    'type',
    'zipCode',

    // TS work
    // 'Profile_Image',

    // 
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

            // TS work
            Profile_Image,

            // 
            Home_Address,
            zipCode,
            phoneno

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
            Profile_Image,
            email,
            password: secure_password,
            Home_Address,
            zipCode,
            phoneno

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
            // Profile_Image: Profile_Image,
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


// Ts work 
const save_image1 = async (req, res, next) => {
    try {
        const { imagePath, userId } = req.body;
        
      
    
        // Find the document with the user ID in the create_vendor collection
        let customer = await Customer_Schema.findOne({ _id: userId });
        // let customer = await Customer_Schema.findOne({ _id: '658accf531fdde44bc3f16e1' });
        
        console.log('lllllTSCustomersss' , customer);

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
// 




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

// const create_customer_job = async (req, res, next) => {
 
//     const { body } = req
//     try {
//         const {
//             type,
//             selected_queries,
//             user_id,
//             details,
//             images,
//             // title,
//             location,
//             // to_date,
//             // to_time,
//             // from_time
//             available,
//             zipcode,
//             emergency,
//             note
        


            
           
           
//         } = body;

//         const availabilities = available.map((item) => ({
//             date: item.date,
//             times: item.times,
//         }));


//         const availabilitie = available.map((item) => ({
//             date: item.date,
//             times: item.times,
//         }));

        


//         const store_user_data = {
//             type,
//             selected_queries,
//             user_id: new ObjectId(user_id),
//             details,
//             images,
//             // title,
//             location,
//             // to_date, 
//             // to_time,
//             // from_time
//            availablity_times: availabilities,
//            availablity_time: availabilitie,
//            zipcode,
//         //    emergency:'emergencyts',
//         emergency,
//         note
         
            
           

//         };
//         console.log(store_user_data);
//         const save_user = await Customer_Job_Schema.create({
//             ...store_user_data,
//         });

//         return res.json({
//             message: "Create Successfully",
//             data: save_user,
//         });
//     } catch (error) {
//         return next(error);
//     }
// }





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
            note
        


            
           
           
        } = body;



        // const availabilities = available.map((item) => ({
        //     date: item.date,
        //     times: item.times,
        // }));


        // const availabilitie = available.map((item) => ({
        //     date: item.date,
        //     times: item.times,
        // }));



 // Check if 'available' array has elements
 const availabilities = available && available.length > 0
 ? available.map(item => ({ date: item.date || "2000-01-01", times: item.times }))
 : [{ date: "2000-01-01", times: [] }];  // Default value if 'available' is empty or undefined

// Check if 'availabilitie' array has elements
const availabilitie = available && available.length > 0
 ? available.map(item => ({ date: item.date || "2000-01-01", times: item.times }))
 : [{ date: "2000-01-01", times: [] }];  // Default value if 'available' is empty or undefined



        


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
           availablity_time: availabilitie,
           zipcode,
        //    emergency:'emergencyts',
        emergency,
        note
         
            
           

        };
        console.log(store_user_data);
        
        const save_user = await Customer_Job_Schema.create({
            ...store_user_data,
        });



        
            // const database = client.db('yourDatabaseName'); // Replace with your database name
            // const collection = database.collection('Vendor_Schema'); // Replace with your collection name

            // Build the query to filter based on 'zipcode' and 'selected_queries'
            const query = {
                "zipCode": zipcode,
                "selected_queries": selected_queries
            };

            // Use the find method with the query
            const result = await Vendor_Schema.find(query).select('email').exec();

            // You can now use the 'result' array as needed

            // Example: Log the result
            console.log(result,"mAtched vendors");



                                                // Create a Nodemailer transporter
                                    const transporter = nodemailer.createTransport({
                                        host: "smtp.gmail.com",
                                        port: 465,
                                        auth: {
                                            user: "mromaa2001@gmail.com",
                                            pass: "zlnlbzjdjcovhkod"
                                        }
                                    });

            let i=0;
            for(i =0; i<=result.length-1; i++)

            {       
                const {email} =result[i];
                
                console.log({email},"TSTSTS")
            



                // Define the email options
                        const mailOptions = {
                            from: 'talhadeveloper7@gmail.com 📧 Honest Home Hub', // Replace with your email address
                            to: email, // Convert the array of emails to a comma-separated string
                            subject: ' New Leads Alert',
                           
                         
                            html :
                                        `
                                        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
  <head>
    <!-- Compiled with Bootstrap Email version: 1.3.1 -->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
    <style type="text/css">
      body,table,td{font-family:Helvetica,Arial,sans-serif !important}.ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div{line-height:150%}a{text-decoration:none}*{color:inherit}a[x-apple-data-detectors],u+#body a,#MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}img{-ms-interpolation-mode:bicubic}table:not([class^=s-]){font-family:Helvetica,Arial,sans-serif;mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;border-collapse:collapse}table:not([class^=s-]) td{border-spacing:0px;border-collapse:collapse}@media screen and (max-width: 600px){.w-lg-48,.w-lg-48>tbody>tr>td{width:auto !important}.w-full,.w-full>tbody>tr>td{width:100% !important}.w-16,.w-16>tbody>tr>td{width:64px !important}.p-lg-10:not(table),.p-lg-10:not(.btn)>tbody>tr>td,.p-lg-10.btn td a{padding:0 !important}.p-2:not(table),.p-2:not(.btn)>tbody>tr>td,.p-2.btn td a{padding:8px !important}.pr-4:not(table),.pr-4:not(.btn)>tbody>tr>td,.pr-4.btn td a,.px-4:not(table),.px-4:not(.btn)>tbody>tr>td,.px-4.btn td a{padding-right:16px !important}.pl-4:not(table),.pl-4:not(.btn)>tbody>tr>td,.pl-4.btn td a,.px-4:not(table),.px-4:not(.btn)>tbody>tr>td,.px-4.btn td a{padding-left:16px !important}.pr-6:not(table),.pr-6:not(.btn)>tbody>tr>td,.pr-6.btn td a,.px-6:not(table),.px-6:not(.btn)>tbody>tr>td,.px-6.btn td a{padding-right:24px !important}.pl-6:not(table),.pl-6:not(.btn)>tbody>tr>td,.pl-6.btn td a,.px-6:not(table),.px-6:not(.btn)>tbody>tr>td,.px-6.btn td a{padding-left:24px !important}.pt-8:not(table),.pt-8:not(.btn)>tbody>tr>td,.pt-8.btn td a,.py-8:not(table),.py-8:not(.btn)>tbody>tr>td,.py-8.btn td a{padding-top:32px !important}.pb-8:not(table),.pb-8:not(.btn)>tbody>tr>td,.pb-8.btn td a,.py-8:not(table),.py-8:not(.btn)>tbody>tr>td,.py-8.btn td a{padding-bottom:32px !important}*[class*=s-lg-]>tbody>tr>td{font-size:0 !important;line-height:0 !important;height:0 !important}.s-4>tbody>tr>td{font-size:16px !important;line-height:16px !important;height:16px !important}.s-6>tbody>tr>td{font-size:24px !important;line-height:24px !important;height:24px !important}}
    </style>
  </head>
  <body class="bg-red-100" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;" bgcolor="#002758">
    <table class="bg-red-100 body" valign="top" role="presentation" border="0" cellpadding="0" cellspacing="0" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;" bgcolor="#f8d7da">
      <tbody>
        <tr>
          <td valign="top" style="line-height: 24px; font-size: 16px; margin: 0;" align="left" bgcolor="#002758">
            <table class="container" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tbody>
                <tr>
                  <td align="center" style="line-height: 24px; font-size: 16px; margin: 0; padding: 0 16px;">
                    <!--[if (gte mso 9)|(IE)]>
                      <table align="center" role="presentation">
                        <tbody>
                          <tr>
                            <td width="600">
                    <![endif]-->
                    <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
                      <tbody>
                        <tr>
                          <td style="line-height: 24px; font-size: 16px; margin: 0;" align="left">
                            <table class="s-6 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%">
                              <tbody>
                                <tr>
                                  <td style="line-height: 24px; font-size: 24px; width: 100%; height: 24px; margin: 0;" align="left" width="100%" height="24">
                                    &#160;
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <img class="w-16" src="https://honesthomehub.com/static/media/honestlogo.2e925db138b627463f87.png" style="height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; width: 150px; border-style: none; border-width: 0;" width="150">
                            <table class="s-6 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%">
                              <tbody>
                                <tr>
                                  <td style="line-height: 24px; font-size: 24px; width: 100%; height: 24px; margin: 0;" align="left" width="100%" height="24">
                                    &#160;
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <div class="space-y-4">
                              <h1 class="text-4xl fw-800" style="padding-top: 0; padding-bottom: 0; font-weight: 800 !important; vertical-align: baseline; font-size: 36px; line-height: 43.2px; margin: 0; color:white" align="left">You've just acquired a new lead.</h1>
                              <table class="s-4 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%">
                                <tbody>
                                  <tr>
                                    <td style="line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;" align="left" width="100%" height="16">
                                      &#160;
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <p class="" style="line-height: 24px;font-size: 16px;width: 100%;margin: 0;color: white; font-weight: 700;">Exciting news! We've just uncovered a job opportunity that aligns perfectly with your skills and experience on <a href="https://honesthomehub.com/" style="color:#B22234">Honest Home Hub</a> .</p>
                                <br/>
                              <p class="" style="line-height: 24px;font-size: 16px;width: 100%;margin: 0;color: white; font-weight: 700;"> Our intelligent matching system has identified you as a strong candidate for this role.</p>
                              <table class="s-4 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100% ; color: white;" width="100%" >
                                <tbody>
                                  <tr>
                                    <td style="line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;" align="left" width="100%" height="16">
                                      &#160;
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <table class="btn btn-red-500 rounded-full px-6 w-full w-lg-48" role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-radius: 9999px; border-collapse: separate !important; width: 192px;" width="192">
                                <tbody>
                                  <tr>
                                    <td style="line-height: 24px; font-size: 16px; border-radius: 9999px; width: 192px; margin: 0;" align="center" bgcolor="#dc3545" width="192">
                                      <!-- <a href="https://app.bootstrapemail.com/templates" style="color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, sans-serif; text-decoration: none; border-radius: 9999px; line-height: 20px; display: block; font-weight: normal; white-space: nowrap; background-color: #dc3545; padding: 8px 24px; border: 1px solid #dc3545;">Track Your Order</a> -->
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <table class="s-6 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%">
                              <tbody>
                                <tr>
                                  <td style="line-height: 24px; font-size: 24px; width: 100%; height: 24px; margin: 0;" align="left" width="100%" height="24">
                                    &#160;
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table class="card rounded-3xl px-4 py-8 p-lg-10" role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-radius: 24px; border-collapse: separate !important; width: 100%; overflow: hidden; border: 1px solid #e2e8f0;" bgcolor="#ffffff">
                              <tbody>
                                <tr>
                                  <td style="line-height: 24px; font-size: 16px; width: 100%; border-radius: 24px; margin: 0; padding: 40px;" align="left" bgcolor="#ffffff">
                                    <h3 class="text-center" style="padding-top: 0; padding-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 28px; line-height: 33.6px; margin: 0; font-weight: 600;color: #B22234;" align="center">Matching Lead</h3>
                                    <!-- <p class="text-center text-muted" style="line-height: 24px; font-size: 16px; color: #718096; width: 100%; margin: 0;" align="center">Receipt #ABCD-EFGH</p> -->
                                    <table class="p-2 w-full" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%">
                                      <tbody>
                                        <tr>
                                          <td style="line-height: 24px; font-size: 16px; width: 100%; margin: 0; padding: 8px; font-weight: 800;color: #B22234;" align="left" width="100%">Type</td>
                                          <td class="text-right" style="line-height: 24px; font-size: 16px; width: 100%; margin: 0; padding: 8px; font-weight: 800;color: #B22234;" align="right" width="100%">${selected_queries}</td>
                                        </tr>
                                        <tr>
                                          <td style="line-height: 24px; font-size: 16px; width: 100%; margin: 0; padding: 8px; font-weight: 800;color: #B22234;" align="left" width="100%">Location</td>
                                          <td class="text-right" style="line-height: 24px; font-size: 16px; width: 100%; margin: 0; padding: 8px; font-weight: 800;color: #B22234;" align="right" width="100%">${location}</td>
                                        </tr>
                                        <tr>
                                        <td style="line-height: 24px; font-size: 16px; width: 100%; margin: 0; padding: 8px; font-weight: 800;color: #B22234;" align="left" width="100%">Details</td>
                                        <td class="text-right" style="line-height: 24px; font-size: 16px; width: 100%; margin: 0; padding: 8px; font-weight: 800;color: #B22234;" align="right" width="100%">${details}</td>
                                        <tr>
                                      
                                        </tr>
                                        <tr>
                                          <!-- <td class="fw-700 border-top" style="line-height: 24px; font-size: 16px; border-top-width: 1px !important; border-top-color: #e2e8f0 !important; border-top-style: solid !important; width: 100%; font-weight: 700 !important; margin: 0; padding: 8px;" align="left" width="100%">Amount paid</td> -->
                                          <!-- <td class="fw-700 text-right border-top" style="line-height: 24px; font-size: 16px; border-top-width: 1px !important; border-top-color: #e2e8f0 !important; border-top-style: solid !important; width: 100%; font-weight: 700 !important; margin: 0; padding: 8px;" align="right" width="100%">$42.00</td> -->
                                        </tr>
                                      </tbody>
                                    </table>
                                    <table class="s-6 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%">
                                      <tbody>
                                        <tr>
                                          <td style="line-height: 24px; font-size: 24px; width: 100%; height: 24px; margin: 0;" align="left" width="100%" height="24">
                                            &#160;
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <table class="hr" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                                      <tbody>
                                        <tr>
                                          <td style="line-height: 24px; font-size: 16px; border-top-width: 1px; border-top-color: #e2e8f0; border-top-style: solid; height: 1px; width: 100%; margin: 0;" align="left">
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <table class="s-6 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%">
                                      <tbody>
                                        <tr>
                                          <td style="line-height: 24px; font-size: 24px; width: 100%; height: 24px; margin: 0;" align="left" width="100%" height="24">
                                            &#160;
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">If you have any questions, contact us at <a href="honesthomehub.com" style="color: #B22234;"><span class="__cf_email__" data-cfemail="1f57766f5c706d6f5f7a677e726f737a317c7072">HonestHomeHub@gmail.com</span></a>.</p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table class="s-6 w-full" role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;" width="100%">
                              <tbody>
                                <tr>
                                  <td style="line-height: 24px; font-size: 24px; width: 100%; height: 24px; margin: 0;" align="left" width="100%" height="24">
                                    &#160;
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <!--[if (gte mso 9)|(IE)]>
                    </td>
                  </tr>
                </tbody>
              </table>
                    <![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  <script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script></body>
</html>

                                        
                                        `
                            
                        };


                        // Send the email
                                    transporter.sendMail(mailOptions, (error, info) => {
                                        if (error) {
                                            console.error('Error sending email:', error);
                                            return res.status(500).json({ error: 'Error sending email' });
                                        }

                                        console.log('Email sent:', info.response);
                                        return res.json({
                                            message: "Emails Sent Successfully",
                                            data: result
                                        });

                                    });

            }

        

            






        


        // const save_user = await Customer_Job_Schema.create({
        //     ...store_user_data,
        // });

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


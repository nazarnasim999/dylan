const Auth_Token_DTO = require("../../dto/auth_tokens_dto");
const User_DTO = require("../../dto/user_dto");
const { Admin_Auth_Schema } = require("../../models/admin_auth_model copy");
const Message = require("../../models/messageModel");
const { User_Tokens_Schema } = require("../../models/user_tokens_model");
const { Bcrypt_Service } = require("../../services/bcrypt_services");
const { JWT_Generate_Token_Handle } = require("../../services/jwt_services");
const { ObjectId } = require('mongodb');

// const get_admin = async (req, res, next) => {

//     console.log(req.body);
    
//     try {
//       const record = await Admin_Auth_Schema.findById(req.body);
  
//       if (!record) {
//         return res.status(404).json({ error: 'Record not found' });
//       }
  
//       res.json(record,"success");
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   };



// const get_admin = async (req, res, next) => {
//     try {
//       const userId = req.body.userId; // Assuming userId is in the request body

//       console.log('fafsgfgdfgdfg', userId);

//       if (!userId) {
//         return res.status(400).json({ error: 'User ID is missing in the request body' });
//       }

//       const record = await Admin_Auth_Schema.findById(userId);
  
//       if (!record) {
//         return res.status(404).json({ error: 'Record not found' });
//       }
  
//       res.json({ record, message: "success" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
// };




const get_admin = async (req, res, next) => {
    try {
      const userId = req.params.id // Assuming userId is in the request body

      console.log('User ID:', userId);

      if (!userId) {
        console.error('User ID is missing in the request body');
        return res.status(400).json({ error: 'User ID is missing in the request body' });
      }

      const record = await Admin_Auth_Schema.findById(userId);
  
      if (!record) {
        console.error('Record not found');
        return res.status(404).json({ error: 'Record not found' });
      }
  
      
       const rec=record.selected_queries;
      console.log('Record found:', rec);

      res.json({ rec, message: "success" });
    } catch (error) {
      console.error('Internal Server Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { get_admin };



  

  
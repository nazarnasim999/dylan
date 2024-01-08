const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require('../config/index');
const { User_Tokens_Schema } = require('../models/user_tokens_model');


class JWT_Service {
    // sign jwt token
    static sign_jwt_token(payload_data, secret_key, expiresIn) {
        return jwt.sign(payload_data, secret_key, { expiresIn: expiresIn });
    }

    // verify jwt token
    static verify_jwt_token(token, secret_key) {
        return jwt.verify(token, secret_key)
    }

    // decode jwt token
    static decode_jwt_token(token) {
        return jwt.decode(token)
    }


    // check jwt token is expired or not
    static is_expired_token(exp) {
        let is_expired = false
        if (Date.now() >= exp * 1000) {
            is_expired = true;
        }

        return is_expired
    }
}



class JWT_Generate_Token_Handle {
    static save_user_tokens = async (user_id) => {
        const token_payload = {
            id: user_id
        }
        const access_token = JWT_Service.sign_jwt_token(token_payload, ACCESS_TOKEN_SECRET,'365d')
        return { access_token }
    }

}





module.exports = { JWT_Service, JWT_Generate_Token_Handle };


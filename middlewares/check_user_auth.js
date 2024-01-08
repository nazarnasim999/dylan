const { User_Auth_Schema } = require("../models/user_auth_model")
const { User_Tokens_Schema } = require("../models/user_tokens_model")
const { JWT_Service } = require("../services/jwt_services")
const { exception_routes } = require("../utils/constants")

const check_user_auth = async (req, res, next) => {

    const { headers, originalUrl, body } = req

    try {

        let token
        let token_type = 'access_token'


        if (exception_routes.includes(originalUrl)) {
            return next()
        }

        if (originalUrl === '/renew-token') {
            const { refresh_token } = body
            if (!refresh_token) {
                return next({ status: 401, message: 'Refresh token not found!' })
            }
            token = refresh_token
            token_type = 'refresh_token'

        }
        else {
            const find_headers_token = headers.authorization
            if (!find_headers_token) {
                return next({ status: 401, message: 'Token should be passed in headers!' })
            }
            token = find_headers_token.split(' ')[1]
            if (!token) {
                return next({ status: 401, message: 'Token should be passed in headers!' })
            }
            token_type = 'access_token'
        }
        
        
        const find_token_node = await User_Tokens_Schema.findOne({ [token_type]: token })
        
        if (!find_token_node) {
            return next({ status: 498, message: 'Invalid token' })
        }
        
        const { id, exp, iat } = JWT_Service.decode_jwt_token(token)
        
        const is_expired = JWT_Service.is_expired_token(exp)
        
        if (is_expired) {
            return next({ status: 401, message: 'Invalid token' })
        }
        
        const find_user = await User_Auth_Schema.findById(id, { password: 0 })
        
        req.user_data = find_user
        req.user_id = id
        req.token_id = find_token_node._id

        next()
        return

    } catch (error) {
        next(error)
    }

}

module.exports = check_user_auth;
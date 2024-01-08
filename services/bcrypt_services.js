const bcrypt = require('bcryptjs')

class Bcrypt_Service {
    static bcrypt_hash_password = async (payload) => {
        const salt = await bcrypt.genSalt(12)
        const secure_password = await bcrypt.hash(payload, salt)

        return secure_password
    }
    static bcrypt_compare_password = async (user_password, password_hash) => {
        const password_compare = await bcrypt.compare(user_password, password_hash)

        return password_compare
    }

}



module.exports = { Bcrypt_Service }
class User_DTO{
    constructor(user){
        this._id = user._id;
        this.email = user.email;
        // this.user_type = user.user_type;
    }
}

module.exports = User_DTO;
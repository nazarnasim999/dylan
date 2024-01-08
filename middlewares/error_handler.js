const {ValidationError} = require('joi');

const error_handler = (error, req, res, next) => {
    // default error
    let status = 500;
    let data = {
        message: 'Internal Server Error'
    }

    if (error instanceof ValidationError){
        status = 401;
        data.message = error.message;
        return res.status(status).json(data);
    }

    if (error.status){
        status = error.status;
    }

    if (error.message){
        data.message = error.message;
    }
    if (error.is_missing){
        data.is_missing = error.is_missing;
    }

    return res.status(status).json(data);
}

module.exports = error_handler;
const generateOtp = () => {

    let otp = ''
    for (let i = 0; i < 4; i++) {
        const ranVal = Math.round(Math.random() * 9)
        otp = otp + ranVal
    }
    return otp
}


module.exports = { generateOtp }
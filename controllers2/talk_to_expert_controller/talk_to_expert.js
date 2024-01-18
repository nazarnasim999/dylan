const { Customer_Schema } = require("../../models/customer_model");
const Req_Session = require("../../models/req_session_model");

const talk_to_expert = async (req, res) => {
    const { body } = req;
    try {
        const req_Session = await Req_Session.create({ ...body })
        return res.status(200).send({ message: "Session created successfully", success: true })
    } catch (error) {
        console.log("err", error);
    }
}
const get_session_by_id = async (req, res) => {
    const { body } = req;
    try {
        const req_Session = await Req_Session.create({ ...body })
        return res.status(200).send({ message: "Session created successfully", success: true })
    } catch (error) {
        console.log("err", error);
    }
}





module.exports = { talk_to_expert, get_session_by_id }






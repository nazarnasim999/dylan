const Message = require("../../models/messageModel");



const saveMessage = async (req, res, next) => {
    const { sender, receiver, message } = req.body
    try {
        const newMessage = new Message({
            sender,
            receiver,
            message,
        });
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
        return savedMessage;
    } catch (error) {
        throw error;
    }
};

const getMessages = async (req, res, next) => {
    const { user1, user2 } = req.body
    try {
        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 },
            ],
        }).sort({ timestamp: 1 });
        res.status(200).json(messages);
        return messages;
    } catch (error) {
        throw error;
    }
};

module.exports = { saveMessage, getMessages };
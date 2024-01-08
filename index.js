const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const fileUpload = require('express-fileupload');
const connectToMongo = require('./database');
const all_routes = require('./routes/index');
const error_handler = require("./middlewares/error_handler");
const Message = require('./models/messageModel');
const Req_Session = require('./models/req_session_model');
// const { PORT } = require('./config');


const app = express();
const server = http.createServer(app);
// const io = socketIo(server);
const PORT = process.env.PORT || 5000;



// Use cors middleware
// app.use(cors());

app.use(
    cors({
        origin: function (origin, callback) {
            return callback(null, true);
        },
        optionsSuccessStatus: 200,
        credentials: true,
    })
)


app.use(express.json())
app.use(bodyParser.json());

app.use(fileUpload({
    useTempFiles: true
}))

// Initialized all routes
app.use(all_routes)

// Initial Route
app.get('*', (req, res) => {
    res.send('<h1 style="text-align:center;">Backend is working...</h1>');

})



app.use(error_handler)

connectToMongo()



const io = socketIo(server, {
    cors: {
        // origin: "*",
        methods: "*",
    },
}); // Initialize socket.io
let expertAccepted = false;
let customerSocketId;

// io.on("connection", (socket) => {
//     // console.log(socket.id);
//     console.log('A user connected');

//     socket.on("join_room", (data) => {
//         socket.join(data);
//     });


//     //     // Listen for messages from the frontend
//     socket.on('send_message', (data) => {
//         const message = new Message({
//             sender: data.sender,
//             receiver: data.receiver,
//             message: data.message,
//         });

//         message.save();
//     });

//     socket.on('get_previous_messages', (data) => {
//         // Fetch previous messages from the database based on sender and receiver
//         Message.find({ $or: [{ sender: data.sender, receiver: data.receiver }, { sender: data.receiver, receiver: data.sender }] })
//             .then((messages) => {
//                 socket.emit("previous_messages", messages);
//             })
//             .catch((error) => {
//                 console.error("Error fetching previous messages:", error);
//             });
//     });

// });
const users = {};  // To keep track of connected users

const experts = []; // Experts ka list
io.on("connection", (socket) => {
    console.log('A user connected');

    socket.on("join_room", (data) => {
        socket.join(data);
    });

    socket.on('send_message', (data) => {
        const message = new Message({
            sender: data.sender,
            receiver: data.receiver,
            message: data.message,
        });

        message.save();
    });

    socket.on('get_previous_messages', (data) => {
        Message.find({
            $or: [
                { sender: data.sender, receiver: data.receiver },
                { sender: data.receiver, receiver: data.sender }
            ]
        })
            .then((messages) => {
                socket.emit("previous_messages", messages);
            })
            .catch((error) => {
                console.error("Error fetching previous messages:", error);
            });
    });

    // socket.on('request_expert', (data) => {
    //     console.log('Received request_expert event:', data);
    //     customerSocketId = data.customerId;

    //     // io.to('expert-room').emit('expert_request', { customerId: data.customerId });
    // });

    // socket.on('accept_request', () => {
    //     console.log('Received accept_request event');
    //     expertAccepted = true;

    //     // io.to(customerSocketId).emit('request_accepted', { expertId: socket.id });
    // });

    // socket.on('disconnect', () => {
    //     console.log('A user disconnected:', socket.id);
    //     expertAccepted = false;
    // });



    experts.push(socket);

    // User se request aayi hai
    socket.on("userRequest", (requestData) => {
        console.log("dsdsdsdsds",requestData)
        // Yahan experts ko request bhejdo
        experts.forEach((expertSocket) => {
            expertSocket.emit("requestFromUser", requestData);
        });
    });

    // Expert ne request accept ki hai
    socket.on("requestAccepted", async (userSocket) => {
        console.log("Request acceptedsssssssssss", userSocket)

        experts.forEach((custSocket) => {
            custSocket.emit("requestResponse", userSocket);
        });
        // socket.emit("requestResponse", userSocket)
        // if (userSocket.accepted) {

        //     let find = await Req_Session.findOneAndUpdate({ customerId: userSocket.customerId, vendorId: userSocket.vendorId }, { ...userSocket, accepted: true, expertFound: true }, { new: true })
        //     // userSocket.emit("requestAcceptedByExpert");
        //     console.log("accepted");
        //     // socket.to(userSocket.expertId).emit("requestAcceptedByExpert", { expertId: socket.id });
        //     socket.emit("requestAcceptedByExpert", { expertId: socket.id });
        //     socket.emit("requestResponse", { accepted: true, expertId: userSocket.expertId });
        // }
        // // socket.emit("requestResponse", userSocket)
        // // expertId: '6570a161252b429f66e5980f'
        // socket.emit("requestResponse", userSocket)
        // Request accept hui, ab user ko update karo
        // User ke socket ko identify karna hoga for communication
    });

    socket.on("requestRejected", async (requestData) => {
        // Request reject hui, user ko batao
        console.log("requestData.userId", requestData.userId);
        // const userSocket = getUserSocket(requestData.userId); // Get user's socket
        const userSocket = requestData.userId // Get user's socket
        if (!userSocket.accepted) {
            let find = await Req_Session.findOneAndUpdate({ customerId: userSocket.customerId, vendorId: userSocket.vendorId }, { ...userSocket, accepted: false, expertFound: true }, { new: true })
            // userSocket.emit("requestRejectedByExpert");
            console.log("rejected");
        }
        // socket.emit("requestResponse", { accepted: false })
    });


});



server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


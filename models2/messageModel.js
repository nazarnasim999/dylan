const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;



// [
    //   {
    //     $match: {
    //       $or: [
    //         { sender: ObjectId('656f4a211b3e5bb0ff9e5164') },
    //         { receiver: ObjectId('656f4a211b3e5bb0ff9e5164') },
    //       ],
    //     },
    //   },
    //   {
    //     $sort: { timestamp: -1 },
    //   },
    //   {
    //     $group: {
    //       _id: {
    //         $cond: [
    //           { $eq: ['$sender', ObjectId('656f4a211b3e5bb0ff9e5164')] },
    //           '$receiver',
    //           '$sender',
    //         ],
    //       },
    //       latestMessage: { $first: '$$ROOT' },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'create_vendors', // Replace with the actual name of your users collection
    //       localField: '_id',
    //       foreignField: '_id',
    //       as: 'userDetails',
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$userDetails',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'messages', // Replace with the actual name of your messages collection
    //       let: { userId: '$_id' },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $or: [
    //                 { $eq: ['$sender', '$$userId'] },
    //                 { $eq: ['$receiver', '$$userId'] },
    //               ],
    //             },
    //           },
    //         },
    //         { $sort: { timestamp: -1 } },
    //         { $limit: 1 },
    //       ],
    //       as: 'lastMessage',
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$lastMessage',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       sender: 1,
    //       receiver: 1,
    //       message: '$lastMessage.message',
    //       timestamp: '$lastMessage.timestamp',
    //       'userDetails.Name': 1,
    //     },
    //   },
    // ]
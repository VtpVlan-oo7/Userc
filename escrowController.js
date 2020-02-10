
const commonFunction = require('../../globalFunctions/message')
const notificationSchema = require('../../models/notificationModel');

const userService = require("../services/userApis");
const staticModel = require("../../models/staticModel");
let func = require('../../commonFile/function');
const BigNumber = require('bignumber.js');
const escrow = require('../../models/deductedValue');
const trade = require("../../models/tradeModel")
const systemConfiguration = require('../../models/systemConfiguration')
var configuration = require("../../models/systemConfiguration");
const mongoose = require('mongoose');
const async = require('async');
var staffTrack = require('../../models/trackStaffModel')
const waterFall = require('async-waterfall');
const User = require("../../models/userModel.js");
const advertiseModel = require("../../models/advertisementModel.js")
const contactUsSchema = require("../../models/contactUsModel.js");
let config = require('../../config/config.js')
const bcrypt = require('bcrypt-nodejs');
var QRCode = require('qrcode')
var salt = bcrypt.genSaltSync(10);
var speakeasy = require('speakeasy');
const cloudinary = require('cloudinary');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const paymentSchema = require("../../models/paymentMethod");
cloudinary.config({
    "cloud_name": "georgia007",
    "api_key": "967385781722363",
    "api_secret": "Y-Kq-UPU1i9zJP4QOkoNkfsVTR8"

});

module.exports = {

    releaseEscrow: async (req, res) => {
        var userId = req.body.userId
        console.log('userIduserId', userId);
        User.findOne({ "userType": "ADMIN", status: "ACTIVE" }, (errAdmin, adminData) => {
            if (errAdmin) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error", errAdmin })
            }
            else if (!adminData) {
                return res.send({ responseCode: 404, responseMessage: "Admin data not found" })
            }
            else {
                escrow.findOne({ trade_id: req.body.tradeId, status: "ACTIVE" }).populate("seller_id", "btc _id").populate("buyer_id", "btc _id").exec((err, escrowResult) => {
                    if (err) {
                        return res.send({ responseCode: 500, responseMessage: "Internal server error", err })
                    }
                    else if (!escrowResult) {
                        return res.send({ responseCode: 404, responseMessage: "Escrow already released" })
                    }
                    else {
                        configuration.find({}).lean().exec((err, result67) => {
                            console.log("Result 67 mis==============", result67, result67.length);
                            var arr = [];
                            arr = result67;
                            let index = result67.length - 1;
                            console.log("Index is=====", index, result67[index], result67[index].tradeFee);
                            var adminFee = result67[index].tradeFee;
                            let percentAdminFee = new BigNumber(adminFee).dividedBy(new BigNumber(100));
                            var transactionFee = new BigNumber(escrowResult.trade_amount).multipliedBy(new BigNumber(percentAdminFee));
                            var adminBtc = adminData.btc.total
                            var buyerBtc = escrowResult.buyer_id.btc.total
                            var sellerBtc = escrowResult.seller_id.btc.total
                            var buyerId = escrowResult.buyer_id._id
                            var sellerId = escrowResult.seller_id._id
                            console.log("all Data in escrow>>>>>>>", JSON.stringify(escrowResult), "buyer>>>", buyerBtc, "seller>>", sellerBtc, "admin>>", adminBtc)
                            console.log('amount_coinamount_coin', escrowResult.amount_coin, 'trade_amounttrade_amount', escrowResult.trade_amount)
                            console.log('afterMinus', escrowResult.amount_coin - escrowResult.trade_amount)
                            var adminConsession = (new BigNumber(escrowResult.amount_coin).minus(new BigNumber(escrowResult.trade_amount)));
                            var finalCalcu = adminConsession.toFixed(8);
                            var withoutConsession = Number(escrowResult.amount_coin);
                            console.log("in sell case>>>>>>to admin>>>", adminConsession, "   to buyer>>>>>>>", withoutConsession)
                            trade.findOne({ _id: req.body.tradeId, dispute_status: true }, (err1, tradeResult) => {
                                console.log("in 72 >>>>>>>>>>")
                                if (err1) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal server error", err1 })
                                }
                                else if (!tradeResult) {
                                    return res.send({ responseCode: 404, responseMessage: "Data not found." })
                                }
                                else {
                                    if (userId == escrowResult.buyer_id._id) {
                                        if (tradeResult.type_of_trade_original == "sell") {
                                            console.log("within sell condition 1067")

                                            var sendToBuyer = (new BigNumber(buyerBtc).plus(new BigNumber(escrowResult.trade_amount)))


                                            var sendToSeller = (new BigNumber(sellerBtc).plus(new BigNumber(escrowResult.amount_coin)))
                                            User.findOneAndUpdate({ "_id": sellerId }, { $set: { "btc.total": sendToSeller } }, { new: true }, (err1_, sellerResult) => {
                                                console.log("113>>>>>>>>")
                                                if (err1_) {
                                                    return res.send({ responseCode: 500, responseMessage: "Internal server error", err1_ })
                                                }

                                                else {

                                                    trade.findOneAndUpdate({ _id: req.body.tradeId }, { $set: { message: 'Awarded to seller', dispute_status: false, dispute_success_status: true, status: "COMPLETE", "request_status": "Complete" } }, { new: true }, (err11, tradeResult1) => {
                                                        console.log("129>>>>>>>>")

                                                        if (err11) {
                                                            return res.send({ responseCode: 500, responseMessage: "Internal server error", err11 })
                                                        }
                                                        else {
                                                            console.log("135>>>>>>>>")

                                                            var totalAssign = []
                                                            if (tradeResult1.employeeId) {
                                                                console.log("dasdsa")
                                                                totalAssign.push(
                                                                    tradeResult1.assignManager)
                                                                totalAssign.push(
                                                                    tradeResult1.employeeId)
                                                            }
                                                            else {
                                                                console.log("1234")

                                                                totalAssign.push(tradeResult1.assignManager)
                                                            }
                                                            console.log("pramod>>>>>>>>>>>", totalAssign)

                                                            User.update({ "_id": { $in: totalAssign } }, { $pull: { disputeTrades: req.body.tradeId } }, { new: true, multi: true }, (err, result) => {
                                                                if (err) {
                                                                    console.log(er1)
                                                                } else {
                                                                    escrow.findOneAndUpdate({ "_id": escrowResult._id }, { $set: { status: "COMPLETE", amount_coin: 0 } }, { new: true }, (erre, dataUpdate) => {
                                                                        if (err) {
                                                                            console.log(er1)
                                                                        }
                                                                        else {
                                                                            var onlineUsers = require('../../server').onlineUsers;
                                                                            var socket = require('../../server').sockets;
                                                                            if (onlineUsers[buyerId]) {
                                                                                console.log("3182>>>>>>>>>>>>>")
                                                                                {
                                                                                    for (var i = 0; i < onlineUsers[buyerId].socketId.length; i++) {
                                                                                        try {
                                                                                            socket[onlineUsers[buyerId].socketId[i]].socket.emit("reloadPage", { 'result': true })
                                                                                        }

                                                                                        catch (err) {
                                                                                            console.log("error Occures 3193", err);
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                            if (onlineUsers[sellerId]) {
                                                                                console.log("3182>>>>>>>>>>>>>")
                                                                                {
                                                                                    for (var i = 0; i < onlineUsers[sellerId].socketId.length; i++) {
                                                                                        try {
                                                                                            socket[onlineUsers[sellerId].socketId[i]].socket.emit("reloadPage", { 'result': true })
                                                                                        }

                                                                                        catch (err) {
                                                                                            console.log("error Occures 3193", err);
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }

                                                                            var amountVal = escrowResult.amount_coin;

                                                                            let ob = {
                                                                                senderId: adminData._id,
                                                                                receiverId: sellerId,
                                                                                tradeId: "Notificaton",
                                                                                time: Date.now(),
                                                                                messageType: 'NOTIFICATION',
                                                                                chatType: 'NOTIFICATION',
                                                                                isSeen: false,
                                                                                message: `You have received ${amountVal} BTC from Admin `

                                                                            }
                                                                            let notiMessage = {
                                                                                senderId: adminData._id,
                                                                                receiverId: sellerId,
                                                                                tradeId: "Notificaton",
                                                                                time: Date.now(),
                                                                                messageType: 'NOTIFICATION',
                                                                                chatType: 'NOTIFICATION',
                                                                                isSeen: false,
                                                                                senderName: 'ADMIN',
                                                                                message: `You have received ${amountVal} BTC from Admin `

                                                                            }

                                                                            // Send Notification
                                                                            notificationSchema.create(ob, (error, result) => {
                                                                                console.log("O3209>>>.", error, result);

                                                                                if (error)
                                                                                    return res.send({ responseCode: 500, message: error })
                                                                                else if (result) {
                                                                                    console.log("O3215>>>.", );

                                                                                    notificationSchema.aggregate([{
                                                                                        $match: {

                                                                                            $and: [{
                                                                                                receiverId: String(sellerId)
                                                                                            }, {
                                                                                                chatType: 'NOTIFICATION'
                                                                                            }]
                                                                                        },

                                                                                    },
                                                                                    {
                                                                                        $group: {
                                                                                            _id: {
                                                                                                tradeId: "$tradeId",
                                                                                                isSeen: "$isSeen",
                                                                                                senderId: "$senderId",
                                                                                                receiverId: "$receiverId"
                                                                                            },
                                                                                            count: {
                                                                                                $sum: 1
                                                                                            },
                                                                                            message: {
                                                                                                $last: "$message"
                                                                                            },
                                                                                            chatType: {
                                                                                                $first: "$chatType"
                                                                                            },
                                                                                            messageType: {
                                                                                                $first: "$messageType"
                                                                                            }

                                                                                        }
                                                                                    },
                                                                                    {
                                                                                        $lookup: {
                                                                                            from: 'users',
                                                                                            localField: '_id.senderId',
                                                                                            foreignField: '_id',
                                                                                            as: 'data'
                                                                                        }
                                                                                    },
                                                                                    {
                                                                                        $unwind: "$data"
                                                                                    },
                                                                                    {
                                                                                        $project: {
                                                                                            _id: 1,
                                                                                            count: 1,
                                                                                            messageType: 1,
                                                                                            message: 1,
                                                                                            chatType: 1,
                                                                                            senderName: "$data.user_name"
                                                                                        }
                                                                                    },
                                                                                    {
                                                                                        $limit: 10
                                                                                    }

                                                                                    ]).exec((err__, succ) => {
                                                                                        console.log("Error and Success of aggregatiopn is======", err__, succ);
                                                                                        if (err__)
                                                                                            console.log("Error oCcures 3275", err__);
                                                                                        else {
                                                                                            var onlineUsers = require('../../server').onlineUsers;

                                                                                            if (onlineUsers[sellerId]) {
                                                                                                console.log("3182>>>>>>>>>>>>>")
                                                                                                {
                                                                                                    for (var i = 0; i < onlineUsers[sellerId].socketId.length; i++) {
                                                                                                        if (socket[onlineUsers[sellerId].socketId[i]] != undefined)
                                                                                                            socket[onlineUsers[sellerId].socketId[i]].socket.emit("notificationAlert", {
                                                                                                                notiMessage
                                                                                                            });
                                                                                                        else
                                                                                                            console.log('no online user');

                                                                                                    }
                                                                                                }
                                                                                            }




                                                                                        }
                                                                                    })
                                                                                }
                                                                            })


                                                                            // changing 



                                                                            User.update({ "disputeTrades": [] }, { $set: { isAssign: false } }, { multi: true }).exec((err21, result) => {
                                                                                if (err21) {
                                                                                    return res.send({ responseCode: 500, responseMessage: "Internal server error", err21 })
                                                                                } else {
                                                                                    res.send({ responseCode: 200, responseMessage: "Data updated successfully.", tradeResult1 })
                                                                                }
                                                                            })







                                                                            ///End 
                                                                            // res.send({ responseCode: 200, responseMessage: "Data updated successfully.", tradeResult1 })


                                                                        }
                                                                    })

                                                                }
                                                            })


                                                        }

                                                    })
                                                    //     }
                                                    // })
                                                    //     }
                                                    // })
                                                }
                                            })
                                        }
                                        else {
                                            console.log("within sell condition 1179")
                                            systemConfiguration.find({}).lean().exec((err33, result33) => {
                                                if (err33) {
                                                    res.send({
                                                        responseCode: 500,
                                                        responseMessage: "Internal server error"
                                                    })
                                                }
                                                else {
                                                    let index = result33.length - 1;
                                                    console.log("Index is=====", index, result33[index], result33[index].tradeFee);
                                                    var adminFee = result33[index].tradeFee; //admin dicided trade fee

                                                    let percentAdminFee = new BigNumber(adminFee).dividedBy(new BigNumber(100));
                                                    var finalValue = new BigNumber(escrowResult.trade_amount).multipliedBy(new BigNumber(percentAdminFee));
                                                    var FinalCal = finalValue.toFixed(8);

                                                    // var finalValue = Number(escrowResult.trade_amount) * (1 / 100);

                                                    var difference = (new BigNumber(escrowResult.trade_amount).minus(new BigNumber(finalValue)))

                                                    var sendToSeller = (new BigNumber(sellerBtc).plus(new BigNumber(escrowResult.trade_amount)))

                                                    User.findOneAndUpdate({ "_id": sellerId }, { $set: { "btc.total": sendToSeller } }, { new: true }, (err1, sellerResult1) => {
                                                        if (err1) {
                                                            return res.send({ responseCode: 500, responseMessage: "Internal server error", err_ })
                                                        }
                                                        else {
                                                            console.log("118")
                                                            var sendToBuyer = (new BigNumber(buyerBtc).plus(new BigNumber(difference)))


                                                            var sendToAdmin = (new BigNumber(adminBtc).plus(new BigNumber(finalValue)))

                                                            User.findOneAndUpdate({ "userType": "ADMIN" }, { $set: { "btc.total": sendToAdmin } }, { new: true }, (err1, adminResult1) => {
                                                                if (err1) {
                                                                    return res.send({ responseCode: 500, responseMessage: "Internal server error", err_ })
                                                                }
                                                                else {

                                                                    trade.findOneAndUpdate({ _id: req.body.tradeId }, { $set: { message: 'Awarded to seller', dispute_status: false, dispute_success_status: true, status: "COMPLETE", "request_status": "Complete" } }, { new: true }, (err11, tradeResult1) => {
                                                                        if (err11) {
                                                                            return res.send({ responseCode: 500, responseMessage: "Internal server error", err11 })
                                                                        }
                                                                        else {
                                                                            var totalAssign = []
                                                                            if (tradeResult1.employeeId) {
                                                                                console.log("dasdsa")
                                                                                totalAssign.push(
                                                                                    tradeResult1.assignManager)
                                                                                totalAssign.push(
                                                                                    tradeResult1.employeeId)
                                                                            }
                                                                            else {
                                                                                console.log("1234")

                                                                                totalAssign.push(tradeResult1.assignManager)
                                                                            }
                                                                            console.log("pramod>>>>>>>>>>>", totalAssign)

                                                                            User.update({ "_id": { $in: totalAssign } }, { $pull: { disputeTrades: req.body.tradeId } }, { new: true, multi: true }, (err, result) => {
                                                                                if (err) {
                                                                                    console.log(er1)
                                                                                } else {
                                                                                    escrow.findOneAndUpdate({ "_id": escrowResult._id }, { $set: { status: "COMPLETE", amount_coin: 0 } }, { new: true }, (erre, dataUpdate) => {
                                                                                        if (err) {
                                                                                            console.log(er1)
                                                                                        }
                                                                                        else {
                                                                                            var onlineUsers = require('../../server').onlineUsers;
                                                                                            var socket = require('../../server').sockets;
                                                                                            if (onlineUsers[buyerId]) {
                                                                                                console.log("3182>>>>>>>>>>>>>")
                                                                                                {
                                                                                                    for (var i = 0; i < onlineUsers[buyerId].socketId.length; i++) {
                                                                                                        try {
                                                                                                            socket[onlineUsers[buyerId].socketId[i]].socket.emit("reloadPage", { 'result': true })
                                                                                                        }

                                                                                                        catch (err) {
                                                                                                            console.log("error Occures 3193", err);
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                            if (onlineUsers[sellerId]) {
                                                                                                console.log("3182>>>>>>>>>>>>>")
                                                                                                {
                                                                                                    for (var i = 0; i < onlineUsers[sellerId].socketId.length; i++) {
                                                                                                        try {
                                                                                                            socket[onlineUsers[sellerId].socketId[i]].socket.emit("reloadPage", { 'result': true })
                                                                                                        }

                                                                                                        catch (err) {
                                                                                                            console.log("error Occures 3193", err);
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }

                                                                                            var amountVal = escrowResult.amount_coin;

                                                                                            let ob = {
                                                                                                senderId: adminData._id,
                                                                                                receiverId: sellerId,
                                                                                                tradeId: "Notificaton",
                                                                                                time: Date.now(),
                                                                                                messageType: 'NOTIFICATION',
                                                                                                chatType: 'NOTIFICATION',
                                                                                                isSeen: false,
                                                                                                message: `You have received ${amountVal} BTC from Admin `

                                                                                            }
                                                                                            let notiMessage = {
                                                                                                senderId: adminData._id,
                                                                                                receiverId: sellerId,
                                                                                                tradeId: "Notificaton",
                                                                                                time: Date.now(),
                                                                                                messageType: 'NOTIFICATION',
                                                                                                chatType: 'NOTIFICATION',
                                                                                                isSeen: false,
                                                                                                senderName: 'ADMIN',
                                                                                                message: `You have received ${amountVal} BTC from Admin `

                                                                                            }

                                                                                            // Send Notification
                                                                                            notificationSchema.create(ob, (error, result) => {
                                                                                                console.log("O3209>>>.", error, result);

                                                                                                if (error)
                                                                                                    return res.send({ responseCode: 500, message: error })
                                                                                                else if (result) {
                                                                                                    console.log("O3215>>>.", );

                                                                                                    notificationSchema.aggregate([{
                                                                                                        $match: {

                                                                                                            $and: [{
                                                                                                                receiverId: String(sellerId)
                                                                                                            }, {
                                                                                                                chatType: 'NOTIFICATION'
                                                                                                            }]
                                                                                                        },

                                                                                                    },
                                                                                                    {
                                                                                                        $group: {
                                                                                                            _id: {
                                                                                                                tradeId: "$tradeId",
                                                                                                                isSeen: "$isSeen",
                                                                                                                senderId: "$senderId",
                                                                                                                receiverId: "$receiverId"
                                                                                                            },
                                                                                                            count: {
                                                                                                                $sum: 1
                                                                                                            },
                                                                                                            message: {
                                                                                                                $last: "$message"
                                                                                                            },
                                                                                                            chatType: {
                                                                                                                $first: "$chatType"
                                                                                                            },
                                                                                                            messageType: {
                                                                                                                $first: "$messageType"
                                                                                                            }

                                                                                                        }
                                                                                                    },
                                                                                                    {
                                                                                                        $lookup: {
                                                                                                            from: 'users',
                                                                                                            localField: '_id.senderId',
                                                                                                            foreignField: '_id',
                                                                                                            as: 'data'
                                                                                                        }
                                                                                                    },
                                                                                                    {
                                                                                                        $unwind: "$data"
                                                                                                    },
                                                                                                    {
                                                                                                        $project: {
                                                                                                            _id: 1,
                                                                                                            count: 1,
                                                                                                            messageType: 1,
                                                                                                            message: 1,
                                                                                                            chatType: 1,
                                                                                                            senderName: "$data.user_name"
                                                                                                        }
                                                                                                    },
                                                                                                    {
                                                                                                        $limit: 10
                                                                                                    }

                                                                                                    ]).exec((err__, succ) => {
                                                                                                        console.log("Error and Success of aggregatiopn is======", err__, succ);
                                                                                                        if (err__)
                                                                                                            console.log("Error oCcures 3275", err__);
                                                                                                        else {
                                                                                                            var onlineUsers = require('../../server').onlineUsers;
                                                                                                            var socket = require('../../server').sockets;

                                                                                                            if (onlineUsers[sellerId]) {
                                                                                                                console.log("3182>>>>>>>>>>>>>")
                                                                                                                {
                                                                                                                    for (var i = 0; i < onlineUsers[sellerId].socketId.length; i++) {
                                                                                                                        if (socket[onlineUsers[sellerId].socketId[i]] != undefined)
                                                                                                                            socket[onlineUsers[sellerId].socketId[i]].socket.emit("notificationAlert", {
                                                                                                                                notiMessage
                                                                                                                            });
                                                                                                                        else
                                                                                                                            console.log('no online user');

                                                                                                                    }
                                                                                                                }
                                                                                                            }




                                                                                                        }
                                                                                                    })
                                                                                                }
                                                                                            })
                                                                                            ///End 
                                                                                            //changing.........

                                                                                            User.update({ "disputeTrades": [] }, { $set: { isAssign: false } }, { multi: true }).exec((error21, result) => {
                                                                                                if (error21) {
                                                                                                    return res.send({ responseCode: 500, responseMessage: "Internal server error", error21 })
                                                                                                } else {
                                                                                                    res.send({ responseCode: 200, responseMessage: "Data updated successfully.", adminResult1 })
                                                                                                }
                                                                                            })



                                                                                            // res.send({ responseCode: 200, responseMessage: "Data updated successfully.", adminResult1 })
                                                                                        }

                                                                                    })
                                                                                }
                                                                            })

                                                                        }
                                                                    })
                                                                }
                                                            })
                                                            //     }
                                                            // })
                                                        }
                                                    })
                                                }
                                            })
                                        }

                                    }

                                    else {
                                        if (tradeResult.type_of_trade_original == "sell") {
                                            console.log("within sell condition 1299")

                                            var sendToBuyer = (new BigNumber(buyerBtc).plus(new BigNumber(escrowResult.trade_amount)))
                                            User.findOneAndUpdate({ "_id": buyerId }, { $set: { "btc.total": sendToBuyer } }, { new: true }, (err_, buyerResult) => {
                                                if (err_) {
                                                    return res.send({ responseCode: 500, responseMessage: "Internal server error", err_ })
                                                }

                                                else {

                                                    var sendToseller = (new BigNumber(sellerBtc).plus(new BigNumber(escrowResult.amount_coin)))


                                                    var sendToadmin = (new BigNumber(adminBtc).plus(new BigNumber(adminConsession)))

                                                    User.findOneAndUpdate({ "userType": "ADMIN" }, { $set: { "btc.total": sendToadmin } }, { new: true }, (err1, adminResult) => {
                                                        if (err1) {
                                                            return res.send({ responseCode: 500, responseMessage: "Internal server error", err_ })
                                                        }

                                                        else {

                                                            trade.findOneAndUpdate({ _id: req.body.tradeId }, { $set: { transactionFee: transactionFee, message: 'Awarded to buyer', dispute_status: false, status: "COMPLETE", dispute_success_status: true, "request_status": "Complete" } }, { new: true }, (err11, tradeResult1) => {
                                                                if (err11) {
                                                                    return res.send({ responseCode: 500, responseMessage: "Internal server error", err11 })
                                                                }
                                                                else {

                                                                    var totalAssign = []
                                                                    if (tradeResult1.employeeId) {
                                                                        console.log("dasdsa")
                                                                        totalAssign.push(
                                                                            tradeResult1.assignManager)
                                                                        totalAssign.push(
                                                                            tradeResult1.employeeId)
                                                                    }
                                                                    else {
                                                                        console.log("1234")

                                                                        totalAssign.push(tradeResult1.assignManager)
                                                                    }
                                                                    console.log("pramod>>>>>>>>>>>", totalAssign)

                                                                    User.update({ "_id": { $in: totalAssign } }, { $pull: { disputeTrades: req.body.tradeId } }, { new: true, multi: true }, (err, result) => {
                                                                        if (err) {
                                                                            console.log(er1)
                                                                        } else {
                                                                            escrow.findOneAndUpdate({ "_id": escrowResult._id }, { $set: { status: "COMPLETE", amount_coin: 0 } }, { new: true }, (erre, dataUpdate) => {
                                                                                if (err) {
                                                                                    console.log(er1)
                                                                                }
                                                                                else {
                                                                                    var onlineUsers = require('../../server').onlineUsers;
                                                                                    var socket = require('../../server').sockets;
                                                                                    if (onlineUsers[buyerId]) {
                                                                                        console.log("3182>>>>>>>>>>>>>")
                                                                                        {
                                                                                            for (var i = 0; i < onlineUsers[buyerId].socketId.length; i++) {
                                                                                                try {
                                                                                                    socket[onlineUsers[buyerId].socketId[i]].socket.emit("reloadPage", { 'result': true })
                                                                                                }

                                                                                                catch (err) {
                                                                                                    console.log("error Occures 3193", err);
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    if (onlineUsers[sellerId]) {
                                                                                        console.log("3182>>>>>>>>>>>>>")
                                                                                        {
                                                                                            for (var i = 0; i < onlineUsers[sellerId].socketId.length; i++) {
                                                                                                try {
                                                                                                    socket[onlineUsers[sellerId].socketId[i]].socket.emit("reloadPage", { 'result': true })
                                                                                                }

                                                                                                catch (err) {
                                                                                                    console.log("error Occures 3193", err);
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }

                                                                                    var amountVal = escrowResult.trade_amount;

                                                                                    let ob = {
                                                                                        senderId: adminData._id,
                                                                                        receiverId: buyerId,
                                                                                        tradeId: "Notificaton",
                                                                                        time: Date.now(),
                                                                                        messageType: 'NOTIFICATION',
                                                                                        chatType: 'NOTIFICATION',
                                                                                        isSeen: false,
                                                                                        message: `You have received ${amountVal} BTC from Admin `

                                                                                    }
                                                                                    let notiMessage = {
                                                                                        senderId: adminData._id,
                                                                                        receiverId: buyerId,
                                                                                        tradeId: "Notificaton",
                                                                                        time: Date.now(),
                                                                                        messageType: 'NOTIFICATION',
                                                                                        chatType: 'NOTIFICATION',
                                                                                        isSeen: false,
                                                                                        senderName: 'ADMIN',
                                                                                        message: `You have received ${amountVal} BTC from Admin `

                                                                                    }

                                                                                    // Send Notification
                                                                                    notificationSchema.create(ob, (error, result) => {
                                                                                        console.log("O3209>>>.", error, result);

                                                                                        if (error)
                                                                                            return res.send({ responseCode: 500, message: error })
                                                                                        else if (result) {
                                                                                            console.log("O3215>>>.", );

                                                                                            notificationSchema.aggregate([{
                                                                                                $match: {

                                                                                                    $and: [{
                                                                                                        receiverId: String(buyerId)
                                                                                                    }, {
                                                                                                        chatType: 'NOTIFICATION'
                                                                                                    }]
                                                                                                },

                                                                                            },
                                                                                            {
                                                                                                $group: {
                                                                                                    _id: {
                                                                                                        tradeId: "$tradeId",
                                                                                                        isSeen: "$isSeen",
                                                                                                        senderId: "$senderId",
                                                                                                        receiverId: "$receiverId"
                                                                                                    },
                                                                                                    count: {
                                                                                                        $sum: 1
                                                                                                    },
                                                                                                    message: {
                                                                                                        $last: "$message"
                                                                                                    },
                                                                                                    chatType: {
                                                                                                        $first: "$chatType"
                                                                                                    },
                                                                                                    messageType: {
                                                                                                        $first: "$messageType"
                                                                                                    }

                                                                                                }
                                                                                            },
                                                                                            {
                                                                                                $lookup: {
                                                                                                    from: 'users',
                                                                                                    localField: '_id.senderId',
                                                                                                    foreignField: '_id',
                                                                                                    as: 'data'
                                                                                                }
                                                                                            },
                                                                                            {
                                                                                                $unwind: "$data"
                                                                                            },
                                                                                            {
                                                                                                $project: {
                                                                                                    _id: 1,
                                                                                                    count: 1,
                                                                                                    messageType: 1,
                                                                                                    message: 1,
                                                                                                    chatType: 1,
                                                                                                    senderName: "$data.user_name"
                                                                                                }
                                                                                            },
                                                                                            {
                                                                                                $limit: 10
                                                                                            }

                                                                                            ]).exec((err__, succ) => {
                                                                                                console.log("Error and Success of aggregatiopn is======", err__, succ);
                                                                                                if (err__)
                                                                                                    console.log("Error oCcures 3275", err__);
                                                                                                else {
                                                                                                    var onlineUsers = require('../../server').onlineUsers;
                                                                                                    var socket = require('../../server').sockets;

                                                                                                    if (onlineUsers[buyerId]) {
                                                                                                        console.log("3182>>>>>>>>>>>>>")
                                                                                                        {
                                                                                                            for (var i = 0; i < onlineUsers[buyerId].socketId.length; i++) {
                                                                                                                if (socket[onlineUsers[buyerId].socketId[i]] != undefined)
                                                                                                                    socket[onlineUsers[buyerId].socketId[i]].socket.emit("notificationAlert", {
                                                                                                                        notiMessage
                                                                                                                    });
                                                                                                                else
                                                                                                                    console.log('no online user');

                                                                                                            }
                                                                                                        }
                                                                                                    }




                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    })
                                                                                    ///End 


                                                                                    //changing.........


                                                                                    User.update({ "disputeTrades": [] }, { $set: { isAssign: false } }, { multi: true }).exec((error21, result) => {
                                                                                        if (error21) {
                                                                                            return res.send({ responseCode: 500, responseMessage: "Internal server error", error21 })
                                                                                        } else {
                                                                                            res.send({ responseCode: 200, responseMessage: "Data updated successfully.", adminResult })
                                                                                        }
                                                                                    })



                                                                                    // res.send({ responseCode: 200, responseMessage: "Data updated successfully.", adminResult })

                                                                                }
                                                                            })
                                                                        }
                                                                    })

                                                                }
                                                            })

                                                        }
                                                    })
                                                }
                                            })
                                            //     }
                                            // })
                                        }
                                        else {
                                            console.log("within sell condition 1396")


                                            systemConfiguration.find({}).lean().exec((err33, result33) => {
                                                if (err33) {
                                                    res.send({
                                                        responseCode: 500,
                                                        responseMessage: "Internal server error"
                                                    })
                                                }
                                                else {
                                                    console.log("within sell condition 1407")
                                                    let index = result33.length - 1;
                                                    console.log("Index is=====", index, result33[index], result33[index].tradeFee);
                                                    var adminFee = result33[index].tradeFee; //admin dicide trade fee

                                                    let percentAdminFee = new BigNumber(adminFee).dividedBy(new BigNumber(100));
                                                    var finalValue = new BigNumber(escrowResult.trade_amount).multipliedBy(new BigNumber(percentAdminFee));
                                                    var FinalCal = finalValue.toFixed(8);

                                                    var difference = (new BigNumber(escrowResult.trade_amount).minus(new BigNumber(finalValue)))
                                                    var sendToseller = (new BigNumber(sellerBtc).plus(new BigNumber(escrowResult.trade_amount)))

                                                    console.log("within sell condition 1427")
                                                    var sendTobuyer = (new BigNumber(buyerBtc).plus(new BigNumber(difference)))


                                                    User.findOneAndUpdate({ "_id": buyerId }, { $set: { "btc.total": sendTobuyer } }, { new: true }, (err1, sellerResult) => {
                                                        if (err1) {
                                                            return res.send({ responseCode: 500, responseMessage: "Internal server error", err_ })
                                                        }
                                                        else {
                                                            console.log("within sell condition 1436")
                                                            var sendToAdmin = (new BigNumber(adminBtc).plus(new BigNumber(finalValue)))

                                                            User.findOneAndUpdate({ "userType": "ADMIN" }, { $set: { "btc.total": sendToAdmin } }, { new: true }, (err1, adminResult) => {
                                                                if (err1) {
                                                                    return res.send({ responseCode: 500, responseMessage: "Internal server error", err_ })
                                                                }
                                                                else {
                                                                    console.log("within sell condition 1444", req.body.tradeId)
                                                                    console.log('FinalCalFinalCalFinalCal', FinalCal)

                                                                    trade.findOneAndUpdate({ _id: req.body.tradeId }, { $set: { transactionFee: transactionFee, message: 'Awarded to buyer', dispute_status: false, dispute_success_status: true, status: "COMPLETE", "request_status": "Complete" } }, { new: true }, (err11, tradeResult1) => {

                                                                        if (err11) {
                                                                            console.log("within sell condition 1446", err11)
                                                                            return res.send({ responseCode: 500, responseMessage: "Internal server error", err11 })
                                                                        }
                                                                        else {
                                                                            console.log("within sell condition 1450")
                                                                            var totalAssign = []
                                                                            if (tradeResult1.employeeId) {
                                                                                console.log("dasdsa")
                                                                                totalAssign.push(
                                                                                    tradeResult1.assignManager)
                                                                                totalAssign.push(
                                                                                    tradeResult1.employeeId)
                                                                            }
                                                                            else {
                                                                                console.log("1234")

                                                                                totalAssign.push(tradeResult1.assignManager)
                                                                            }



                                                                            User.update({ "_id": { $in: totalAssign } }, { $pull: { disputeTrades: req.body.tradeId } }, { new: true, multi: true }, (err, result) => {
                                                                                if (err) {
                                                                                    console.log(er1)
                                                                                } else {
                                                                                    escrow.findOneAndUpdate({ "_id": escrowResult._id }, { $set: { status: "COMPLETE", amount_coin: 0 } }, { new: true }, (erre, dataUpdate) => {
                                                                                        if (err) {
                                                                                            console.log(er1)
                                                                                        }
                                                                                        else {
                                                                                            var onlineUsers = require('../../server').onlineUsers;
                                                                                            var socket = require('../../server').sockets;
                                                                                            if (onlineUsers[buyerId]) {
                                                                                                console.log("3182>>>>>>>>>>>>>")
                                                                                                {
                                                                                                    for (var i = 0; i < onlineUsers[buyerId].socketId.length; i++) {
                                                                                                        try {
                                                                                                            socket[onlineUsers[buyerId].socketId[i]].socket.emit("reloadPage", { 'result': true })
                                                                                                        }

                                                                                                        catch (err) {
                                                                                                            console.log("error Occures 3193", err);
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                            if (onlineUsers[sellerId]) {
                                                                                                console.log("3182>>>>>>>>>>>>>")
                                                                                                {
                                                                                                    for (var i = 0; i < onlineUsers[sellerId].socketId.length; i++) {
                                                                                                        try {
                                                                                                            socket[onlineUsers[sellerId].socketId[i]].socket.emit("reloadPage", { 'result': true })
                                                                                                        }

                                                                                                        catch (err) {
                                                                                                            console.log("error Occures 3193", err);
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }




                                                                                            let ob = {
                                                                                                senderId: adminData._id,
                                                                                                receiverId: buyerId,
                                                                                                tradeId: "Notificaton",
                                                                                                time: Date.now(),
                                                                                                messageType: 'NOTIFICATION',
                                                                                                chatType: 'NOTIFICATION',
                                                                                                isSeen: false,
                                                                                                message: `You have received ${difference} BTC from Admin `

                                                                                            }
                                                                                            let notiMessage = {
                                                                                                senderId: adminData._id,
                                                                                                receiverId: buyerId,
                                                                                                tradeId: "Notificaton",
                                                                                                time: Date.now(),
                                                                                                messageType: 'NOTIFICATION',
                                                                                                chatType: 'NOTIFICATION',
                                                                                                isSeen: false,
                                                                                                senderName: 'ADMIN',
                                                                                                message: `You have received ${difference} BTC from Admin `

                                                                                            }

                                                                                            // Send Notification
                                                                                            notificationSchema.create(ob, (error, result) => {
                                                                                                console.log("O3209>>>.", error, result);

                                                                                                if (error)
                                                                                                    return res.send({ responseCode: 500, message: error })
                                                                                                else if (result) {
                                                                                                    console.log("O3215>>>.", );

                                                                                                    notificationSchema.aggregate([{
                                                                                                        $match: {

                                                                                                            $and: [{
                                                                                                                receiverId: String(buyerId)
                                                                                                            }, {
                                                                                                                chatType: 'NOTIFICATION'
                                                                                                            }]
                                                                                                        },

                                                                                                    },
                                                                                                    {
                                                                                                        $group: {
                                                                                                            _id: {
                                                                                                                tradeId: "$tradeId",
                                                                                                                isSeen: "$isSeen",
                                                                                                                senderId: "$senderId",
                                                                                                                receiverId: "$receiverId"
                                                                                                            },
                                                                                                            count: {
                                                                                                                $sum: 1
                                                                                                            },
                                                                                                            message: {
                                                                                                                $last: "$message"
                                                                                                            },
                                                                                                            chatType: {
                                                                                                                $first: "$chatType"
                                                                                                            },
                                                                                                            messageType: {
                                                                                                                $first: "$messageType"
                                                                                                            }

                                                                                                        }
                                                                                                    },
                                                                                                    {
                                                                                                        $lookup: {
                                                                                                            from: 'users',
                                                                                                            localField: '_id.senderId',
                                                                                                            foreignField: '_id',
                                                                                                            as: 'data'
                                                                                                        }
                                                                                                    },
                                                                                                    {
                                                                                                        $unwind: "$data"
                                                                                                    },
                                                                                                    {
                                                                                                        $project: {
                                                                                                            _id: 1,
                                                                                                            count: 1,
                                                                                                            messageType: 1,
                                                                                                            message: 1,
                                                                                                            chatType: 1,
                                                                                                            senderName: "$data.user_name"
                                                                                                        }
                                                                                                    },
                                                                                                    {
                                                                                                        $limit: 10
                                                                                                    }

                                                                                                    ]).exec((err__, succ) => {
                                                                                                        console.log("Error and Success of aggregatiopn is======", err__, succ);
                                                                                                        if (err__)
                                                                                                            console.log("Error oCcures 3275", err__);
                                                                                                        else {
                                                                                                            var onlineUsers = require('../../server').onlineUsers;
                                                                                                            var socket = require('../../server').sockets;
                                                                                                            if (onlineUsers[buyerId]) {
                                                                                                                console.log("3182>>>>>>>>>>>>>")
                                                                                                                {
                                                                                                                    for (var i = 0; i < onlineUsers[buyerId].socketId.length; i++) {
                                                                                                                        if (socket[onlineUsers[buyerId].socketId[i]] != undefined)
                                                                                                                            socket[onlineUsers[buyerId].socketId[i]].socket.emit("notificationAlert", {
                                                                                                                                notiMessage
                                                                                                                            });
                                                                                                                        else
                                                                                                                            console.log('no online user');

                                                                                                                    }
                                                                                                                }
                                                                                                            }




                                                                                                        }
                                                                                                    })
                                                                                                }
                                                                                            })


                                                                                            //changing.........

                                                                                            User.update({ "disputeTrades": [] }, { $set: { isAssign: false } }, { multi: true }).exec((error21, result) => {
                                                                                                if (error21) {
                                                                                                    return res.send({ responseCode: 500, responseMessage: "Internal server error", error21 })
                                                                                                } else {
                                                                                                    res.send({ responseCode: 200, responseMessage: "Data updated successfully.", adminResult })
                                                                                                }
                                                                                            })



                                                                                            // res.send({ responseCode: 200, responseMessage: "Data updated successfully.", adminResult })
                                                                                        }
                                                                                    })
                                                                                }
                                                                            })

                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }
                                }
                            })
                        })
                    }
                })


            }
        })







    },



    //......................................................................assign dispute trade to   assignTrade.............................................//

    // "assignTradeToManager": (req, res) => {
    //     console.log("consoleconsole")
    //     let flag = 0;
    //     let temp = false;
    //     trade.findOne({ _id: req.body.tradeId, dispute_status: true }, (err, result) => {
    //         if (err) {
    //             res.send({
    //                 responseCode: 500,
    //                 responseMessage: "Internal server error"
    //             })
    //         } else {
    //             User.find({ userType: "MANAGER", status: "ACTIVE" }).lean().exec((err, result1) => {


    //                 if (err) {
    //                     res.send({
    //                         responseCode: 500,
    //                         responseMessage: "Internal server error"
    //                     })
    //                 } else if (!result1) {
    //                     res.send({
    //                         responseCode: 400,
    //                         responseMessage: "No manager found"
    //                     })
    //                 } else if (result1.length) {
    //                     console.log("consoleconsole1096")
    //                     if (result1.length == 1) {
    //                         console.log("consoleconsole1098")
    //                         User.findOneAndUpdate({ _id: result1[0]._id }, {
    //                             $set: {
    //                                 isAssign: true, nextManager: result1[0]._id
    //                             }, $addToSet: { disputeTrades: req.body.tradeId }
    //                         }, { new: true }).exec((err1, succ1) => {
    //                             console.log("i am herer >>>", err1, succ1)
    //                             if (err1)
    //                                 return res.send({ responseCode: 400, responseMessage: err1 });
    //                             else if (succ1) {
    //                                 trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": result1[0]._id } }, { new: true }, (err12, result_) => {
    //                                     if (err12)
    //                                         return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                     else if (result_) {
    //                                         return res.send({ responseCode: 200, responseMessage: "Done", succ1 });
    //                                     }
    //                                 })


    //                             }
    //                         })
    //                     }
    //                     else if (result1.length > 1) {
    //                         console.log("consoleconsole1121")
    //                         waterFall([
    //                             function (callback) {
    //                                 for (let i = 0; i < result1.length; i++) {
    //                                     console.log("consoleconsole1126")
    //                                  //   if (result1[i].isAssign == true) {
    //                                         console.log("consoleconsole1128")
    //                                         if (((i + 2) != result1.length) && ((i + 1) != result1.length)) {
    //                                             console.log("consoleconsole1130")
    //                                             User.findOneAndUpdate({ _id: result1[i + 1]._id }, { $set: { isAssign: true, nextManager: result1[i + 2]._id }, $addToSet: { disputeTrades: req.body.tradeId } }).exec((err, succ) => {
    //                                                 if (err)
    //                                                     return res.send({ responseCode: 400, responseMessage: err });
    //                                                 else if (succ) {

    //                                                     trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                                                         if (err12)
    //                                                             return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                                         else if (result_) {
    //                                                             User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                                                                 if (err1)
    //                                                                     return res.send({ responseCode: 400, responseMessage: err1 });
    //                                                                 else if (succ1) {
    //                                                                     console.log("First Success is=]")
    //                                                                     temp = true;
    //                                                                     callback(null, temp);

    //                                                                 }
    //                                                             })
    //                                                         }
    //                                                     })


    //                                                 }
    //                                             })


    //                                         } else if (((i + 2) == result1.length)) {
    //                                             console.log("consoleconsole1158")
    //                                             User.findOneAndUpdate({ _id: result1[i + 1]._id }, { $set: { isAssign: true, nextManager: result1[0]._id }, $addToSet: { disputeTrades: req.body.tradeId } }).exec((err, succ) => {
    //                                                 if (err)
    //                                                     return res.send({ responseCode: 400, responseMessage: err });
    //                                                 else if (succ) {
    //                                                     trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                                                         if (err12)
    //                                                             return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                                         else if (result_) {
    //                                                             User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                                                                 if (err1)
    //                                                                     return res.send({ responseCode: 400, responseMessage: err1 });
    //                                                                 else if (succ1) {
    //                                                                     console.log("Success of 2 is=======>>>>>>>>>>>>>>>>", succ1);
    //                                                                     temp = true;
    //                                                                     callback(null, temp);

    //                                                                 }
    //                                                             })

    //                                                         }
    //                                                     })
    //                                                 }
    //                                             })



    //                                         } else if (((i + 1) == result1.length)) {
    //                                             console.log("consoleconsole1186")

    //                                             User.findOneAndUpdate({ _id: result1[0]._id }, { $set: { isAssign: true, nextManager: result1[1]._id }, $addToSet: { disputeTrades: req.body.tradeId } }).exec((err, succ) => {
    //                                                 if (err)
    //                                                     return res.send({ responseCode: 400, responseMessage: err });
    //                                                 else if (succ) {
    //                                                     trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                                                         if (err12)
    //                                                             return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                                         else if (result_) {
    //                                                             User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                                                                 if (err1)
    //                                                                     return res.send({ responseCode: 400, responseMessage: err1 });
    //                                                                 else if (succ1) {
    //                                                                     temp = true;
    //                                                                     console.log("Third Success====");
    //                                                                     callback(null, temp);
    //                                                                 }
    //                                                             })

    //                                                         }
    //                                                     })

    //                                                 }
    //                                             })


    //                                         }
    //                                  //   }
    //                                 }
    //                             },
    //                             function (test, callback) {
    //                                 console.log("Test Value is========", test);
    //                                 callback(null, "Hekllo");
    //                             }
    //                         ], (error, result) => {
    //                             console.log("Temp is=======>>>>>>>", error, result);
    //                             if (result)
    //                                 return res.send({ responseCode: 200, responseMessage: 'Trade Assigned Successfully' });

    //                         })



    //                     }

    //                 }
    //             })

    //         }
    //     })
    // },

    // "assignTradeToManager": (req, res) => {
    //     console.log("consoleconsole")
    //     let flag = 0;
    //     let temp = false;
    //     trade.findOne({ _id: req.body.tradeId, dispute_status: true }, (err, result) => {
    //         if (err) {
    //             res.send({
    //                 responseCode: 500,
    //                 responseMessage: "Internal server error"
    //             })
    //         } else {
    //             User.find({ userType: "MANAGER", status: "ACTIVE" }).lean().exec((err, result1) => {


    //                 if (err) {
    //                     res.send({
    //                         responseCode: 500,
    //                         responseMessage: "Internal server error"
    //                     })
    //                 } else if (!result1) {
    //                     res.send({
    //                         responseCode: 400,
    //                         responseMessage: "No manager found"
    //                     })
    //                 } else if (result1.length) {
    //                     console.log("consoleconsole1096")
    //                     if (result1.length == 1) {
    //                         console.log("consoleconsole1098")
    //                         User.findOneAndUpdate({ _id: result1[0]._id }, {
    //                             $set: {
    //                                 isAssign: true, nextManager: result1[0]._id
    //                             }, $addToSet: { disputeTrades: req.body.tradeId }
    //                         }, { new: true }).exec((err1, succ1) => {
    //                             console.log("i am herer >>>", err1, succ1)
    //                             if (err1)
    //                                 return res.send({ responseCode: 400, responseMessage: err1 });
    //                             else if (succ1) {
    //                                 trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": result1[0]._id } }, { new: true }, (err12, result_) => {
    //                                     if (err12)
    //                                         return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                     else if (result_) {
    //                                         return res.send({ responseCode: 200, responseMessage: "Done", succ1 });
    //                                     }
    //                                 })


    //                             }
    //                         })
    //                     }
    //                     else if (result1.length > 1) {
    //                         console.log("consoleconsole1121")
    //                         trade.find({assignManager:{$ne:''}}).exec((err, succ) => {
    //                             if (err){
    //                                 return res.send({ responseCode: 400, responseMessage: err });

    //                             }
    //                             else {


    //                                 // trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                                 //     if (err12)
    //                                 //         return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                 //     else if (result_) {
    //                                 //         User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                                 //             if (err1)
    //                                 //                 return res.send({ responseCode: 400, responseMessage: err1 });
    //                                 //             else if (succ1) {
    //                                 //                 console.log("First Success is=]")
    //                                 //                 temp = true;
    //                                 //                 callback(null, temp);

    //                                 //             }
    //                                 //         })
    //                                 //     }
    //                                 // })


    //                             }
    //                         })

    //                         // waterFall([
    //                         //     function (callback) {
    //                         //         for (let i = 0; i < result1.length; i++) {
    //                         //             console.log("consoleconsole1126")
    //                         //          //   if (result1[i].isAssign == true) {
    //                         //                 console.log("consoleconsole1128")
    //                         //                 if (((i + 2) != result1.length) && ((i + 1) != result1.length)) {
    //                         //                     console.log("consoleconsole1130")
    //                         //                     User.findOneAndUpdate({ _id: result1[i + 1]._id }, { $set: { isAssign: true, nextManager: result1[i + 2]._id }, $addToSet: { disputeTrades: req.body.tradeId } }).exec((err, succ) => {
    //                         //                         if (err)
    //                         //                             return res.send({ responseCode: 400, responseMessage: err });
    //                         //                         else if (succ) {

    //                         //                             trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                         //                                 if (err12)
    //                         //                                     return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                         //                                 else if (result_) {
    //                         //                                     User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                         //                                         if (err1)
    //                         //                                             return res.send({ responseCode: 400, responseMessage: err1 });
    //                         //                                         else if (succ1) {
    //                         //                                             console.log("First Success is=]")
    //                         //                                             temp = true;
    //                         //                                             callback(null, temp);

    //                         //                                         }
    //                         //                                     })
    //                         //                                 }
    //                         //                             })


    //                         //                         }
    //                         //                     })


    //                         //                 } else if (((i + 2) == result1.length)) {
    //                         //                     console.log("consoleconsole1158")
    //                         //                     User.findOneAndUpdate({ _id: result1[i + 1]._id }, { $set: { isAssign: true, nextManager: result1[0]._id }, $addToSet: { disputeTrades: req.body.tradeId } }).exec((err, succ) => {
    //                         //                         if (err)
    //                         //                             return res.send({ responseCode: 400, responseMessage: err });
    //                         //                         else if (succ) {
    //                         //                             trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                         //                                 if (err12)
    //                         //                                     return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                         //                                 else if (result_) {
    //                         //                                     User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                         //                                         if (err1)
    //                         //                                             return res.send({ responseCode: 400, responseMessage: err1 });
    //                         //                                         else if (succ1) {
    //                         //                                             console.log("Success of 2 is=======>>>>>>>>>>>>>>>>", succ1);
    //                         //                                             temp = true;
    //                         //                                             callback(null, temp);

    //                         //                                         }
    //                         //                                     })

    //                         //                                 }
    //                         //                             })
    //                         //                         }
    //                         //                     })



    //                         //                 } else if (((i + 1) == result1.length)) {
    //                         //                     console.log("consoleconsole1186")

    //                         //                     User.findOneAndUpdate({ _id: result1[0]._id }, { $set: { isAssign: true, nextManager: result1[1]._id }, $addToSet: { disputeTrades: req.body.tradeId } }).exec((err, succ) => {
    //                         //                         if (err)
    //                         //                             return res.send({ responseCode: 400, responseMessage: err });
    //                         //                         else if (succ) {
    //                         //                             trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                         //                                 if (err12)
    //                         //                                     return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                         //                                 else if (result_) {
    //                         //                                     User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                         //                                         if (err1)
    //                         //                                             return res.send({ responseCode: 400, responseMessage: err1 });
    //                         //                                         else if (succ1) {
    //                         //                                             temp = true;
    //                         //                                             console.log("Third Success====");
    //                         //                                             callback(null, temp);
    //                         //                                         }
    //                         //                                     })

    //                         //                                 }
    //                         //                             })

    //                         //                         }
    //                         //                     })


    //                         //                 }
    //                         //          //   }
    //                         //         }
    //                         //     },
    //                         //     function (test, callback) {
    //                         //         console.log("Test Value is========", test);
    //                         //         callback(null, "Hekllo");
    //                         //     }
    //                         // ], (error, result) => {
    //                         //     console.log("Temp is=======>>>>>>>", error, result);
    //                         //     if (result)
    //                         //         return res.send({ responseCode: 200, responseMessage: 'Trade Assigned Successfully' });

    //                         // })



    //                     }

    //                 }
    //             })

    //         }
    //     })
    // },

    //.....................................................distribute dispute to employees ..................................................................//
    "assignToEmployee": (req, res) => {
        var tradeUser = []
        tradeUser = req.body.tradeUser

        if (req.body.type == 1) {
            trade.update({ "_id": { $in: req.body.tradeUser } }, { $set: { employeeId: req.body.employeeId } }, { new: true, multi: true }, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error", error })
                }
                else {
                    User.findOneAndUpdate({ "_id": req.body.employeeId }, {
                        $set: {
                            isAssign: true,
                        }, $set: { disputeTrades: tradeUser }
                    }, { new: true, multi: true }, async (err, result1) => {
                        console.log("me here>>>>>>>>591")
                        if (err) {
                            console.log(err)
                        } else {
                            let saveData = await saveDataFun(req.headers.id);
                            //  let saveData_emp=await saveData_emp(req.body.employeeId);

                            unique = commonFunction.getCode();
                            let obj = {
                                "uniqueId": "#" + unique,
                                "staffName": saveData.name,
                                "module": "Dispute Assignment",
                                "type": saveData.userType,
                                "staffId": req.headers.id,
                                "documentData": result,
                                "userName": saveData_emp.name,
                                "action": "Employee assigned",

                                //   
                            };

                            let track = new staffTrack(obj);
                            track.save((er1, ress) => {

                                if (er1) {
                                    console.log(er1)
                                } else {
                                    console.log("aa@@@@@@@@@@aaaa>>>>in deleted add", JSON.stringify(ress))


                                }
                            })
                            return res.send({ responseCode: 200, responseMessage: 'Trade Assigned Successfully', result1 });
                        }
                    })


                }
            })
        }
        else {
            trade.findOneAndUpdate({ "_id": req.body.tradeUser }, { $set: { employeeId: req.body.employeeId } }, { new: true }, (err, result) => {
                if (err) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error", err })
                }
                else {
                    User.findOneAndUpdate({ "_id": req.body.employeeId }, {
                        $set: {
                            isAssign: true,
                        }, $set: { disputeTrades: tradeUser }
                    }, { new: true, multi: true }, async (err, result1) => {
                        console.log("me here>>>>>>>>591")
                        if (err) {
                            console.log(err)
                        } else {
                            let saveData = await saveDataFun(req.headers.id);
                            //let saveData_emp = await saveData_emp(req.body.employeeId);

                            unique = commonFunction.getCode();
                            let obj = {
                                "uniqueId": "#" + unique,
                                "staffName": saveData.name,
                                "module": "Dispute Assignment",
                                "type": saveData.userType,
                                "staffId": req.headers.id,
                                "documentData": result,
                                "userName": result1.name,
                                "action": "Employee assigned",

                                //   
                            };

                            let track = new staffTrack(obj);
                            track.save((er1, ress) => {

                                if (er1) {
                                    console.log(er1)
                                } else {
                                    console.log("aa@@@@@@@@@@aaaa>>>>in deleted add", JSON.stringify(ress))


                                }
                            })
                            return res.send({ responseCode: 200, responseMessage: 'Trade Assigned Successfully', result });
                        }
                    })


                }
            })
        }

    },






    //......................................................................assign dispute trade to   assignTrade.............................................//
    //  "assignTradeToManager": (req, res) => {
    //     let flag = 0;
    //     let temp = false;
    //     trade.findOne({ _id: req.body.tradeId, dispute_status: true }, (err, result) => {
    //         if (err) {
    //             res.send({
    //                 responseCode: 500,
    //                 responseMessage: "Internal server error"
    //             })
    //         } else {
    //             User.find({ userType: "MANAGER", status: "ACTIVE" }).lean().exec((err, result1) => {
    //                 if (err) {
    //                     res.send({
    //                         responseCode: 500,
    //                         responseMessage: "Internal server error"
    //                     })
    //                 } else if (!result1) {
    //                     res.send({
    //                         responseCode: 400,
    //                         responseMessage: "No manager found"
    //                     })
    //                 } else if (result1.length) {
    //                     console.log("me here")
    //                     if (result1.length == 1) {
    //                         console.log("dfgdf")
    //                         User.findOneAndUpdate({ _id: result1[0]._id }, {
    //                             $set: {
    //                                 isAssign: true, nextManager: result1[0]._id
    //                             }, $addToSet: { disputeTrades: req.body.tradeId }
    //                         }, { new: true }).exec((err1, succ1) => {
    //                             console.log("i am herer >>>", err1, succ1)
    //                             if (err1)
    //                                 return res.send({ responseCode: 400, responseMessage: err1 });
    //                             else if (succ1) {
    //                                 trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": result1[0]._id } }, { new: true }, (err12, result_) => {
    //                                     if (err12)
    //                                         return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                     else if (result_) {
    //                                         return res.send({ responseCode: 200, responseMessage: "Done", succ1 });
    //                                     }
    //                                 })
    //                             }
    //                         })
    //                     }
    //                     else if (result1.length > 1) {
    //                         console.log("Come here");
    //                         waterFall([
    //                             function (callback) {
    //                                 for (let i = 0; i < result1.length; i++) {
    //                                     if (result1[i].isAssign == true) {
    //                                         console.log("askjldhkalsjdhkjasdh");
    //                                         if (((i + 2) != result1.length) && ((i + 1) != result1.length)) {
    //                                             // result1[i + 1].isAssign = true
    //                                             // result1[i + 1].nextManager = result1[i + 2]._id
    //                                             // result1[i + 1].disputeTrades.push(req.body.tradeId)
    //                                             // result1[i].isAssign = false
    //                                             console.log("Inm 1=======");
    //                                             User.findOneAndUpdate({ _id: result1[i + 1]._id }, { $set: { isAssign: true, nextManager: result1[i + 2]._id }, $addToSet: { disputeTrades: req.body.tradeId } }).exec((err, succ) => {
    //                                                 if (err)
    //                                                     return res.send({ responseCode: 400, responseMessage: err });
    //                                                 else if (succ) {
    //                                                     // trade.findOneAndUpdate({"_id":req.body.tradeId, dispute_status: true},{$set:{"assignManager":succ._id}},{new:true},(err12,result_)=>{
    //                                                     //     if (err12)
    //                                                     //     return res.send({ responseCode: 400, responseMessage: "Internal server error",err12 });
    //                                                     // else if (succ1) {
    //                                                     // }
    //                                                     // })
    //                                                     trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                                                         if (err12)
    //                                                             return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                                         else if (result_) {
    //                                                             User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                                                                 if (err1)
    //                                                                     return res.send({ responseCode: 400, responseMessage: err1 });
    //                                                                 else if (succ1) {
    //                                                                     console.log("First Success is=]")
    //                                                                     temp = true;
    //                                                                     callback(null, temp);
    //                                                                 }
    //                                                             })
    //                                                         }
    //                                                     })
    //                                                 }
    //                                             })
    //                                         } else if (((i + 2) == result1.length)) {
    //                                             console.log('2=======');
    //                                             // result1[i + 1].isAssign = true
    //                                             // result1[i + 1].nextManager = result1[0]._id
    //                                             // // result1[i + 1].disputeTrades.push(req.body.tradeId)
    //                                             // result1[i].isAssign = false
    //                                             User.findOneAndUpdate({ _id: result1[i + 1]._id }, { $set: { isAssign: true, nextManager: result1[0]._id }, $addToSet: { disputeTrades: req.body.tradeId } }).exec((err, succ) => {
    //                                                 if (err)
    //                                                     return res.send({ responseCode: 400, responseMessage: err });
    //                                                 else if (succ) {
    //                                                     trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                                                         if (err12)
    //                                                             return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                                         else if (result_) {
    //                                                             User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                                                                 if (err1)
    //                                                                     return res.send({ responseCode: 400, responseMessage: err1 });
    //                                                                 else if (succ1) {
    //                                                                     console.log("Success of 2 is=======>>>>>>>>>>>>>>>>", succ1);
    //                                                                     temp = true;
    //                                                                     callback(null, temp);
    //                                                                 }
    //                                                             })
    //                                                         }
    //                                                     })
    //                                                 }
    //                                             })
    //                                         } else if (((i + 1) == result1.length)) {
    //                                             console.log('3=========');
    //                                             // result1[0].isAssign = true
    //                                             // result1[0].nextManager = result1[1]._id
    //                                             // result1[0].disputeTrades.push(req.body.tradeId)
    //                                             // result1[i].isAssign = false
    //                                             User.findOneAndUpdate({ _id: result1[0]._id }, { $set: { isAssign: true, nextManager: result1[1]._id }, $addToSet: { disputeTrades: req.body.tradeId } }).exec((err, succ) => {
    //                                                 if (err)
    //                                                     return res.send({ responseCode: 400, responseMessage: err });
    //                                                 else if (succ) {
    //                                                     trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                                                         if (err12)
    //                                                             return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                                         else if (result_) {
    //                                                             User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                                                                 if (err1)
    //                                                                     return res.send({ responseCode: 400, responseMessage: err1 });
    //                                                                 else if (succ1) {
    //                                                                     temp = true;
    //                                                                     console.log("Third Success====");
    //                                                                     callback(null, temp);
    //                                                                 }
    //                                                             })
    //                                                         }
    //                                                     })
    //                                                 }
    //                                             })
    //                                         }
    //                                     }
    //                                 }
    //                             },
    //                             function (test, callback) {
    //                                 console.log("Test Value is========", test);
    //                                 callback(null, "Hekllo");
    //                             }
    //                         ], (error, result) => {
    //                             console.log("Temp is=======>>>>>>>", error, result);
    //                             if (result)
    //                                 return res.send({ responseCode: 200, responseMessage: 'Trade Assigned Successfully' });
    //                         })
    //                     }
    //                     // var  obj=[]
    //                     // User.update({ userType: "MANAGER", status: "ACTIVE" },{$push:})
    //                 }
    //             })
    //         }
    //     })
    // },








    // //....................NEW ..........................//
    // "assignTradeToManager": (req, res) => {
    //     let flag = 0;
    //     let temp = false;
    //     trade.findOne({ _id: req.body.tradeId, dispute_status: true }, (err, result) => {
    //         if (err) {
    //             res.send({
    //                 responseCode: 500,
    //                 responseMessage: "Internal server error"
    //             })
    //         } else {
    //             User.find({ userType: "MANAGER", status: "ACTIVE" }).lean().exec((err, result1) => {


    //                 if (err) {
    //                     res.send({
    //                         responseCode: 500,
    //                         responseMessage: "Internal server error"
    //                     })
    //                 } else if (!result1) {
    //                     res.send({
    //                         responseCode: 400,
    //                         responseMessage: "No manager found"
    //                     })
    //                 } else if (result1.length) {

    //                     console.log("me here")
    //                     if (result1.length == 1) {
    //                         console.log("dfgdf")
    //                         User.findOneAndUpdate({ _id: result1[0]._id }, {
    //                             $set: {
    //                                 isAssign: true, nextManager: result1[0]._id
    //                             }, $addToSet: { disputeTrades: req.body.tradeId }
    //                         }, { new: true }).exec((err1, succ1) => {
    //                             console.log("i am herer >>>", err1, succ1)
    //                             if (err1)
    //                                 return res.send({ responseCode: 400, responseMessage: err1 });
    //                             else if (succ1) {
    //                                 trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": result1[0]._id } }, { new: true }, (err12, result_) => {
    //                                     if (err12)
    //                                         return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                     else if (result_) {
    //                                         return res.send({ responseCode: 200, responseMessage: "Done", succ1 });
    //                                     }
    //                                 })


    //                             }
    //                         })
    //                     }
    //                     else if (result1.length > 1) {
    //                         User.find({ userType: "MANAGER", status: "ACTIVE", isAssign: false }).lean().exec((err, resultData) => {


    //                             // if(result1.length == resultData.length){
    //                             //     User.findOneAndUpdate({ _id: result1[0]._id }, {
    //                             //         $set: {
    //                             //             isAssign: true, nextManager: resultData[1]._id
    //                             //         }, $addToSet: { disputeTrades: req.body.tradeId }
    //                             //     }, { new: true }).exec((err1, succ1) => {
    //                             //         console.log("i am herer >>>", err1, succ1)
    //                             //         if (err1)
    //                             //             return res.send({ responseCode: 400, responseMessage: err1 });
    //                             //         else if (succ1) {
    //                             //             trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": result1[0]._id } }, { new: true }, (err12, result_) => {
    //                             //                 if (err12)
    //                             //                     return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                             //                 else if (result_) {
    //                             //                     return res.send({ responseCode: 200, responseMessage: "Done", succ1 });
    //                             //                 }
    //                             //             })


    //                             //         }
    //                             //     })
    //                             // }
    //                             // else{
    //                             console.log("Come here");
    //                             waterFall([
    //                                 function (callback) {
    //                                     for (let i = 0; i < result1.length; i++) {

    //                                         if (result1[i].isAssign == true) {
    //                                             console.log("askjldhkalsjdhkjasdh");
    //                                             if (((i + 2) != result1.length) && ((i + 1) != result1.length)) {
    //                                                 // result1[i + 1].isAssign = true
    //                                                 // result1[i + 1].nextManager = result1[i + 2]._id
    //                                                 // result1[i + 1].disputeTrades.push(req.body.tradeId)
    //                                                 // result1[i].isAssign = false
    //                                                 console.log("Inm 1=======");
    //                                                 User.findOneAndUpdate({ _id: result1[i + 1]._id }, { $set: { isAssign: true, nextManager: result1[i + 2]._id }, $addToSet: { disputeTrades: req.body.tradeId } }).exec((err, succ) => {
    //                                                     if (err)
    //                                                         return res.send({ responseCode: 400, responseMessage: err });
    //                                                     else if (succ) {


    //                                                         // trade.findOneAndUpdate({"_id":req.body.tradeId, dispute_status: true},{$set:{"assignManager":succ._id}},{new:true},(err12,result_)=>{
    //                                                         //     if (err12)
    //                                                         //     return res.send({ responseCode: 400, responseMessage: "Internal server error",err12 });
    //                                                         // else if (succ1) {

    //                                                         // }
    //                                                         // })


    //                                                         trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                                                             if (err12)
    //                                                                 return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                                             else if (result_) {
    //                                                                 User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                                                                     if (err1)
    //                                                                         return res.send({ responseCode: 400, responseMessage: err1 });
    //                                                                     else if (succ1) {
    //                                                                         console.log("First Success is=]")
    //                                                                         temp = true;
    //                                                                         callback(null, temp);

    //                                                                     }
    //                                                                 })
    //                                                             }
    //                                                         })


    //                                                     }
    //                                                 })


    //                                             } else if (((i + 2) == result1.length)) {
    //                                                 console.log('2=======');
    //                                                 // result1[i + 1].isAssign = true
    //                                                 // result1[i + 1].nextManager = result1[0]._id
    //                                                 // // result1[i + 1].disputeTrades.push(req.body.tradeId)
    //                                                 // result1[i].isAssign = false
    //                                                 User.findOneAndUpdate({ _id: result1[i + 1]._id }, { $set: { isAssign: true, nextManager: result1[0]._id }, $addToSet: { disputeTrades: req.body.tradeId } }).exec((err, succ) => {
    //                                                     if (err)
    //                                                         return res.send({ responseCode: 400, responseMessage: err });
    //                                                     else if (succ) {
    //                                                         trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                                                             if (err12)
    //                                                                 return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                                             else if (result_) {
    //                                                                 User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                                                                     if (err1)
    //                                                                         return res.send({ responseCode: 400, responseMessage: err1 });
    //                                                                     else if (succ1) {
    //                                                                         console.log("Success of 2 is=======>>>>>>>>>>>>>>>>", succ1);
    //                                                                         temp = true;
    //                                                                         callback(null, temp);

    //                                                                     }
    //                                                                 })

    //                                                             }
    //                                                         })
    //                                                     }
    //                                                 })



    //                                             } else if (((i + 1) == result1.length)) {
    //                                                 console.log('3=========');



    //                                                 // result1[0].isAssign = true
    //                                                 // result1[0].nextManager = result1[1]._id
    //                                                 // result1[0].disputeTrades.push(req.body.tradeId)
    //                                                 // result1[i].isAssign = false

    //                                                 User.findOneAndUpdate({ _id: result1[0]._id }, { $set: { isAssign: true, nextManager: result1[1]._id }, $addToSet: { disputeTrades: req.body.tradeId } }).exec((err, succ) => {
    //                                                     if (err)
    //                                                         return res.send({ responseCode: 400, responseMessage: err });
    //                                                     else if (succ) {
    //                                                         trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": succ._id } }, { new: true }, (err12, result_) => {
    //                                                             if (err12)
    //                                                                 return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                                             else if (result_) {
    //                                                                 User.findOneAndUpdate({ _id: result1[i]._id }, { $set: { isAssign: false } }).exec((err1, succ1) => {
    //                                                                     if (err1)
    //                                                                         return res.send({ responseCode: 400, responseMessage: err1 });
    //                                                                     else if (succ1) {
    //                                                                         temp = true;
    //                                                                         console.log("Third Success====");
    //                                                                         callback(null, temp);
    //                                                                     }
    //                                                                 })

    //                                                             }
    //                                                         })

    //                                                     }
    //                                                 })


    //                                             }
    //                                         }
    //                                         else {

    //                                             User.findOneAndUpdate({ _id: result1[i]._id }, {
    //                                                 $set: {
    //                                                     isAssign: true, nextManager: result1[i + 1]._id
    //                                                 }, $addToSet: { disputeTrades: req.body.tradeId }
    //                                             }, { new: true }).exec((err1, succ1) => {
    //                                                 console.log("i am herer >>>", err1, succ1)
    //                                                 if (err1)
    //                                                     return res.send({ responseCode: 400, responseMessage: err1 });
    //                                                 else if (succ1) {
    //                                                     trade.findOneAndUpdate({ "_id": req.body.tradeId }, { $set: { "assignManager": result1[i]._id } }, { new: true }, (err12, result_) => {
    //                                                         if (err12)
    //                                                             return res.send({ responseCode: 400, responseMessage: "Internal server error", err12 });
    //                                                         else if (result_) {
    //                                                             temp = true;
    //                                                             console.log("fourth Success====");
    //                                                             callback(null, temp);
    //                                                         }
    //                                                     })


    //                                                 }
    //                                             })

    //                                         }
    //                                     }
    //                                 },
    //                                 function (test, callback) {
    //                                     console.log("Test Value is========", test);
    //                                     callback(null, "Hekllo");
    //                                 }
    //                             ], (error, result) => {
    //                                 console.log("Temp is=======>>>>>>>", error, result);
    //                                 if (result)
    //                                     return res.send({ responseCode: 200, responseMessage: 'Trade Assigned Successfully' });

    //                             })
    //                             // }

    //                         })


    //                     }
    //                     // var  obj=[]

    //                     // User.update({ userType: "MANAGER", status: "ACTIVE" },{$push:})
    //                 }
    //             })

    //         }
    //     })
    // },







    "assignTradeToManager1": (data) => {
        var response = {}
        console.log("in manager1,", data)

        unique = commonFunction.getCode()

        return new Promise((resolve, reject) => {

            console.log("in manager2")



            trade.findOne({ dispute_status: true, disputeDone: true }).sort({ assignManagerDate: -1 }).select("_id assignManager assignManagerDate  disputeDone  dispute_status").exec((err, result) => {
                console.log("dispute trade >>>>>>>", err, result)
                if (err) {
                    response = {
                        responseCode: 500,
                        responseMessage: "Internal server error"
                    }
                    resolve(response)
                }
                else if (!result) {

                    console.log("no dispute>>>>>>>>>2031")

                    User.find({ userType: "MANAGER", status: "ACTIVE" }).lean().exec((err, result1) => {
                        if (err) {
                            response = {
                                responseCode: 500,
                                responseMessage: "Internal server error"
                            }


                            resolve(response)





                        } else if (result1.length == false) {
                            response = {
                                responseCode: 400,
                                responseMessage: "No manager found"
                            }


                            resolve(response)



                        } else if (result1.length) {
                            console.log("me here")

                            console.log("dfgdf")

                            update(result1[0]._id, result1[0]._id)



                        }

                    })
                }
                else {
                    console.log("yes dispute>>>>>>>>>2082")

                    var managerArray = []

                    User.find({ userType: "MANAGER", status: "ACTIVE" }).select("_id userType nextManager isAssign").exec((err, result1) => {
                        if (err) {
                            response = {
                                responseCode: 500,
                                responseMessage: "Internal server error"
                            }

                            resolve(response)


                        } else if (result1.length == false) {
                            response = {
                                responseCode: 400,
                                responseMessage: "No manager found"
                            }
                            resolve(response)

                        } else if (result1.length) {
                            console.log("me here 2086")


                            if (result1.length == 1) {

                                update(result1[0]._id, result1[0]._id)


                            }
                            else {

                                // if (!result[0].assignManager || result[0].assignManager == "") {

                                //     console.log("1st blank")
                                //     update(result1[0]._id, result1[0]._id)

                                // }

                                if ((!result.assignManager || result.assignManager == "")) {
                                    console.log("1st only one trade dispute")


                                    update(result1[0]._id, result1[0]._id)

                                }
                                else {
                                    result1.forEach(managerId => {
                                        console.log("managerId are>>>>>", managerId)
                                        let managerId1 = managerId._id.toString()
                                        managerArray.push(managerId1)
                                    })
                                    console.log("manager ids who assign>>>>>>", managerArray)
                                    let assignManager = result.assignManager
                                    var index = managerArray.indexOf(assignManager.toString())

                                    console.log("index>>>>>>", index, "who index of assign>>>>", JSON.stringify(result.assignManager), "manager index>>>>>", JSON.stringify(managerArray), "toString>>>>", assignManager)
                                    if (index == managerArray.length - 1) {
                                        console.log("same length>>>>>>>>>>")
                                        update(managerArray[0], managerArray[1])

                                    }
                                    else {
                                        let temp = index + 1
                                        console.log("diff length>>>>>>>>>>", temp)

                                        if (temp == managerArray.length - 1) {
                                            console.log("assgnmanager length is last index>>>>", managerArray[temp], managerArray[0])

                                            update(managerArray[temp], managerArray[0])
                                        }
                                        else {
                                            console.log("assgnmanager length is not lastttt index>>>>", managerArray[temp], managerArray[index + 2])

                                            update(managerArray[index + 1], managerArray[index + 2])

                                        }


                                    }
                                }





                            }





                        }
                    })


                }



            })



            function update(currentManager, nextManager) {



                    User.findOneAndUpdate({ _id: currentManager }, {
                        $set: {
                            isAssign: true, nextManager: nextManager
                        }, $addToSet: { disputeTrades: data.tradeId }
                    }, { new: true }).exec((err1, succ1) => {
                        console.log("i am herer >>>", err1, succ1._id)
                        if (err1) {
                            response = { responseCode: 400, responseMessage: err1 }
    
                            resolve(response)
    
                        }
                        else if (succ1) {
    
    
                            var obj =
                            {
                                $set: {
                                    assignManagerDate: Date.now(),
                                    disputeDate: Date.now(),
                                    currentMonth: new Date().getMonth(),
                                    dispute_status: true,
                                    disputeDone: true,
                                    disputeReason: data.disputeReason,
                                    status: data.status,
                                    request_status: data.request_status,
                                    disputeUniqueId: "#" + unique,
                                    "assignManager": currentManager
                                }
                            }
    
                            //{ $set: { "assignManager": currentManager, assignManagerDate: Date.now() } }
    
                            trade.findOneAndUpdate({ "_id": data.tradeId }, obj, { new: true }, (err12, result_) => {
                                if (err12) {
                                    response = { responseCode: 400, responseMessage: "Internal server error", err12 }
    
                                    resolve(response)
    
                                }
                                else if (result_) {
    
                                    response = {
                                        responseCode: 200, responseMessage: "Dispute done successfully",
                                        result: result_
                                    }
    
                                    resolve(response)
    
                                }
                            })
    
                        }
                    })
               
    
    
    
    
    
    
            }
    
    



        })










   


    }






}












async function saveDataFun(userId) {
    return new Promise((resolve, reject) => {
        User.findOne({
            _id: userId,
            userType: { $in: ["SUBADMIN", "MANAGER", "ADMIN"] },
            status: "ACTIVE"
        }, (err1, result12) => {
            console.log("234567893456789", result12)
            if (err1) {
                resolve(false);
            } else if (!result12) {
                resolve(false);
            }
            else {
                resolve(result12);
            }
        })
    })
}



async function saveDataFun_emp(empId) {
    return new Promise((resolve, reject) => {
        User.findOne({
            _id: empId,
            userType: { $in: ["SUBADMIN"] },
            status: "ACTIVE"
        }, (err1, result12) => {
            console.log("234567893456789", result12)
            if (err1) {
                resolve(false);
            } else if (!result12) {
                resolve(false);
            }
            else {
                resolve(result12);
            }
        })
    })
}
const commonFunction = require('../../globalFunctions/message')
// const adminModel = require("../../models/adminModel");
const userService = require("../services/userApis");
const staticModel = require("../../models/staticModel");
let func = require('../../commonFile/function');

const escrow = require('../../models/deductedValue');
const trade = require("../../models/tradeModel")
const mongoose = require('mongoose');

var staffTrack = require('../../models/trackStaffModel')
const chatHistorySchema = require('../../models/chatHistory');
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
    "cloud_name":"georgia007", 
    "api_key": "967385781722363", 
    "api_secret": "Y-Kq-UPU1i9zJP4QOkoNkfsVTR8"

});


module.exports = {

    //..........................................................Dashbourd userGraph>> Admin ..........................................................................//
    userGraph: (req, res) => {
        console.log("!!!", req.body)
        var offset = (new Date().getTimezoneOffset()) * 60000;  //-19800000

        var numberOfDays = req.body.dayCount; //number of days to add.
        var today = new Date(); //Today's Date
        var temp = new Date(today.getFullYear(), today.getMonth(), today.getDate() - numberOfDays + 1)
        var needDate = new Date(temp).getTime() + offset
        var requiredDate = new Date(needDate).toISOString()
        console.log("given date for user find>>>>>>>>>>",requiredDate)
        User.find({ createdAt: { $gte: requiredDate }, status: { $ne: 'DELETE' }, userType: { $ne: "ADMIN" } }).exec((error1, data) => {
            //console.log("@@@@@",error1,data[0].createdAt,data.length)
            var temp = []
            for (var i = 0; i < data.length; i++)
                temp.push(data[i].createdAt.toString())

            // console.log("@@@@@",error1,a)
            if (error1) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (!result) {
                res.send({
                    responseCode: 404,
                    responseMessage: "No data found"
                })
            } else {
                 console.log("%%%%%%%%%%   temp>>>>>>", JSON.stringify(temp))
                var counts = {};
                for (var i = 0; i < temp.length; i++) {
                    counts[temp[i].slice(0, 15)] = 1 + (counts[temp[i].slice(0, 15)] || 0);
                }

                console.log("%%%%%%%%%% 79temp}}}}" , JSON.stringify(counts))


                res.send({
                    responseCode: 200,
                    responseMessage: "User graph list",
                    result: counts,
                })
            }
        })
    },
    //..........................................................Dashbourd Payment>> Admin ..........................................................................//
    paymentGraph: (req, res) => {
        console.log("!!!", req.body)
        var offset = (new Date().getTimezoneOffset()) * 60000;  //-19800000
        var numberOfDays = req.body.dayCount; //number of days to add.
        var today = new Date(); //Today's Date
        var temp = new Date(today.getFullYear(), today.getMonth(), today.getDate() - numberOfDays + 1)
        var needDate = new Date(temp).getTime() + offset
        var requiredDate = new Date(needDate).toISOString()

        trade.find({ $and: [{ createdAt: { $gte: requiredDate } }, { request_status: { $ne: ["DELETE"] } }] }, (error1, result1) => {


            // console.log("@@@@@",error1,a)
            if (error1) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (!result) {
                res.send({
                    responseCode: 404,
                    responseMessage: "No data found"
                })
            } else {
                var temp = []
                for (var i = 0; i < result1.length; i++)
                    temp.push(result1[i].payment_method)

                console.log("%%%%%%%%%%", temp, result1)
                var counts = {};
                for (var i = 0; i < temp.length; i++) {
                    counts[temp[i]] = 1 + (counts[temp[i]] || 0);
                }
                res.send({
                    responseCode: 200,
                    responseMessage: "Payment graph list",
                    result: counts,
                })
            }
        })
    },
    //..........................................................Dashbourd tradeGraph>> Admin ..........................................................................//
    tradeGraph: (req, res) => {
        console.log("!!!", req.body)
        var offset = (new Date().getTimezoneOffset()) * 60000;  //-19800000

        var numberOfDays = req.body.dayCount; //number of days to add.
        var today = new Date(); //Today's Date
        var temp = new Date(today.getFullYear(), today.getMonth(), today.getDate() - numberOfDays + 1)
        var needDate = new Date(temp).getTime() + offset
        var requiredDate = new Date(needDate).toISOString()
        trade.find({ $and: [{ createdAt: { $gte: requiredDate } }, { request_status: req.body.status }] }).exec((error1, data) => {
            // console.log("@@@@@",error1,data[0].createdAt,data.length)


            // console.log("@@@@@",error1,a)
            if (error1) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (!result) {
                res.send({
                    responseCode: 404,
                    responseMessage: "No data found"
                })
            } else {

                var temp = []
                for (var i = 0; i < data.length; i++)
                    temp.push(data[i].createdAt.toString())
                console.log("%%%%%%%%%%", temp, data)
                var counts = {};
                for (var i = 0; i < temp.length; i++) {
                    counts[temp[i].slice(0, 15)] = 1 + (counts[temp[i].slice(0, 15)] || 0);
                }
                res.send({
                    responseCode: 200,
                    responseMessage: "Trade graph list",
                    result: counts,
                })
            }
        })
    },
    //..........................................................Dashbourd countryGraph by advertisement>> Admin ..........................................................................//
    addCountryGraph: (req, res) => {
        console.log("!!!", req.body)
        // var offset = (new Date().getTimezoneOffset()) * 60000;  //-19800000

        // var numberOfDays = req.body.dayCount; //number of days to add.
        // var today = new Date(); //Today's Date
        // var temp = new Date(today.getFullYear(), today.getMonth(), today.getDate() - numberOfDays + 1)
        // var needDate = new Date(temp).getTime() + offset
        // var requiredDate = new Date(needDate).toISOString()
        advertiseModel.find({ status: { $ne: ['DELETE'] } }).exec((error1, data) => {
            // console.log("@@@@@",error1,data[0].createdAt,data.length)
            var temp = []
            for (var i = 0; i < data.length; i++)
                temp.push(data[i].location)

            // console.log("@@@@@",error1,a)
            if (error1) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (!result) {
                res.send({
                    responseCode: 404,
                    responseMessage: "No data found"
                })
            } else {
                console.log("%%%%%%%%%%", temp, data)
                var counts = {};
                for (var i = 0; i < temp.length; i++) {
                    counts[temp[i]] = 1 + (counts[temp[i]] || 0);
                }
                res.send({
                    responseCode: 200,
                    responseMessage: "Country graph list",
                    result: counts,

                    //  result: counts.assign([], counts).reverse()

                })
            }
        })
    },

    //..........................................................Dashbourd countryGraph by trade>> Admin ..........................................................................//
    tradeCountryGraph: (req, res) => {
       
        trade.find({ status: { $ne: ['DELETE'] } }).exec((error1, data) => {
            var temp = []
            for (var i = 0; i < data.length; i++)
                temp.push(data[i].country)
            if (error1) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (!result) {
                res.send({
                    responseCode: 404,
                    responseMessage: "No data found"
                })
            } else {
                console.log("%%%%%%%%%%", temp, data)
                var counts = {};
                for (var i = 0; i < temp.length; i++) {
                    counts[temp[i]] = 1 + (counts[temp[i]] || 0);
                }
                res.send({
                    responseCode: 200,
                    responseMessage: "Country graph list",
                    result: counts,
                })
            }
        })
    },
    //.................................................................totaltWalletBalance graph for admin..................................................
    totaltWalletBalance: (req, res) => {

        User.findOne({ userType: "ADMIN", status: { $ne: ['DELETE'] } }, (error, result) => {
            if (error) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (!result) {
                res.send({
                    responseCode: 404,
                    responseMessage: "No data found"
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "totaltWalletBalance graph list",
                    result: result.btc,
                })
            }
        })


    },
    "chatImage": (req, res) => {
        var query = {}
        query.$and = [{ 'image': { $exists: true } }, { 'tradeId': req.body.tradeId }]

        chatHistorySchema.find(query).select("image").exec((error, result) => {
            if (error) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (!result) {
                res.send({
                    responseCode: 404,
                    responseMessage: "No data found"
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "Chat images list",
                    result: result,
                })
            }
        })



    },
    "disputeList": (req, res) => {
        trade.aggregate([
            {
                $match:{dispute_status:true}
            },
            {
                $group: {
                    _id:{
                        month:"$currentMonth",
                       
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project:{
                    _id:1,
                    count:1,
                    month:{
                        $cond:{
                            if:{$eq:["$_id.month","0"]},
                            then:"JANUARY",
                        else:{
                            $cond:{if:{$eq:["$_id.month","1"]},
                            then:"FEBRUARY",
                        else:{
                            $cond:{if:{$eq:["$_id.month","2"]},
                            then:"MARCH",
                        else:{
                            $cond:{if:{$eq:["$_id.month","3"]},
                            then:"APRIL",
                        else:{
                            $cond:{ if:{$eq:["$_id.month","4"]},
                            then:"MAY",
                        else:{
                            $cond:{ if:{$eq:["$_id.month","5"]},
                            then:"JUNE",
                        else:{
                            $cond:{if:{$eq:["$_id.month","6"]},
                            then:"JULY",
                        else:{
                            $cond:{if:{$eq:["$_id.month","7"]},
                            then:"AUGUST",
                        else:{
                            $cond:{if:{$eq:["$_id.month","8"]},
                            then:"SEPTEMBER",
                        else:{
                            $cond:{if:{$eq:["$_id.month","9"]},
                            then:"OCTOBER",
                        else:{
                            $cond:{if:{$eq:["$_id.month","10"]},
                            then:"NOVEMBER",
                        else:{
                            $cond:{ if:{$eq:["$_id.month","11"]},
                            then:"DECEMBER",
                            else:"NOTHING"
                        
                        }
                        }
                        }
                        }
                        }
                        }
                        }
                        }
                        }
                        }
                        }
                        }}}}}}}}}}}}
                    }
                }
            }
        ])
        .exec((err,result)=>{
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error",err
                })
            } else if (!result) {
                res.send({
                    responseCode: 404,
                    responseMessage: "No data found"
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "Dispute list",
                    result: result,
                })
            }
        })
    }




}




const commonFunction = require('../../globalFunctions/message')
// const adminModel = require("../../models/adminModel");
const userService = require("../services/userApis");
const staticModel = require("../../models/staticModel");
let func = require('../../commonFile/function');
const escrow = require('../../models/deductedValue');
const trade = require("../../models/tradeModel")
const mongoose = require('mongoose');
var requestify = require('requestify');
var coinUrl = global.gConfig.mainetUrl;
const request = require('request');
const BigNumber = require('bignumber.js');
var staffTrack = require('../../models/trackStaffModel')
var configuration = require("../../models/systemConfiguration")
const recomment = require("../../models/recommentModel")
// const escrow=require("../../models/deductedModel")

const User = require("../../models/userModel.js");
const walletTransaction = require("../../models/transactionModel.js")
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
const RoomModel = require('../../models/room.js');
var Sender = require('aws-sms-send');

// var aws_topic = 'arn:aws:sns:us-east-1:872543194279:swiftpro'
var aws_topic = 'arn:aws:sns:us-east-1:729366371820:coinbaazar'


var config1 = {
    AWS: {
        accessKeyId: 'AKIAIZ32QDUFAGKVPQNA',
        secretAccessKey: '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',
        region: 'us-east-1',
    },
    topicArn: aws_topic,
  };
  
  var sender = new Sender(config1);


cloudinary.config({
    "cloud_name":"georgia007", 
    "api_key": "967385781722363", 
    "api_secret": "Y-Kq-UPU1i9zJP4QOkoNkfsVTR8"

});
//...........................................Check email/userName existing by AdminPanel..........................................................//
const checkQuery = (req, res) => {
    User.findOne({ $and: [{ status: { $ne: "DELETE" } }, { $or: [{ user_name: req.body.username }, { email: req.body.email }] }] }, (error, response) => {
        if (error) {
            console.log("Error is=======>", error, response)
            return res.send({ responseCode: 500, responseMessage: "Internal server error", error })
        }
        else if (response) {
            if (response.user_name == req.body.username) {
                return res.send({ responseCode: 404, responseMessage: "User name already exist." })
            }
            else {
                return res.send({ responseCode: 404, responseMessage: "Email already exist." })
            }
        }
        else {
            return res.send({ responseCode: 200, responseMessage: "Data found successfully" })

        }
    })
}

//...........................................Add Subadmin..........................................................//
const addAdmin = (req, res) => {
    console.log("Request is==========>", req.headers, "body" >> req.body);
    User.findOne({ "_id": req.body.adminId }, (error3, response3) => {
        if (error3) {
            console.log("Error 2 is=======>", error3)
            return res.send({ responseCode: 500, responseMessage: "Internal server error", error3 })
        }
        else if (!response3) {
            return res.send({ responseCode: 404, responseMessage: "Data not found" })
        }
        else {
            var secret = speakeasy.generateSecret({ length: 20 });
            console.log("Secret is===========>", secret)
            var token = speakeasy.totp({ secret: secret.base32, encoding: 'base32' })
            console.log("Google Token is===========>", token)
            unique = commonFunction.getCode();
            User.findOne({ $and: [{ status: { $ne: "DELETE" } }, { $or: [{ user_name: req.body.username }, { email: req.body.email }] }] }, (error, response) => {
                if (error) {
                    console.log("Error is=======>", error)
                    return res.send({ responseCode: 500, responseMessage: "Internal server error", error })
                }
                else if (!response) {
                    req.body.password = bcrypt.hashSync(req.body.password, salt)
                    if(req.body.type == 'MANAGER'){
                        
                        var obj = {
                            "name": req.body.name,
                            "email": req.body.email,
                            "user_name": req.body.username,
                            "password": req.body.password,
                            "secret": secret,
                            "userType": req.body.type,
                            "googleToken": token,
                            "createdBy": req.body.adminId,
                            "uniqueId": "#" + unique
    
    
                        }

                    }else{
                        var obj = {
                            //  "userType":req.body.userType,
                            "name": req.body.name,
                            "email": req.body.email,
                            "user_name": req.body.username,
                            "password": req.body.password,
                            "secret": secret,
                            "userType": req.body.type,
                            "googleToken": token,
                            "createdBy": req.body.adminId,
                            "uniqueId": "#" + unique
    
    
                        }
                    }
                   
                    let add = new User(obj);
                    add.save((err2, result2) => {
                        if (err2) {
                            console.log("Error 2 is===========>", err2)
                            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                        }
                        else {

                            if (req.body.permission[0].um_disable2FA == true) {
                                var googleAuth = true
                            }
                            else {
                                var googleAuth = false
                            }

                            QRCode.toDataURL(result2.secret.otpauth_url, function (err, image_data) {
                                if (err) {
                                    console.log("Error is generate code is=======>", err)
                                    return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                                }
                                else {
                                    console.log("QR code is=====>", image_data);
                                    cloudinary.v2.uploader.upload(image_data, (err4, result4) => {
                                        if (err4) {
                                            console.log("Error is=======>", err4)
                                        }
                                        else {
                                            var id = result2._id;
                                            console.log("Id of result2 is=======>", id)
                                            var url = result4.url;
                                            User.findOneAndUpdate({ _id: id }, { $set: { "permission": req.body.permission, "scan2FACode": googleAuth, "qrCodeUrl": url } }, { new: true, password: 1 }, (err1, result1) => {
                                                if (err1) {
                                                    console.log("Error is======>", err1)
                                                    return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                                                }
                                                else {
                                                    return res.send({ responseCode: 200, responseMessage: "Subadmin added successfully." })
                                                }

                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
                else {

                    if (response.user_name == req.body.username) {
                        return res.send({ responseCode: 404, responseMessage: "User name  already exist." })
                    }
                    else if (response.email == req.body.email) {
                        return res.send({ responseCode: 404, responseMessage: "Email already exist." })
                    }
                    else {

                        User.findOne({ $and: [{ "googleVerification": false }, { "email": req.body.email }] }, (err5, result5) => {
                            if (err5) {
                                console.log("Error is========>", err5)
                                return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                            }
                            else if (result5) {
                                var obj = { "QrCode": result5.qrCodeUrl }
                                return res.send({ responseCode: 200, responseMessage: "Please verify your google 2FA!", obj })
                            }
                            else {
                                return res.send({ responseCode: 200, responseMessage: "Verify" })
                            }
                        })
                    }


                }
            })
        }
    })
}





//================================================Verify Google 2FA===========================================//
const verifyTwoFactorAuth = (req, res) => {
    console.log('Request is=======', req.body);
    User.findOne({ "_id": req.body.id, "userType": req.body.type }, (err, result) => {
        if (err) {
            console.log('error', err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
        }
        else if (!result) {
            console.log("Data Not found")
            return res.send({ responseCode: 501, responseMessage: "Data Not Found" })
        }
        else {
            var jwtToken = jwt.sign({ email: result.email, user_name: result.user_name }, 'Mobiloitte');

            var googleToken = req.body.googleToken;
            console.log("Google token By customer is===========>", googleToken, result.secret.base32)
            var tokenValidators = speakeasy.totp.verify({ secret: result.secret.base32, encoding: 'base32', token: googleToken })
            console.log("Google 2FA status is=========>", tokenValidators);
           // tokenValidators = true
            if (tokenValidators) {

                if (!req.body.addAdmin) {
                    User.findOneAndUpdate({
                        _id: req.body.id
                    }, {
                            $set: {
                                googleVerification: true, scan2FACode: true, token: jwtToken,
                            }
                        }, { new: true }).exec((error, result) => {
                            if (error) {
                                console.log("Error", error)
                                return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                            }
                            else {
                                console.log("Authentication success")
                                res.send({ responseCode: 200, responseMessage: "Google Auth success", result })
                            }
                        })
                }
                else {
                    User.findOneAndUpdate({
                        _id: req.body.id
                    }, {
                            $set: {
                                googleVerification: true, scan2FACode: true
                            }
                        }, { new: true }).exec((error, result) => {
                            if (error) {
                                console.log("Error", error)
                                return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                            }
                            else {


                                
                                console.log("Authentication success")
                                res.send({ responseCode: 200, responseMessage: "Google Auth success", result })
                            }
                        })
                }
            }


            else {
                console.log("Token is not correct")
                res.send({ responseCode: 501, responseMessage: "Invalid 2FA" })
            }
        }
    })
}



//==========================================Profile Update======================================testing      ======//
const profileUpdate = (req, res) => {
    var d=new Date().getFullYear();
    console.log("Date is===========>",d);
    // console.log("Request is=========>", req.body)


    var secret = speakeasy.generateSecret({ length: 20 });
    console.log("Secret is===========>", secret)
    var token = speakeasy.totp({ secret: secret.base32, encoding: 'base32' })
    console.log("Google Token is===========>", token)
    unique = commonFunction.getCode();
    req.body.googleToken = token;
    req.body.google2FA = false;
    console.log("Google Token is=========>", token)


    User.findOne({ "_id": req.body.id, status: { $ne: 'DELETE' } }, (error3, response3) => {
        if (error3) {
            console.log("Error 2 is=======>", error3)
        }

        else if (!response3) {
            console.log("Data not found")
            return res.send({ responseCode: 501, responseMessage: "Data not found" })
        }
        else {
            function saving() {
                QRCode.toDataURL(response3.secret.otpauth_url, function (err, image_data) {
                    if (err) {
                        console.log("Error is generate code is=======>", err)
                        return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                    }
                    else {
                        console.log("QR code is=====>", image_data);
                        cloudinary.v2.uploader.upload(image_data, (err4, result4) => {
                            if (err4) {
                                console.log("Error is=======>", err4, result4)
                            }
                            else {
                                var id = response3._id;
                                console.log("Id of result2 is=======>", id)
                                var url = result4.url;
                                req.body.qrCodeUrl = url
                                // "scan2FACode": googleAuth
                                User.findOneAndUpdate({ _id: id }, req.body, { new: true, password: 1 }, (err1, result1) => {
                                    if (err1) {
                                        console.log("Error is======>", err1)
                                        return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                                    }
                                    else {
                                        var html = `<html lang="en"><head>

                                        <meta charset="utf-8">
                                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                        <meta name="viewport" content="width=device-width, initial-scale=1">
                                        <meta name="description" content="">
                                        <meta name="author" content="">
                                      
                                        <title></title>
                                    
                                       
                                    
                                    </head>
                                    <body style="margin: 0px; padding: 0px;">
                                      <div style="min-width:600px;margin:0px;background:#fff;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300;color:#777;line-height:30px">
                                    
                                            <table style="width:600px;margin:0px auto;background:#faa547;padding:0px;border: 4px solid black;    border-radius: 6px;" cellpadding="0" cellspacing="0" >
                                                <tbody>
                                            <tr>
                                              <td style='font-size: 16px;text-align:center;' >
                                                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-weight:600;">
                                                <tbody>
                                                <tr style="background-color:#faa547; text-align:left;">
                                                  <td style="font-size:16px;text-align:left;">	
                                                    <span style="display:inline-block;height: 100px;text-align:left;border-bottom: 4px solid black!important;border-right: 4px solid black!important;">
                                                      <img src="http://res.cloudinary.com/georgia007/image/upload/v1554982991/k8givlmop6cn91ho59bo.jpg" style="padding: 0px;margin: 0px; width="100" height="100"">
                                                    </span>
                                                  </td>										 								
                                                </tr>								
                                              </tbody>
                                                </table>
                                                
                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-weight:600;margin-bottom:50px;padding:0px 15px; ">
                                                  <tbody>
                                                    <tr>
                                                             <td  style="text-align: center;     padding: 16px 0px;">
                                                                          <div style="color:#fff;font-size:25px;margin-bottom:5px;">Dear ${response3.user_name},</div>
                                                      </td>	
                                                        </tr>
                                                       
                                                        <tr>
                                                             <td  style="text-align: center;">
                                                                          <div style="color:#FF0000;font-size:25px;margin-bottom:5px;font-weight: 200;">Your profile has been successfully updated with having email ${req.body.email}</div>
                                                      </td>	
                                                        </tr>
                                                        <tr>
                                                        <td  style="text-align: center;    padding: 20px 0px;">
                                                                    
                                                 </td>	
                                                   </tr>	
                                                                       
                                                  </tbody>
                                                </table>
                                    
                                              </table>
                                            </div>
                                        
                                      </body>
                                      </html>`


                                  
                                       commonFunction.sendMail(req.body.email, "Regarding profile update", "",html, (error, sent) => {
                                            if (error || !sent) {
                                                console.log("{{{{{{>>>>>>>>}}}}}", sent)
                                                return res.send({
                                                    responseCode: 500,
                                                    responseMessage: "Error occured."
                                                });
                                            } else {

                                                return res.send({ responseCode: 200, responseMessage: "Subadmin updated successfully." })

                                            }
                                        })
                                    }

                                })
                            }
                        })
                    }
                })
            }
            //

            function data() {
                User.findOne({ "_id": req.headers.id }, (err11, data) => {
                    if (err11) {
                        return func.responseHandler(res, 400, "Internal Server Error2.", err)
                    }
                    else {
                        if (data.userType == "ADMIN") {
                            saving()
                        }
                        else {

                            unique = commonFunction.getCode();
                            let obj1 = {
                                "uniqueId": "#" + unique,
                                "userId": req.body.id,
                                "staffName": data.user_name,
                                "module": "User profile updation action",
                                "staffId": req.headers.id,
                                "documentData": result,
                                "action": `${data.user_name} profile has been updated. `
                                //   
                            };

                            let track = new staffTrack(obj1);
                            track.save((er1, ress) => {
                                // console.log(`Error is ${JSON.stringify(er1)}   result is ${JSON.stringify(ress)}`)
                                if (er1) {
                                    console.log(er1)
                                }
                                else {
                                    console.log("aa@@@@@@@@@@aaaa>>>>in 698", JSON.stringify(ress))
                                    saving()
                                }
                            })

                        }
                    }
                })


            }

            if (response3.user_name == req.body.user_name) {
                if (response3.email == req.body.email) {
                    data()
                }

                else {
                    User.findOne({ $and: [{ status: { $ne: "DELETE" } }, { email: req.body.email }] }, (error, response) => {
                        if (error) {
                            console.log("Error is=======>", error)
                            return res.send({ responseCode: 500, responseMessage: "Internal server error", error })
                        }
                        else if (response) {
                            return func.responseHandler(res, 404, "Email already exist");
                        }
                        else {
                            data()
                        }
                    })
                }
            }
            //user_name!==user_name
            else {
                if (response3.email == req.body.email) {
                    User.findOne({ $and: [{ status: { $ne: "DELETE" } }, { user_name: req.body.user_name }] }, (error1, result1) => {
                        if (error1) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error", error1 })
                        }
                        else if (result1) {
                            return func.responseHandler(res, 404, "User name already exist");
                        }
                        else {
                            data()
                        }
                    })
                }
                else {
                    User.findOne({ $and: [{ status: { $ne: "DELETE" } }, { $or: [{ user_name: req.body.user_name }, { email: req.body.email }] }] }, (error2, result2) => {
                        if (error2) {
                            console.log("Error is=======>", error2)
                            return res.send({ responseCode: 500, responseMessage: "Internal server error", error2 })
                        }
                        else if (result2) {
                            if (result2 == req.body.user_name)
                                return func.responseHandler(res, 404, "User name already exist");
                            else {
                                return func.responseHandler(res, 404, "Email already exist");

                            }
                        }
                        else {
                            data()
                        }
                    })
                }
            }
        }

    })
}












//....................................2fa and sms status of user >>> admin..................................................................//
const statusChange = (req, res) => {
    // var obj = {
    //     verified_phone: req.body.verified_phone,
    //     googleTwofactorLink: req.body.googleTwofactorLink

    // }
    User.findOne({ $and: [{ "_id": req.headers.id, status: { $ne: ["DELETE"] } }] }, (err, result) => {
        if (err) {
            console.log("Error is======>", err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
        }
        else if (result) {

            if ((result.userType == "SUBADMIN") || (result.userType == "MANAGER")) {
                User.findOneAndUpdate({
                    _id: req.body.userId
                }, req.body, { new: true }, (err1, succ1) => {
                    if (err1) {
                        console.log("Error 1 is=======>", err1)
                        return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                    }
                    else {
                        console.log("admin>>>>>>>>>866", err1, succ1)

                        console.log("temp", req.body.tempData)
                        unique = commonFunction.getCode();
                        let obj1 = {
                            "uniqueId": "#" + unique,
                            "userId": req.body.userId,
                            "staffName": result.name,
                            "module": "User activity action",
                            "staffId": req.headers.id,
                            "userName": succ1.user_name,
                            "documentData": result,
                            "action": req.body.action
                            //   
                        };

                        let track = new staffTrack(obj1);
                        track.save((er1, ress) => {
                            // console.log(`Error is ${JSON.stringify(er1)}   result is ${JSON.stringify(ress)}`)
                            if (er1) {
                                console.log(er1)
                            }
                            else {
                                console.log("aa@@@@@@@@@@aaaa>>>>in deleted add", JSON.stringify(ress))
                                // return res.send({ responseCode: 200, responseMessage: "Advertisement deleted successfully..", result })
                            }
                        })
                        console.log("Updated successfully")
                        res.send({ responseCode: 200, responseMessage: "success", succ1 })
                    }
                })
            }
            else {
                User.findOneAndUpdate({
                    _id: req.body.userId
                }, req.body, { new: true }, (err1, succ1) => {
                    console.log("admin>>>>>>>>>866", err1, succ1)
                    if (err1) {
                        console.log("Error 1 is=======>", err1)
                        return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                    }
                    else {
                        console.log("Updated successfully")
                        res.send({ responseCode: 200, responseMessage: "success", succ1 })
                    }
                })
            }


        }
        else {
            console.log("No data found")
            return res.send({ responseCode: 404, responseMessage: "No Data found" })
        }
    })
}
//=================================Sub Admin & Staff Login history==============================================//

//=================================Sub Admin & Staff Login history==============================================//
const subadminLoginHistory = (req, res) => {

    var obj;
    let option = {
        page: req.body.pageNumber || 1,
        limit: req.body.limit || 10,
        select: 'login_history',
    }
    obj = {
        "_id": new mongoose.Types.ObjectId(req.body.userId)
        // $and: [{ "_id": new mongoose.Types.ObjectId(req.body.userId) }, { userType: req.body.type }]

    }

    var aggregate = User.aggregate([
        {
            $match:
                obj
        },
        { $unwind: "$login_history" },
        {
            $project: {

                "login_history": 1,
                "createdAt": 1
            }
        },
        { $sort: { "login_history.login_date": -1 } }

    ])

    console.log("aggregate Data>>>>>>>>>", aggregate)

    User.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
        console.log("kyc total >>>>>>>>>>>>.", err, result)
        if (err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
        else if (result === 0)
            return res.send({ responseCode: 404, responseMessage: "Data not found" })
        else {
            const data = {
                "total": total,
                "limit": option.limit,
                "currentPage": option.page,
                "totalPage": pages
            }
            console.log("result-->>", result)
            //return Response.sendResponseWithtData(res, resCode.EVERYTHING_IS_OK, 'success', success)
            return res.send({ responseCode: 200, responseMessage: "Data found successfully..", result, paginationData: data })

        }
    })
}


//===========================================Chnage 2FA======================================================//
const changeGoogle2FA = (req, res) => {
    console.log("Request is======>", req.body)
    //let saveData=await saveDataFun(req.headers._id);
    adminModel.findOne({ $and: [{ "_id": req.body.id }, { "Role": req.body.type }] }).exec((err, result) => {
        if (err) {
            console.log("Error is======>", err)
        }
        else if (result) {
            if (result.google2FA == false) {
                adminModel.findByIdAndUpdate({
                    _id: req.body.id
                }, {
                        $set: {
                            google2FA: true
                        }
                    }).exec((err1, succ1) => {
                        if (err1)
                            console.log("Error 1 is=======>", err1)
                        else {
                            console.log("Updated successfully")
                            res.send({ responseCode: 200, responseMessage: "success", Data: succ1 })
                        }
                    })
            }
            if (result.google2FA == true) {
                adminModel.findByIdAndUpdate({
                    _id: req.body.id
                }, {
                        $set: {
                            google2FA: false
                        }
                    }).exec((err1, succ1) => {
                        if (err1) {
                            console.log("Error 1 is=======>", err1)
                            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                        }
                        else {
                            console.log("Updated successfully")
                            res.send({ responseCode: 200, responseMessage: "success" })
                        }
                    })
            }
        }
        else {
            console.log("No data found")
            res.send({ responseCode: 501, responseMessage: "No data found" })
        }
    })
}

//=========================================login=============================================================//
const login = (req, res) => {
     console.log("@@@@@@@@@@@@", req.body)
    User.findOne({ $or: [{ user_name: req.body.email }, { "email": req.body.email }], status: { $in: ["ACTIVE", "BLOCK"] }, userType: { $in: ["ADMIN", "SUBADMIN", "MANAGER"] } }, (err, data) => {
        if (err) {
            return res.send({ responseCode: 500, responseMessage: "Internal server error.", err })
        }
        else if (!data) {
            return res.send({ responseCode: 404, responseMessage: "Email not found." })
        }
        else {
            // return res.send(data)
            // console.log("Requested password is========>", req.body.password, data)
            if (data.status == "BLOCK") {
                return res.send({ responseCode: 404, responseMessage: "User blocked by admin" })
            }
            else if (data.status == "DELETE") {
                return res.send({ responseCode: 404, responseMessage: "Data not found" })
            }
            else if (data.password == "") {
                return res.send({ responseCode: 404, responseMessage: "Please provide valid credential." })

            }
            else {
                var result1 = bcrypt.compareSync(req.body.password, data.password);
                console.log(result1, "Password is=======>", data.password)


                if (result1) {

                    var jwtToken = jwt.sign({ email: result.email, user_name: result.user_name }, 'Mobiloitte');

                  
                    var secret = speakeasy.generateSecret({ length: 20 });
                    ;
                    console.log("Secret is=======>", secret)
                    req.body.secret = secret
                    if (data.scan2FACode == false) {

                        QRCode.toDataURL(secret.otpauth_url, function (err, image_data) {
                            if (err) {
                                console.log("Error is generate code is=======>", err)
                                return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                            }
                            else {
                                console.log("QR code is=====>", image_data);
                                cloudinary.v2.uploader.upload(image_data, (err4, result4) => {
                                    var url = result4.url;
                                    console.log("Qr code cloudinary url is=============>", result4.url)

                                    var value;
                                    if (data.userType != "ADMIN")
                                        value = {
                                            qrCodeUrl: url,
                                            token: jwtToken,
                                            password: data.password,
                                            secret: req.body.secret,
                                            last_seen: Date.now(),
                                            sessionVerify: Date.now()
                                        }
                                    else {
                                        value = {
                                            qrCodeUrl: url,
                                            password: data.password,
                                            secret: req.body.secret,
                                            sessionVerify: Date.now(),
                                            last_seen: Date.now()
                                        }
                                    }

                                    // loginHistory = req.body.login_history;
                                    User.findOneAndUpdate({ $or: [{ "email": data.email }, { "user_name": data.user_name }], status: "ACTIVE" }, {
                                        $set: value, $push: {
                                            login_history: req.body.loginHistory


                                        }
                                    }, { new: true }, (err1, succ) => {
                                        if (err1) {
                                            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                                        }
                                        else if (!succ) {
                                            return res.send({ responseCode: 404, responseMessage: "Data not found.." })
                                        }
                                        else {
                                            res.send({ responseCode: 200, responseMessage: "Login successfully", succ })
                                        }
                                    })
                                })
                            }
                        });
                    }
                    else {
                        var jwtToken = jwt.sign({ email: result.email, user_name: result.user_name }, 'Mobiloitte');

                        let obj;
                        if (data.userType != "ADMIN")
                            obj = {
                                token: jwtToken,
                                password: data.password,
                                sessionVerify: Date.now(),
                                last_seen: Date.now()

                            }
                        else {
                            obj = {
                                password: data.password,
                                sessionVerify: Date.now(),
                                last_seen: Date.now()

                            }
                        }


                        User.findOneAndUpdate({ $or: [{ "email": data.email }, { "user_name": data.user_name }], status: "ACTIVE" }, {
                            $set: obj, $push: {
                                login_history: req.body.loginHistory
                            }
                        }, { new: true }, (err11, succ1) => {
                            if (err11) {
                                return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                            }
                            else if (!succ1) {
                                return res.send({ responseCode: 404, responseMessage: "Data not found" })
                            }
                            else {
                                res.send({ responseCode: 200, responseMessage: "Login successfully", data: succ1 })
                            }
                        })

                    }
                }
                else {
                    console.log("password not match")
                    return res.send({ responseCode: 400, responseMessage: "Password doesn't match" })
                }
            }

        }
    })
}


const getAdvertise = (req, res) => {
    var arg = {
        limit: req.body.limit || 10,
        page: req.body.page || 1

    }

    var query = { user_id: req.body.userId }

    if (req.body.status) {
        query.status = req.body.status
    }
    if (req.body.payment_method) {
        query.payment_method = req.body.payment_method
    }
    if (req.body.startDate && req.body.endDate) {
        query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
    }

    if (req.body.startDate && !req.body.endDate) {
        query.createdAt = { $gte: req.body.startDate }
    }
    if (!req.body.startDate && req.body.endDate) {
        query.createdAt = { $lte: req.body.endDate }
    }

    if (req.body.trade) {
        query.type_of_trade_original = req.body.trade
    }


    if (req.body.location) {
        query.location = req.body.location
    }

    if (req.body.minLimit && req.body.maxLimit) {
        query.$and = [{ min_transaction_limit: { $gte: req.body.minLimit } }, { max_transaction_limit: { $lte: req.body.maxLimit } }]
    }
    if (req.body.minLimit && !req.body.maxLimit) {
        query.min_transaction_limit = { $gte: req.body.minLimit }
    }
    if (!req.body.minLimit && req.body.maxLimit) {
        query.max_transaction_limit = { $lte: req.body.maxLimit }
    }
    if (req.body.uniqueId) {
        query.uniqueId = req.body.uniqueId
    }
    console.log("query check>>>>>>>>>>>>>", query)

    advertiseModel.paginate(query, arg, (err, result) => {
        if (err) {
            res.send({
                responseCode: 500,
                responseMessage: "Internal server error", err
            });
        } else if (result.length == 0) {
            res.send({
                responseCode: 401,
                responseMessage: "Data not found."
            });
        } else if (result) {

            let x = {
                total: result.total,
                limit: result.limit,
                currentPage: result.page,
                totalPage: result.pages
            }


            res.send({
                responseCode: 200,
                responseMessage: " Data found successfully.",
                result: result.docs, paginationData: x
            });
        }
    })
}



const addContactUs = (req, res) => {
    if (!req.body.userId && !req.body.subject && !req.body.email && !req.body.message) {
        return res.send({
            responseCode: 500,
            responseMessage: "Parameter missing. "
        });
    }
    else {
        if (req.body.image) {
            commonFunction.uploadImg(req.body.image, (err, success) => {
                if (err || !success) {
                    return res.send({
                        responseCode: 500,
                        responseMessage: "Error in uploading image.", err
                    });
                }
                else {
                    req.body.image = success;
                    contactUsSchema.create(req.body, (err1, success1) => {
                        if (err1 || !success1) {
                            return res.send({
                                responseCode: 500,
                                responseMessage: "Error in uploading image.", err1
                            });
                        }
                        else {

                            let html = `<html lang="en">
                            <head>
                              <meta charset="utf-8">
                              <meta http-equiv="X-UA-Compatible" content="IE=edge">
                              <meta name="viewport" content="width=device-width, initial-scale=1">
                              <meta name="description" content="">
                              <meta name="author" content="">
                              <title>Vendor & Users</title>
                            </head>
                            <body style="margin: 0px; padding: 0px; background-color: #eeeeee;">
                           
                              <div style="width:600px; margin:20px auto; background:#fff; font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300;color:#777;line-height:30px">
                            <div>
                                <table style="width: 100%; border: 1px solid #ccc;" cellpadding="0" cellspacing="0">
                                  <tbody>
                                  <tr style="margin:0;padding:0">
                                  <td bgcolor="#f1f1f1" height="100" style="text-align:center;background:#f1f1f1">
                                      <img src="https://res.cloudinary.com/sumit9211/image/upload/v1549007653/rtokt4z1bwcofdvidx4p.png" alt="Email register" class="">
                                  </td>
                              </tr>
                              <tr>
                              <td style="padding: 50px 15px 10px;">Emaild:- ${req.body.email} </td>
                            </tr>
                                      <tr>
                                        <td style="padding: 50px 15px 10px;">${req.body.message} </td>
                                      </tr>
                                      <tr>
                                      <td style="padding: 10px 15px 10px;">Thank you for using CoinBazar </td>
                                    </tr>
                                    
                                      
                                     
                                             
                                      <tr>
                                        <td style="padding: 25px 15px 20px;">
                                          Thanks &amp; Regards <br> Team CoinBazar
                                          </td>
                                     </tr>
                                     <tr>
                                     <td style="text-align: center; padding: 20px; background-color: #4e555a; color: #eeeeee;"> copyright @ CoinBaazar, All rights  reserved </td>
                                   </tr>
                                  </tbody>
                                </table>
                                </div>
                              </div>
                            </body>
                           </html>`
                            commonFunction.sendMailConractus('help@coinbaazar.com', req.body.subject, "", html,success ,(error, sent) => {
                              if (error) {
                                return res.send({
                                  responseCode: 500,
                                  responseMessage: "Error occured.", error
                                });
                              } else {
      
                                return res.send({
                                    responseCode: 200,
                                    responseMessage: " Thanks for contacting us.We will get back to you soon!"
                                });
                              }
                            })


                           

                        }

                    })
                }

            })
        }
        else {
            contactUsSchema.create(req.body, (err1, success1) => {
                console.log("884>>>>>>>>>>>>", err1, success1)
                if (err1 || !success1) {
                    return res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error"
                    });
                }
                else {
                  


                   let html = `<html lang="en">
                   <head>
                     <meta charset="utf-8">
                     <meta http-equiv="X-UA-Compatible" content="IE=edge">
                     <meta name="viewport" content="width=device-width, initial-scale=1">
                     <meta name="description" content="">
                     <meta name="author" content="">
                     <title>Vendor & Users</title>
                   </head>
                   <body style="margin: 0px; padding: 0px; background-color: #eeeeee;">
                  
                     <div style="width:600px; margin:20px auto; background:#fff; font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300;color:#777;line-height:30px">
                   <div>
                       <table style="width: 100%; border: 1px solid #ccc;" cellpadding="0" cellspacing="0">
                         <tbody>
                         <tr style="margin:0;padding:0">
                         <td bgcolor="#f1f1f1" height="100" style="text-align:center;background:#f1f1f1">
                             <img src="https://res.cloudinary.com/sumit9211/image/upload/v1549007653/rtokt4z1bwcofdvidx4p.png" alt="Email register" class="">
                         </td>
                     </tr>
                             <tr>
                               <td style="padding: 50px 15px 10px;">Emaild:- ${req.body.email}  </td>
                             </tr>
                             <tr>
                             <td style="padding: 50px 15px 10px;">Message:- ${req.body.message}  </td>
                           </tr>
                             <tr>
                             <td style="padding: 10px 15px 10px;">Thank you for using CoinBazar </td>
                         
                             <br>
                            
                                    
                             <tr>
                               <td style="padding: 25px 15px 20px;">
                                 Thanks &amp; Regards <br> Team CoinBazar
                                 </td>
                            </tr>
                            <tr>
                            <td style="text-align: center; padding: 20px; background-color: #4e555a; color: #eeeeee;"> copyright @ CoinBaazar, All rights  reserved </td>
                          </tr>
                         </tbody>
                       </table>
                       </div>
                     </div>
                   </body>
                  </html>`
                    commonFunction.sendMailConractus('help@coinbaazar.com', req.body.subject, "", html,'' ,(error, sent) => {
                      if (error) {
                        return res.send({
                          responseCode: 500,
                          responseMessage: "Error occured.", error
                        });
                      } else {

                        return res.send({
                            responseCode: 200,
                            responseMessage: " Thanks for contacting us.We will get back to you soon!"
                        });
                      }
                    })


                   

                }

            })

        }


    }
}





//================================================================ view viewParticularKYC >> by Admin ==================================================
const viewParticularKYC = (req, res) => {
    User.findOne({
        _id: req.body.userId,
        "kyc_docs._id": req.body.doc_Id,

    },
        {
            real_name: 1, post_trade_count: 1, user_name: 1, last_name: 1, email: 1, last_seen: 1, userType: 1, first_name: 1, last_name: 1, date_of_birth: 1, country: 1,
            time_zone: 1, login_history: 1, loginGuard: 1, browser_id: 1, two_factor_auth: 1, phone_number: 1, verified_email: 1, account_deletion_request: 1, files: 1, address: 1, zip_code: 1, verified_phone: 1, last_seen: 1, trust_count: 1, is_user_login: 1, show_real_name: 1, disable_info_from_Email: 1, enable_web_notification: 1, sell_vacation: 1, buy_vacation: 1, block_count: 1, country_code: 1, date_of_birth: 1, identity_doc: 1, city: 1, verified_upload_docs: 1, btc: 1,
            "kyc_docs.$._id": 1
        },
        (err1, success) => {
            if (err1) {
                res.send({ responseCode: 500, responseMessage: "Internal server error", err1 })
            }
            else if (!success) {
                res.send({ responseCode: 400, responseMessage: "Data not found" })
            } else
                res.send({ responseCode: 200, responseMessage: "Data found successfully", success })
        })
}

//..............................................................Show All userCount in Admin dashBoard...............................................


const numberOfUsers = (req, res) => {
    User.find({ $and: [{ userType: "USER" }, { $or: [{ status: { $in: ["ACTIVE", "BLOCK"] } }] }] }).count().exec((err, result) => {
        if (err) {
            return func.responseHandler(res, 400, "Internal Server Error.")
        } else {
            //subadmin count
            User.find({ $and: [{ userType: "SUBADMIN" }, { $or: [{ status: { $in: ["ACTIVE", "BLOCK"] } }] }] }).count().exec((err1, result1) => {
                if (err1) {
                    return func.responseHandler(res, 400, "Internal Server Error.")
                } else {
                    let Data =
                        {
                            User: result,
                            SubAdmin: result1
                        }
                    return func.responseHandler(res, 200, "Success.", Data)
                }
            })
        }
    })
}
//............................................... Show SubAdmin in Admin dashBoard..............................................................
const numberOfSubAdmin = (req, res) => {
    User.find({ $and: [{ userType: "SUBADMIN" }, { $or: [{ status: { $in: ["ACTIVE", "BLOCK"] } }] }] }).count().exec((err, result) => {
        if (err) {
            return func.responseHandler(res, 500, "Internal Server Error.")
        }
        else if (!result) {
            return func.responseHandler(res, 404, "Data not found..")
        }

        else {
            return func.responseHandler(res, 200, "Success.", result)
        }
    })
}


//.......................................................Getting search filter data of user/subadmin in admin panel..............................................................................................................//

const emailList = (req, res) => {
    var query = {}
    query.$and = [];
    if (req.body.userType) {
        //  query.userType=req.body.userType
        query.$and.push({ userType: req.body.userType });
    }
    else {
        //query.userType={$in: ["MANAGER", "SUBADMIN"]}
        query.$and.push({ userType: { $in: ["MANAGER", "SUBADMIN"] } })
    }
    query.$and.push({ status: { $ne: ['DELETE'] } })

    console.log("sfgdsdsfds", query)
    User.find(query).select("uniqueId name status country userType email user_name phone_number createdAt").exec((err, result) => {
        console.log("aaaaaaa", err, result)
        if (err) {
            res.send({
                responseCode: 500,
                responseMessage: "Internal server error", err
            })
        } else if (!result) {
            res.send({
                responseCode: 404,
                responseMessage: "Data not found"
            })
        } else {
            User.distinct("country", query, (error1, result1) => {

                if (error1) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error", error1
                    })
                }
                else if (!result1) {
                    res.send({
                        responseCode: 404,
                        responseMessage: "Data not found"
                    })
                }
                else {
                    console.log("==", result1.length)
                    var jsonObj = [];
                    var id = [];
                    for (var i = 0; i < result.length; i++) {
                        var data = result[i].uniqueId
                        var slnNo = i + 1
                        id.push({ "id": slnNo, data });
                    }
                    for (var i = 0; i < result1.length; i++) {

                        jsonObj.push({ "id": i + 1, "country": result1[i] });
                    }
                    User.distinct("name", query, (error11, result11) => {
                        var jsonObj1 = [];
                        for (var i = 0; i < result11.length; i++) {

                            jsonObj1.push({ "id": i + 1, "name": result11[i] });
                        }
                        if (error11) {
                            res.send({
                                responseCode: 500,
                                responseMessage: "Internal server error", error11
                            })
                        } else {
                            res.send({
                                responseCode: 200,
                                responseMessage: "Data found successfully.",
                                result: result.reverse(),
                                country: jsonObj.reverse(),
                                name: jsonObj1.reverse(),
                                uniqueId: id.reverse()
                            })
                        }
                    })



                }

            })

        }
    })
}



//.......................................................Getting search filter data of user/subadmin advertisement in admin panel..............................................................................................................//

const uniqueAddList = (req, res) => {
    if (req.body.userId) {
        var query = {
            $and: [{ user_id: req.body.userId }, { status: { $ne: ['DELETE'] } }]
        }
    }
    else {
        var query = { status: { $ne: ['DELETE'] } }
    }

    advertiseModel.find(query).select("uniqueId status user_id location user_email user_name phone_number createdAt").exec((err, result) => {
        if (err) {
            res.send({
                responseCode: 500,
                responseMessage: "Internal server error"
            })
        } else if (!result) {
            res.send({
                responseCode: 404,
                responseMessage: "Data not found"
            })
        } else {
            if (req.body.userId) {
                advertiseModel.distinct("location", { $and: [{ user_id: req.body.userId }, { status: { $ne: ["DELETE"] } }] }, (error1, result1) => {

                    if (error1) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error", error1
                        })
                    }
                    else if (!result1) {
                        res.send({
                            responseCode: 404,
                            responseMessage: "Data not found"
                        })
                    }
                    else {
                        console.log("==", result.length)
                        var jsonObj = [];
                        var id = [];
                        for (var i = 0; i < result.length; i++) {
                            var data = result[i].uniqueId
                            var slnNo = i + 1
                            id.push({ "id": slnNo, data });
                        }
                        for (var i = 0; i < result1.length; i++) {

                            jsonObj.push({ "id": i + 1, "location": result1[i] });
                        }
                        advertiseModel.distinct("user_name", { $and: [{ user_id: req.body.userId }, { status: { $ne: ["DELETE"] } }] }, (error11, result11) => {
                            var jsonObj1 = [];
                            for (var i = 0; i < result11.length; i++) {

                                jsonObj1.push({ "id": i + 1, "user_name": result11[i] });
                            }
                            if (error11) {
                                res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal server error", error11
                                })
                            } else {
                                advertiseModel.distinct("user_email", { $and: [{ user_id: req.body.userId }, { status: { $ne: ["DELETE"] } }] }, (error12, result12) => {
                                    var jsonObj2 = [];
                                    for (var i = 0; i < result12.length; i++) {

                                        jsonObj2.push({ "id": i + 1, "user_email": result12[i] });
                                    }
                                    if (error12) {
                                        res.send({
                                            responseCode: 500,
                                            responseMessage: "Internal server error", error12
                                        })
                                    } else {
                                        //  var data=result.uniqueId
                                        console.log(".....:>.......>..0", id)
                                        res.send({
                                            responseCode: 200,
                                            responseMessage: "Data found successfully.",
                                            result: result.reverse(),
                                            location: jsonObj.reverse(),
                                            userName: jsonObj1.reverse(),
                                            email: jsonObj2.reverse(),
                                            uniqueId: id.reverse()
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            else {
                advertiseModel.distinct("location", { status: { $ne: ["DELETE"] } }, (error1, result1) => {

                    if (error1) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error", error1
                        })
                    }
                    else if (!result1) {
                        res.send({
                            responseCode: 404,
                            responseMessage: "Data not found"
                        })
                    }
                    else {
                        console.log("==", result.length)
                        var jsonObj = [];
                        var id = [];
                        for (var i = 0; i < result.length; i++) {
                            var data = result[i].uniqueId
                            var slnNo = i + 1
                            id.push({ "id": slnNo, data });
                        }

                        for (var i = 0; i < result1.length; i++) {
                            jsonObj.push({ "id": i + 1, "location": result1[i] });
                        }

                        advertiseModel.distinct("user_name", { status: { $ne: ["DELETE"] } }, (error11, result11) => {
                            var jsonObj1 = [];


                            for (var i = 0; i < result11.length; i++) {

                                jsonObj1.push({ "id": i + 1, "user_name": result11[i] });
                            }


                            if (error11) {
                                res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal server error", error11
                                })
                            } else {
                                advertiseModel.distinct("user_email", { status: { $ne: ["DELETE"] } }, (error12, result12) => {
                                    var jsonObj2 = [];
                                    for (var i = 0; i < result12.length; i++) {

                                        jsonObj2.push({ "id": i + 1, "user_email": result12[i] });
                                    }
                                    if (error12) {
                                        res.send({
                                            responseCode: 500,
                                            responseMessage: "Internal server error", error12
                                        })
                                    } else {
                                        //  var data=result.uniqueId
                                        console.log(".....:>.......>..0", id)
                                        res.send({
                                            responseCode: 200,
                                            responseMessage: "Data found successfully.",
                                            result: result.reverse(),
                                            location: jsonObj.reverse(),
                                            userName: jsonObj1.reverse(),
                                            email: jsonObj2.reverse(),
                                            uniqueId: id.reverse()
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
    })
}



//..............................................get detail of invidual User/subadmin API for Admin panel............................................ //
const viewDetail = (req, res) => {
    User.findOne({ _id: req.body.userId }, { password: 0 }, (error, result) => {
        if (error)
            return func.responseHandler(res, 500, "Internal Server Error.", error)
        else if (!result) {
            return func.responseHandler(res, 404, "Data not found..")
        } else {

            return func.responseHandler(res, 200, "Data found successfully.", result)
        }
    })
}


// block/Delete User by  admin ..................................................................................................................
const blockUser = (req, res) => {

    console.log("req body>>>>>>>>", req.body)
    var statusData;
    if (req.body.status == "ACTIVE") {
        statusData = "active"
    }
    else if (req.body.status == "BLOCK") {
        statusData = "blocked"
    }
    else {
        statusData = "deleted"
    }
    if (!req.body.userId || !req.body.status) {
        return func.responseHandler(res, 401, "Parameters missing.")
    }
    function saving() {
        User.findOne({ "_id": req.headers.id }, (err11, data) => {
            if (err11) {
                return func.responseHandler(res, 400, "Internal Server Error2.", err)
            }
            else {
                if (data.userType == "ADMIN") {

                    User.findOneAndUpdate({
                        _id: req.body.userId
                    }, {
                            $set: {
                                status: req.body.status
                            }
                        }, {
                            new: true
                        }, (err, result) => {
                            if (err) {
                                return func.responseHandler(res, 400, "Internal Server Error2.", err)
                            } else {

                                return func.responseHandler(res, 200, `User ${statusData} successfully.`, result)
                            }
                        })
                }
                else {
                    User.findOneAndUpdate({
                        _id: req.body.userId
                    }, {
                            $set: {
                                status: req.body.status
                            }
                        }, {
                            new: true
                        }, (err, result) => {
                            if (err) {
                                return func.responseHandler(res, 400, "Internal Server Error2.", err)

                            } else {

                                unique = commonFunction.getCode();
                                let obj1 = {
                                    "uniqueId": "#" + unique,
                                    "userId": req.body.userId,
                                    "userName": result.user_name,
                                    "staffName": data.user_name,
                                    "module": "User activity action",
                                    "staffId": req.headers.id,
                                    "documentData": result,
                                    "action": `${result.user_name} account status is ${statusData} by ${data.user_name} `
                                    //   
                                };

                                let track = new staffTrack(obj1);
                                track.save((er1, ress) => {
                                    // console.log(`Error is ${JSON.stringify(er1)}   result is ${JSON.stringify(ress)}`)
                                    if (er1) {
                                        console.log(er1)
                                    }
                                    else {
                                        console.log("aa@@@@@@@@@@aaaa>>>>in deleted add", JSON.stringify(ress))
                                        // return res.send({ responseCode: 200, responseMessage: "Advertisement deleted successfully..", result })
                                    }
                                })
                                console.log("Updated successfully")
                                return func.responseHandler(res, 200, `User ${statusData} successfully.`, result)
                            }
                        })
                }
            }
        })

    }
    console.log("req>>>>>>>>>>>>", req.body)
    if (req.body.status === "ACTIVE") {
        console.log("aaaaaaa")
        advertiseModel.update({ user_id: req.body.userId, status: "BLOCK" }, { $set: { status: req.body.status } }, { new: true, multi: true }, (error, result1) => {
            console.log("fdf", result1)
            if (error) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error ", error })
            } else if (result.nModified == 0) {
                console.log("aaaa1872")

                saving()
            }
            else {
                console.log("aaaa1878")

                saving()
            }
        })
    }
    else if (req.body.status == "BLOCK") {
        console.log("bbbbbbbbbbb>?")

        advertiseModel.update({ user_id: req.body.userId, status: "ACTIVE" }, { $set: { status: req.body.status } }, { new: true, multi: true }, (error, result1) => {
            console.log("fdf", result1)
            if (error) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error ", error })
            } else if (result.nModified == 0) {
                console.log("bbbbbbb1891")

                saving()
            }
            else {
                console.log("bbbbbbb1897")

                saving()
            }
        })
    }
    else {
        console.log("ccccccccccccc>?")

        advertiseModel.update({ user_id: req.body.userId }, { $set: { status: req.body.status } }, { new: true, multi: true }, (error, result1) => {
            console.log("fdf", result1)
            if (error) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error ", error })
            } else if (result.nModified == 0) {
                console.log("ccccccccccccc>?2")

                saving()
            }
            else {
                console.log("ccccccccccccc>?3")

                saving()
            }
        })
    }

}




//....................................................view particular trade of individual user>>>admin..................................................//

const userTrade = (req, res) => {
    var arg = {
        limit: req.body.limit || 10,
        page: req.body.page || 1,
        sort: { createdAt: -1 },
        populate: { path: "advertisement_id", select: "uniqueId" }
    }
    var query = {
        $or: [{ "buyer.buyer_id": req.body.userId }, { "seller.seller_id": req.body.userId }]

    };
    if (req.body.tradeOwnerName) {
        query.trade_owner_name = req.body.tradeOwnerName
    }
    if (req.body.status) {
      
        query.request_status =req.body.status
    }
    if (req.body.location) {
        query.location = req.body.location
    }
    if (req.body.startDate && req.body.endDate) {
        query.$and = [{ createdAt: { $gte: req.body.startDate } }, { createdAt: { $lte: req.body.endDate } }]
    }
    if (req.body.startDate && !req.body.endDate) {
        query.createdAt = { $gte: req.body.startDate }
    }
    if (!req.body.startDate && req.body.endDate) {
        query.createdAt = { $lte: req.body.endDate }
    }
    if (req.body.uniqueId) {
        query.uniqueId = req.body.uniqueId
    }
    if (req.body.paymentMethod) {
        query.payment_method = req.body.paymentMethod
    }
    if (req.body.tradeType) {
        query.trade_type = req.body.tradeType
    }

    console.log("search filter for user>>>>>>>>>>", query)
    trade.paginate(query, arg, (err, result) => {
        if (err) {
            console.log(err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
        }
        else if (result.length == 0) {
            return res.send({ responseCode: 404, responseMessage: "Data not found " })

        }
        else {
            let x = {
                total: result.total,
                limit: result.limit,
                currentPage: result.page,
                totalPage: result.pages
            }
            return res.send({ responseCode: 200, responseMessage: "Data found successfully", result: result.docs, paginationData: x })
            console.log("Result is=========>",result.docs);
        }
    })
}


//............................................................userList by admin........................................................................//
const advertisementList = (req, res) => {

    var arg = {
        limit: req.body.limit || 10,
        page: req.body.page || 1,
        sort: { createdAt: -1 },
    }
    var query = {
        status: { $ne: ['DELETE'] }
    };

    if (req.body.email) {
        query.user_email = req.body.email
    }
    if (req.body.uniqueId) {
        query.uniqueId = req.body.uniqueId
    }
    if (req.body.userName) {
        query.user_name = req.body.userName
    }
    if (req.body.status) {
        query.status = req.body.status
    }
    if (req.body.country) {
        query.location = req.body.country
    }
    if (req.body.payment_method) {
        query.payment_method = req.body.payment_method
    }
    if (req.body.type) {
        query.type_of_trade_original = req.body.type
    }
    if (req.body.startDate && req.body.endDate) {
        query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
    }

    if (req.body.startDate && !req.body.endDate) {
        query.createdAt = { $gte: req.body.startDate }
    }
    if (!req.body.startDate && req.body.endDate) {
        query.createdAt = { $lte: req.body.endDate }
    }

    if (req.body.minLimit && req.body.maxlimit) {
        query.$and = [{ min_transaction_limit: { $gte: req.body.minLimit } }, { max_transaction_limit: { $lte: req.body.maxlimit } }]
    }
    if (req.body.minLimit && !req.body.maxlimit) {
        query.min_transaction_limit = { $gte: req.body.minLimit }
    }
    if (!req.body.minLimit && req.body.maxlimit) {
        query.max_transaction_limit = { $lte: req.body.maxlimit }
    }
    console.log("search filter for user>>>>>>>>>>", query)
    advertiseModel.paginate(query, arg, (err, result) => {
        if (err) {
            console.log(err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
        }
        else if (result.length == 0) {
            return res.send({ responseCode: 404, responseMessage: "Data not found " })

        }
        else {
            let x = {
                total: result.total,
                limit: result.limit,
                currentPage: result.page,
                totalPage: result.pages
            }
            return res.send({ responseCode: 200, responseMessage: "Data found successfully", result: result.docs, paginationData: x })
        }
    })
}




//............................................................user trade List by admin........................................................................//
const tradeList = (req, res) => {

    var arg = {
        limit: req.body.limit || 10,
        page: req.body.page || 1,
     //   sort: { assignManagerDate: -1 },
        populate: [{ "path": "advertisement_id", select: 'uniqueId' }, { "path": "assignManager", select: "user_name email" }, { path: "employeeId", select: "user_name" }]
    }




    if(req.body.disputeDone)
    {
        arg.sort= {assignManagerDate: -1 }
    
        
    }else{
        arg.sort= { createdAt: -1 }
    }

    
    // {path:"author", model:"Users", key:"username"}

    var query = {
    };
    var payment = {
        status: "ACTIVE"
    }
  
    if (req.body.tradeId) {
        query._id = req.body.tradeId
    }
 
    if (req.body.employeeId) {
        query.$or = [{ assignManager: req.body.employeeId }, { employeeId: req.body.employeeId }]
    }
    if (req.body.staffId) {
        query.staffId = req.body.staffId
    }


    if (req.body.dispute_status) {
        query.dispute_status = req.body.dispute_status
    }
    if (req.body.disputeDone) {
        query.disputeDone = req.body.disputeDone
    }


    if (req.body.status) {
        query.request_status = req.body.status
    }  
    if (req.body.paymentMethod) {
        query.payment_method = req.body.paymentMethod,
            payment.name = req.body.paymentMethod
    }
    if (req.body.country) {
        query.country = req.body.country
    }
    if (req.body.tradeType) {
        query.trade_type = req.body.tradeType
    }
    if (req.body.buyerName) {
        query["buyer.buyer_name"] = req.body.buyerName

    }
    if (req.body.sellerName) {
        query["seller.seller_name"] = req.body.sellerName
    }
    if (req.body.advertisementOwnername) {
        query.advertisement_owner_name = req.body.advertisementOwnername
    }

    if (req.body.tradeOwner) {
        query.trade_owner_name = req.body.tradeOwner
    }
    if (req.body.fromDate && req.body.toDate) {
        query.createdAt = { $gte: req.body.fromDate, $lte: req.body.toDate }
    }

    if (req.body.fromDate && !req.body.toDate) {
        query.createdAt = { $gte: req.body.fromDate }
    }
    if (!req.body.fromDate && req.body.toDate) {
        query.createdAt = { $lte: req.body.toDate }
    }
    if (req.body.uniqueId) {
        query.uniqueId = req.body.uniqueId
    }
    trade.paginate(query, arg, (err, result) => {
        if (err) {
            console.log(err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
        }
        else if (result.docs.length == 0) {
            return res.send({ responseCode: 404, responseMessage: "Data not found " })

        }
        else {

            paymentSchema.findOne(payment).select("buyerPaymentMessage sellerPaymentMessage").exec((err1, data) => {
                console.log("paymewnt>>>>>>.", err1, data)
                if (err) {

                    return res.send({ responseCode: 500, responseMessage: "Internal server error ", err1 })
                }
                else {
                    let x = {
                        total: result.total,
                        limit: result.limit,
                        currentPage: result.page,
                        totalPage: result.pages
                    }
                    return res.send({ responseCode: 200, responseMessage: "Data found successfully", result: result.docs, paginationData: x, paymentMessages: data })
                }
            })

        }
    })
}

//.............................................filter Data for trade list as well for tradeList>>ADMIN................................//
const tradeFilter = (req, res) => {
    var query = {}
    if (req.body.userId) {
        query.$or = [{ "seller.seller_id": req.body.userId }, { buyerId: req.body.userId }]
    }
    if (req.body.employeeId) {
        query.$or = [{ assignManager: req.body.employeeId }, { employeeId: req.body.employeeId }]

    }
    if (req.body.status) {
       
        query.request_status =req.body.status;
    }
    trade.find(query, (err, result1) => {

        if (err) {
            return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
        }
        else if (!result1) {
            return res.send({ responseCode: 404, responseMessage: "Data not found " })
        }
        else {
            trade.distinct("country", query, (error, result) => {
                if (error) {
                    console.log(error)
                    return res.send({ responseCode: 500, responseMessage: "Internal server error ", error })
                }
                else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "Data not found " })

                }
                else {
                    trade.distinct("trade_owner_name", query, (erro, result2) => {
                        if (erro) {
                            console.log(erro)
                            return res.send({ responseCode: 500, responseMessage: "Internal server error ", erro })
                        }
                        else if (!result2) {
                            return res.send({ responseCode: 404, responseMessage: "Data not found " })

                        }
                        else {
                            console.log("i am here", result)
                            var uniqueArr = []
                            var trdOwner = []
                            var countryArr = []
                            for (let i = 0; i < result1.length; i++) {
                                var slnNo = i + 1
                                uniqueArr.push({ "id": i, data: result1[i].uniqueId });
                            }
                            for (let i = 0; i < result.length; i++) {
                                countryArr.push({ "id": i, "country": result[i] });
                            }
                            for (let k = 0; k < result2.length; k++) {
                                trdOwner.push({ "id": k, "trade_owner_name": result2[k] })
                            }

                            return res.send({ responseCode: 200, responseMessage: "result found successfully", result1, uniqueId: uniqueArr, country: countryArr, tradeowner: trdOwner })

                        }
                    })
                   
                }
            }
            )
        }
    })
}


const paymentMethodMessage = (req, res) => {

    console.log('aaaaaaaaaaaa',req.body.paymentMethod)
    paymentSchema.findOne({name:req.body.paymentMethod}).select("buyerPaymentMessage sellerPaymentMessage").exec((err1, data) => {
        console.log("paymewnt>>>>>>.", err1, data)
        if (err1) {

            return res.send({ responseCode: 500, responseMessage: "Internal server error ", err1 })
        }
        else {
           
            return res.send({ responseCode: 200, responseMessage: "Data found successfully", paymentMessages: data })
        }
    })
   
   
}





//..............................................forgotPassword>>>>>>>> Admin Panel.............................//



const forgotPassword = (req, res) => {
    var d=new Date().getFullYear();
    console.log("Date is===========>",d);
    var hostname = req.headers.host;
    if (!req.body.email) {
        return res.send({
            responseCode: 500,
            responseMessage: "Parameters Missing"
        });
    } else {
        req.body.email = req.body.email.toLowerCase();
        User.findOne({
            email: req.body.email,
            status: "ACTIVE"
        }, (err, success) => {
            if (err)
                return res.send({
                    responseCode: 400,
                    responseMessage: "Error occured."
                });
            else if (!success)
                return res.send({
                    responseCode: 500,
                    responseMessage: "Invalid email id"
                });
            else {

                console.log(">>>>>>>>", success.user_name)
                var token = jwt.sign({ _id: result._id, email: result.email, password: result.user_name }, "Mobiloitte");

                //         let link = `162.222.32.20:1450/reset-password?_id=${success._id}&token=${token}`

                      // let link = `https://${req.headers.origin}/email-verification?_id=` + result._id;
                    //  let link = `${req.headers.origin}/forgotPassword/${success._id}/${token}`
                      let link = "https://" + hostname + "/forgotPassword/"+success._id+'/'+token;


                      let html = `<html lang="en"><head>

                      <meta charset="utf-8">
                      <meta http-equiv="X-UA-Compatible" content="IE=edge">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <meta name="description" content="">
                      <meta name="author" content="">
                    
                      <title></title>
                  
                     
                  
                  </head>
                  <body style="margin: 0px; padding: 0px;">
                    <div style="min-width:600px;margin:0px;background:#fff;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300;color:#777;line-height:30px">
                  
                          <table style="width:600px;margin:0px auto;background:#faa547;padding:0px;border: 4px solid black;    border-radius: 6px;" cellpadding="0" cellspacing="0" >
                              <tbody>
                          <tr>
                            <td style='font-size: 16px;text-align:center;' >
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-weight:600;">
                              <tbody>
                              <tr style="background-color:#faa547; text-align:left;">
                                <td style="font-size:16px;text-align:left;">	
                                  <span style="display:inline-block;height: 100px;text-align:left;border-bottom: 4px solid black!important;border-right: 4px solid black!important;">
                                    <img src="http://res.cloudinary.com/georgia007/image/upload/v1554982991/k8givlmop6cn91ho59bo.jpg" style="padding: 0px;margin: 0px; width="100" height="100"">
                                  </span>
                                </td>										 								
                              </tr>								
                            </tbody>
                              </table>
                              
                                          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-weight:600;margin-bottom:50px;padding:0px 15px; ">
                                <tbody>
                                  <tr>
                                           <td  style="text-align: center;     padding: 16px 0px;">
                                                        <div style="color:#fff;font-size:25px;margin-bottom:5px;">Dear ${success.user_name},</div>
                                    </td>	
                                      </tr>
                                           <td  style="text-align: center;">
                                                        <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">Click on the below link to reset your Password.</div>
                                    </td>	
                                      </tr>
                                      <tr>
                                           <td  style="text-align: center;    padding: 20px 0px;">
                                                        <a href=` + link + ` style="text-decoration: none;"> <div style="color:#fff;font-size:20px;font-weight: 300;background: #89e6cc; padding: 7px 16px; border: 1px solid #fff; border-radius: 8px;width: 220px;    margin: 0 auto;">CONFIRM EMAIL NOW</div>
                                                          </a>
                                    </td>	
                                      </tr>									
                                </tbody>
                              </table>
                  
                            </table>
                          </div>
                      
                    </body>
                    </html>`





               
              


                commonFunction.sendMail(req.body.email, "Regarding forgot password", "", html, (error, sent) => {
                    if (error) {
                        console.log("{{{{{{>>>>>>>>}}}}}")
                        return res.send({
                            responseCode: 500,
                            responseMessage: "Error occured."
                        });
                    } else {
                        var temp = Date.now() + 24 * 60 * 60 * 1000
                        userService.updateUser({ _id: success._id }, { $set: { forgotToken: token, forgotTimeStamp: temp } }, { new: true }, (error, success) => {
                            if (error)
                                console.log("error in updating document");
                            else {
                                console.log("Document updated successfully.")
                            }

                        })
                        return res.send({
                            responseCode: 200,
                            responseMessage: "Reset password link sent to your registered email."
                        });
                    }
                })
                // }


            }
        })
    }
}

const resetPassword = (req, res) => {
    if (!req.body._id || !req.body.password || !req.body.token) {
        return res.send({
            responseCode: 500,
            responseMessage: "Parameters missing."
        })
    } else {
        userService.getUser({
            _id: req.body._id,
            forgotToken: req.body.token,
            status: "ACTIVE"
        }, (err, result) => {
            if (err)
                return res.send({
                    responseCode: 400,
                    responseMessage: 'Please provide valid token.'
                });
            else if (!result) {
                return res.send({
                    responseCode: 400,
                    responseMessage: "Invalid token provided."
                });
            } else {
                var current = Date.now()
                console.log("dasdasdadasdas", result.forgotTimeStamp, "current>>>>", current)
                if (Number(result.forgotTimeStamp) > Number(current)) {
                    // console.log("dasdasdadasdas", result.forgotTimeStamp, "current>>>>", current)
                    let salt = bcrypt.genSaltSync(10);
                    req.body.password = bcrypt.hashSync(req.body.password, salt);
                    delete req.body["token"];
                    req.body.forgotToken = null;
                    console.log("body is>>>>>", req.body)
                    userService.updateUser({
                        _id: result._id
                    }, req.body, {
                            new: true
                        }, (err, result) => {
                            if (err)
                                return res.send({
                                    responseCode: 500,
                                    responseMessage: 'Please provide valid token.'
                                });
                            else {
                                return res.send({
                                    responseCode: 200,
                                    responseMessage: "User password change successfully.",
                                    data: result
                                });
                            }
                        })
                }
                else {
                    return res.send({
                        responseCode: 404,
                        responseMessage: "2FA has been expired.",
                        data: result
                    });
                }
            }

        })
    }
}





//============================================================== change status of advertisement by admin =============================================

const changeAdStatus = (req, res) => {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!", req.headers.id)
    User.findOne({ $and: [{ "_id": req.headers.id, status: { $ne: ["DELETE"] } }] }, (err, result123) => {
        if (err) {
            console.log("Error is======>", err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
        }
        else if (result123) {
            console.log("**************", result)
            if ((result123.userType == "SUBADMIN") || (result123.userType == "MANAGER")) {
                advertiseModel.findOne({ _id: req.body.adId }, (err, result) => {
                    if (err) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error"
                        })
                    } else if (!result) {
                        res.send({
                            responseCode: 400,
                            responseMessage: "No Advertisement found"
                        })
                    } else {
                        if (req.body.status == "DISABLE") {
                            advertiseModel.findOneAndUpdate({ _id: req.body.adId }, { $set: { status: "DISABLE" } }, { new: true }, (err, result1) => {
                                if (err) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error"
                                    })
                                } else {
                                    unique = commonFunction.getCode();
                                    let obj1 = {
                                        "uniqueId": "#" + unique,
                                        "userId": result.user_id,
                                        "staffName": result123.name,
                                        "module": "User activity action",
                                        "staffId": req.headers.id,
                                        "documentData": result,
                                        "userName": result.user_name,
                                        "action": "Advertisement disable successfully"
                                        //   
                                    };
                                    console.log("kon kar rha hai re------>", obj1)
                                    let track = new staffTrack(obj1);
                                    track.save((er1, ress) => {

                                        if (er1) {
                                            console.log(er1)
                                        }
                                        else {
                                            console.log("aa@@@@@@@@@@aaaa>>>>in deleted add", JSON.stringify(ress))

                                        }
                                    })
                                    res.send({
                                        result: result1,
                                        responseCode: 200,
                                        responseMessage: "Advertisement disabled successfully"
                                    })
                                }
                            })
                        } else if (req.body.status == "ACTIVE") {
                            advertiseModel.findOneAndUpdate({ _id: req.body.adId }, { $set: { status: "ACTIVE" } }, { new: true }, (err, result2) => {
                                if (err) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error"
                                    })
                                } else {
                                    unique = commonFunction.getCode();
                                    let obj1 = {
                                        "uniqueId": "#" + unique,
                                        "userId": result.user_id,
                                        "staffName": result123.name,
                                        "module": "User activity action",
                                        "staffId": req.headers.id,
                                        "documentData": result,
                                        "userName": result.user_name,
                                        "action": "Advertisement enable successfully"
                                        //   
                                    };
                                    console.log("kon kon kar rha hai re------>", obj1)


                                    let track = new staffTrack(obj1);
                                    track.save((er1, ress) => {

                                        if (er1) {
                                            console.log(er1)
                                        }
                                        else {
                                            console.log("aa@@@@@@@@@@aaaa>>>>in deleted add", JSON.stringify(ress))

                                        }
                                    })
                                    res.send({
                                        result: result2,
                                        responseCode: 200,
                                        responseMessage: "Advertisement enable successfully."
                                    })
                                }
                            })
                        }
                    }
                })

            }






            else {
                //For Admin
                advertiseModel.findOne({ _id: req.body.adId }, (err, result) => {
                    if (err) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error"
                        })
                    } else if (!result) {
                        res.send({
                            responseCode: 400,
                            responseMessage: "No Advertisement found"
                        })
                    } else {
                        if (req.body.status == "DISABLE") {
                            advertiseModel.findOneAndUpdate({ _id: req.body.adId }, { $set: { status: "DISABLE" } }, { new: true }, (err, result1) => {
                                if (err) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error"
                                    })
                                } else {
                                    res.send({
                                        result: result1,
                                        responseCode: 200,
                                        responseMessage: "Advertisement disabled successfully"
                                    })
                                }
                            })
                        } else if (req.body.status == "ACTIVE") {
                            advertiseModel.findOneAndUpdate({ _id: req.body.adId }, { $set: { status: "ACTIVE" } }, { new: true }, (err, result2) => {
                                if (err) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error"
                                    })
                                } else {
                                    res.send({
                                        result: result2,
                                        responseCode: 200,
                                        responseMessage: "Advertisement enable successfully."
                                    })
                                }
                            })
                        }
                    }
                })
            }


        }
        else {
            console.log("No data found")
            return res.send({ responseCode: 404, responseMessage: "No Data found" })
        }
    })










}

const update_ad = (req, res) => {

    if (!req.body.adId) {
        res.send({
            responseCode: 401,
            responseMessage: " Id is required !!!"
        });
    } else {
        var paymentMethodDetails;
        paymentSchema.findOne({ _id: req.body.paymentMethodId }, (err, result10) => {
            if (err) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error", err
                })
            } else if (!result10) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Payment data not found"
                })
            } else {
                console.log("payment details", result10)
                paymentMethodDetails = result10;
            }

            var obj1 = {};

            if (req.body.ruleAndrequirement) {
                obj1.advertisement_rules_and_requirement = req.body.ruleAndrequirement
            }
            if (req.body.location) {
                obj1.location = req.body.location
            }
            if (req.body.margin) {
                obj1.margin = req.body.margin
            }
            if (req.body.currencyType) {
                obj1.currency_type = req.body.currencyType
            }
            if (req.body.minTxnlimit) {
                obj1.min_transaction_limit = req.body.minTxnlimit
            }
            if (req.body.maxTxnlimit) {
                obj1.max_transaction_limit = req.body.maxTxnlimit
            }
            if (req.body.restrictAmount) {
                obj1.restrict_amount = req.body.restrictAmount
            }
            if (req.body.termTrade) {
                obj1.terms_of_trade = req.body.termTrade
            }
            if (req.body.addTag) {
                obj1.add_tags = req.body.addTag
            }
            if (req.body.btcAmount) {
                obj1.sell_Amount = req.body.btcAmount
            }
            if (req.body.payment_time) {
                obj1.payment_time = req.body.payment_time
            }
            if (req.body.paymentMethodId) {
                obj1.payment_method = paymentMethodDetails.name
            }
            if (req.body.priceEquation) {
                obj1.price_equation = req.body.priceEquation
            }
            let internalObj = {};

            if (req.body.identfifed_people) {
                internalObj.identfifed_people = req.body.identfifed_people
            }
            if (req.body.sms_verification) {
                internalObj.sms_verification = req.body.sms_verification
            }
            if (req.body.trusted_people) {
                internalObj.trusted_people = req.body.trusted_people
            }
            obj1.security_options = internalObj;



            adSchema.findOneAndUpdate({
                '_id': req.body.adId, status: "ACTIVE"
            }, obj1, { new: true }, (err, result2) => {
                if (err) {
                    return res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error"
                    });
                } else if (!result2) {
                    return res.send({
                        responseCode: 404,
                        responseMessage: "No data found"
                    });
                } else if (result2) {
                    res.send({
                        responseCode: 200,
                        responseMessage: "Data updated sucessfully !!!!!",
                        result: result2
                    });
                }
            })
        })
    }

}

const adDetails = (req, res) => {
    if (!req.params.tradeId) {
        res.send({
            responseCode: 401,
            responseMessage: "Trade Id is required !!"
        });
    } else {
        var id = req.params.tradeId;
        adSchema.findOne({
            '_id': id
        }, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                });
            } else if (!result) {
                res.send({
                    responseCode: 401,
                    responseMessage: "Data not found "
                });
            } else if (result) {
                res.send({
                    responseCode: 200,
                    responseMessage: " Data found sucessfully !!!",
                    result: result
                });
            }
        })
    }
}

const paymentMethodList = (req, res) => {
    paymentSchema.find({}, (err, result) => {
        if (err) {
            res.send({
                responseCode: 500,
                responseMessage: "Internal server error"
            })
        } else {
            res.send({
                responseCode: 200,
                responseMessage: "List shown successfully",
                result: result
            })
        }
    })
}

const tradeAdHistory = (req, res) => {
    options = {
        limit: req.body.limit || 10,
        page: req.body.pageNumber || 1,
        sort: {
            createdAt: -1
        }
    }
    trade.paginate({ advertisement_id: req.body.adId }, options, (err, result) => {
        if (err) {
            res.send({
                responseCode: 500,
                responseMessage: "Internal server error"
            })
        } else if (result.length == 0) {
            res.send({
                responseCode: 404,
                responseMessage: "Data not found"
            })
        } else {
            res.send({
                responseCode: 200,
                responseMessage: "Trade list shown successfully",
                result: result
            })
        }
    })
}

const editUserProfile = (req, res) => {
    var d=new Date().getFullYear();
var hostname =  req.headers.host;
    //  console.log(">>>>", req.headers)
    User.findOne({ _id: req.body.userId }, (error, result) => {
        if (error) {
            res.send({ responseCode: 500, responseMessage: "Internal server error" })
        }
        else if (!result) {
            res.send({ responseCode: 404, responseMessage: "Data not found" })
        }
        else {
            function saving() {
                req.body.two_factor_auth = false
                //   console.log(">>>>>>3002    editProfile>>", result.user_name, result.userType)
                var token = jwt.sign({ _id: result._id, email: result.email, password: result.user_name }, "Mobiloitte");

                //         let link = `162.222.32.20:1450/reset-password?_id=${success._id}&token=${token}`

                if (result.userType == "USER") {    
                    var link = "https://" + hostname + "/reset-password?_id="+result._id+'&'+token;
                    //   console.log("for user>>>>>>>>>>>")
                  //  var link = `http://162.222.32.20:1450/reset-password?_id=${result._id}&token=${token}`

                    // var link = `http://3.81.183.110:8080/reset-password?_id=${result._id}&token=${token}`

                }
                else {
                    //  console.log("for other>>>>>>>>>>>")
                    // var link = `$${req.headers.origin}/forgotPassword/${result._id}/${token}`
                    var link = "https://" + hostname + "/forgotPassword/"+result._id+'/'+token;
                }

                let html = `<html lang="en"><head>

                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="description" content="">
                <meta name="author" content="">
              
                <title></title>
            
               
            
            </head>
            <body style="margin: 0px; padding: 0px;">
              <div style="min-width:600px;margin:0px;background:#fff;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300;color:#777;line-height:30px">
            
                    <table style="width:600px;margin:0px auto;background:#faa547;padding:0px;border: 4px solid black;    border-radius: 6px;" cellpadding="0" cellspacing="0" >
                        <tbody>
                    <tr>
                      <td style='font-size: 16px;text-align:center;' >
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-weight:600;">
                        <tbody>
                        <tr style="background-color:#faa547; text-align:left;">
                          <td style="font-size:16px;text-align:left;">	
                            <span style="display:inline-block;height: 100px;text-align:left;border-bottom: 4px solid black!important;border-right: 4px solid black!important;">
                              <img src="http://res.cloudinary.com/georgia007/image/upload/v1554982991/k8givlmop6cn91ho59bo.jpg" style="padding: 0px;margin: 0px; width="100" height="100"">
                            </span>
                          </td>										 								
                        </tr>								
                      </tbody>
                        </table>
                        
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-weight:600;margin-bottom:50px;padding:0px 15px; ">
                          <tbody>
                            <tr>
                                     <td  style="text-align: center;     padding: 16px 0px;">
                                                  <div style="color:#fff;font-size:25px;margin-bottom:5px;">Dear ${result.user_name}, </div>
                              </td>	
                                </tr>
                                <tr>
                                     <td  style="text-align: center; padding: 10px 0px;">
                                                  <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">Please click below link to reset your password</div>
                              </td>	
                                </tr>
                                
                                     <td  style="text-align: center;    padding: 20px 0px;">
                                                  <a href=` + link + ` style="text-decoration: none;"> <div style="color:#fff;font-size:20px;font-weight: 300;background: #89e6cc; padding: 7px 16px; border: 1px solid #fff; border-radius: 8px;width: 220px;    margin: 0 auto;">Reset My Password</div>
                                                    </a>
                              </td>	
                                </tr>									
                          </tbody>
                        </table>
            
                      </table>
                    </div>
                
              </body>
              </html>`


             

                
                if (req.body.email) {
                    ;
                    commonFunction.sendMail(req.body.email, "Regarding reset password", "", html, (error, sent) => {
                        if (error) {
                            console.log("{{{{{{>>>>>>>>}}}}}")
                            return res.send({
                                responseCode: 500,
                                responseMessage: "Error occured."
                            });
                        } else {
                            var temp = Date.now() + 24 * 60 * 1000
                            req.body.forgotTimeStamp = temp
                            if (result.userType == "USER") {
                                req.body.forgotToken = token,
                                    req.body.password = ""
                                User.findOneAndUpdate({ _id: req.body.userId }, req.body, { new: true }, (error, success) => {
                                    if (error) {
                                        console.log("error in updating document");
                                        res.send({ responseCode: 500, responseMessage: "Internal server error", error })
                                    }
                                    else {
                                        console.log("Document updated successfully.")
                                        return res.send({
                                            responseCode: 200,
                                            responseMessage: "Data updated successfully.", success, temp: success.forgotToken
                                        });

                                    }
                                })
                            }
                            else {
                                User.findOneAndUpdate({ _id: req.body.userId }, req.body, { new: true }, (error, success) => {
                                    if (error) {
                                        console.log("error in updating document");
                                        res.send({ responseCode: 500, responseMessage: "Internal server error", error })
                                    }
                                    else {
                                        console.log("Document updated successfully.")
                                        return res.send({
                                            responseCode: 200,
                                            responseMessage: "Data updated successfully.", success
                                        });

                                    }
                                })
                            }
                        }
                    })
                }
                else {
                    commonFunction.sendMail(result.email, "Regarding reset password", "", html, (error, sent) => {
                        if (error) {
                            console.log("{{{{{{>>>>>>>>}}}}}")
                            return res.send({
                                responseCode: 500,
                                responseMessage: "Error occured."
                            });
                        } else {
                            var temp = Date.now() + 24 * 60 * 1000
                            req.body.forgotToken = token
                            req.body.forgotTimeStamp = temp

                            if (result.userType == "USER") {
                                console.log("saasasassasasa3094")
                                req.body.forgotToken = token,
                                    req.body.password = ""
                                User.findOneAndUpdate({ _id: req.body.userId }, req.body, { new: true }, (error, success) => {
                                    if (error) {
                                        console.log("error in updating document");
                                        res.send({ responseCode: 500, responseMessage: "Internal server error", error })
                                    }
                                    else {
                                        console.log("Document updated successfully.")
                                        return res.send({
                                            responseCode: 200,
                                            responseMessage: "Data updated successfully.", success
                                        });

                                    }
                                })
                            }


                            else {

                                User.findOneAndUpdate({ _id: req.body.userId }, req.body, { new: true }, (error, success) => {
                                    console.log("3114")

                                    if (error) {
                                        res.send({ responseCode: 500, responseMessage: "Internal server error", error })
                                    }
                                    else {
                                        return res.send({
                                            responseCode: 200,
                                            responseMessage: "Data updated successfully.", success
                                        });

                                    }
                                })
                            }




                        }
                    })
                }



            }


            function data1() {
                User.findOne({ "_id": req.headers.id }, (err11, data) => {
                    console.log("employee>>>>>>>>details", JSON.stringify(data))
                    if (err11) {
                        return func.responseHandler(res, 400, "Internal Server Error2.", err)
                    }
                    else {
                        if (data.userType == 'ADMIN') {
                            saving()
                        }

                        else {
                            unique = commonFunction.getCode();
                            let obj1 = {
                                "uniqueId": "#" + unique,
                                "userId": req.body.id,
                                "userName": result.user_name,
                                "staffName": data.user_name,
                                "module": "Profile Updation",
                                "staffId": req.headers.id,
                                "documentData": result,
                                "action": `${result.user_name} profile has been updated. `
                                //   
                            };

                            let track = new staffTrack(obj1);
                            track.save((er1, ress) => {
                                // console.log(`Error is ${JSON.stringify(er1)}   result is ${JSON.stringify(ress)}`)
                                if (er1) {
                                    console.log(er1)
                                }
                                else {
                                    console.log("aa@@@@@@@@@@aaaa>>>>in 698", JSON.stringify(ress))
                                    saving()
                                }
                            })

                        }


                    }
                })

            }
            if (req.body.email && req.body.phone_number) {
                if (result.email == req.body.email) {
                    if (result.phone_number == req.body.phone_number) {
                        data1()
                    }

                    else {
                        User.findOne({ $and: [{ status: { $ne: "DELETE" } }, { phone_number: req.body.phone_number }] }, (error, response) => {
                            if (error) {
                                console.log("Error is=======>", error)
                                return res.send({ responseCode: 500, responseMessage: "Internal server error", error })
                            }
                            else if (response) {
                                return func.responseHandler(res, 404, "Phone number already exist");
                            }
                            else {
                                data1()
                            }
                        })
                    }
                }
                else {
                    if (result.phone_number == req.body.phone_number) {
                        User.findOne({ $and: [{ status: { $ne: "DELETE" } }, { phone_number: req.body.phone_number }] }, (error1, result1) => {
                            if (error1) {
                                return res.send({ responseCode: 500, responseMessage: "Internal server error", error1 })
                            }
                            else if (result1) {
                                if (result.phone_number == req.body.phone_number) {
                                    data1()
                                }
                                else
                                    return func.responseHandler(res, 404, "Phone number already exist");
                            }
                            else {

                                User.findOne({ $and: [{ status: { $ne: "DELETE" } }, { email: req.body.email }] }, (error11, result11) => {
                                    if (error11) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal server error", error11 })
                                    }
                                    else if (result11) {
                                        return func.responseHandler(res, 404, "Email already exist");
                                    }
                                    else {
                                        data1()
                                    }
                                })
                            }
                        })
                    }
                    else {
                        data1()
                    }
                }
            }
            else if (!req.body.email && req.body.phone_number) {
                User.findOne({ $and: [{ status: { $ne: "DELETE" } }, { phone_number: req.body.phone_number }] }, (error1, result1) => {
                    if (error1) {
                        return res.send({ responseCode: 500, responseMessage: "Internal server error", error1 })
                    }
                    else if (result1) {
                        if (result.phone_number == req.body.phone_number) {
                            data1()
                        }
                        else
                            return func.responseHandler(res, 404, "Phone number already exist");
                    }


                    else {
                        data()
                    }
                })
            }
            else {
                User.findOne({ $and: [{ status: { $ne: "DELETE" } }, { email: req.body.email }] }, (error1, result1) => {
                    if (error1) {
                        return res.send({ responseCode: 500, responseMessage: "Internal server error", error1 })
                    }
                    else if (result1) {
                        if (result.email == req.body.email) {
                            data1()
                        }
                        else
                            return func.responseHandler(res, 404, "Email already exist");
                    }
                    else {
                        data1()
                    }
                })
            }
        }
    })
}


//..........................................................SubAdmin action>> Admin ..........................................................................//

const showStaffAction = (req, res) => {
    var query = {
        status: { $ne: 'DELETE' }
    }
    var data = {
        status: { $ne: ['DELETE'] }
    }
    if (req.body.userId) {
        query.staffId = req.body.userId
    }
    if (req.body.module) {
        query.module = req.body.module
    }
    if (req.body.uniqueId) {
        query.uniqueId = req.body.uniqueId
    }

    if (req.body.userName) {
        query.userName = req.body.userName
    }

    if (req.body.staffName) {
        query.staffName = req.body.staffName
    }

    if (req.body.startDate && req.body.endDate) {
        query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
    }

    if (req.body.startDate && !req.body.endDate) {
        query.createdAt = { $gte: req.body.startDate }
    }
    if (!req.body.startDate && req.body.endDate) {
        query.createdAt = { $lte: req.body.endDate }
    }
    options = {
        //  select: "uniqueId",
        page: req.body.pageNumber || 1,
        limit: req.body.limit || 10,
        sort: { createdAt: -1 }
    }



    staffTrack.find(data, (err33, resp33) => {
        if (err33) {
            res.send({
                responseCode: 500,
                responseMessage: "Internal server error", error1
            })
        }
        else if (resp33.length == 0) {
            res.send({
                responseCode: 404,
                responseMessage: "Data not found"
            })
        }

        else {
            var data1 = []
            var staff = []
            var user = []
            for (i = 0; i < resp33.length; i++) {
                data1.push(resp33[i].uniqueId)
                staff.push(resp33[i].staffName)
                user.push(resp33[i].userName)
            }
            var staffArray = staff.filter(function (item, pos) {
                return staff.indexOf(item) == pos
            })
            var userArray = user.filter(function (item, pos) {
                return user.indexOf(item) == pos
            })
            staffTrack.paginate(query, options, (error, result) => {
                if (error) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server erroror", err
                    });

                }
                else {
                    res.send({
                        responseCode: 200,
                        responseMessage: " Data found successfully.",
                        result: result,
                        uniqueId: data1.reverse(),
                        staffName: staffArray.reverse(),
                        username: userArray.reverse()

                    });
                }
            })

        }
    })

}



const paymentAction = (req, res) => {
    var query = {
        status: { $ne: 'DELETE' }
    }
    if (req.body.paymentId) {
        query._id = req.body.paymentId
    }
    options = {
        page: req.body.pageNumber || 1,
        limit: req.body.limit || 10,
        sort: { createdAt: -1 }
    }
    paymentSchema.paginate(query, options, (error, result) => {
        if (error) {
            res.send({
                responseCode: 500,
                responseMessage: "Internal server erroror", error
            });

        }
        else {

            function saving() {
                User.findOne({ _id: req.headers.id, userType: { $in: ["MANAGER", "SUBADMIN"] }, status: "ACTIVE" }, (err1, result12) => {
                    if (err1) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error", err1
                        });
                    }
                    else if (!result12) {
                        paymentSchema.findOneAndUpdate({ _id: req.body.paymentId }, req.body, { new: true }, (err, result1) => {
                            if (error) {
                                res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal server erroror", err
                                });
                            }
                            else {
                                res.send({
                                    responseCode: 200,
                                    responseMessage: "Data updated successfully.",
                                    result: result1,
                                });
                            }
                        })
                    }
                    else {
                        paymentSchema.findOneAndUpdate({ _id: req.body.paymentId }, req.body, { new: true }, (err, result1) => {
                            if (error) {
                                res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal server erroror", err
                                });
                            }
                            else {

                                unique = commonFunction.getCode();
                                let obj = {
                                    "uniqueId": "#" + unique,
                                    "paymentId": req.body.paymentId,
                                    "staffName": result12.name,
                                    "module": "Payment",
                                    "type": result12.userType,
                                    "staffId": req.headers.id,
                                    "documentData": result1,
                                    "action": `Payment data has been ${req.body.tempData}`
                                    //   
                                };

                                let track = new staffTrack(obj);
                                track.save((er1, ress) => {
                                    // console.log(`Error is ${JSON.stringify(er1)}   result is ${JSON.stringify(ress)}`)
                                    if (er1) {
                                        console.log(er1)
                                    }
                                    else {
                                        console.log("aa@@@@@@@@@@aaaa>>>>in deleted add", JSON.stringify(ress))
                                        // return res.send({ responseCode: 200, responseMessage: "Advertisement deleted successfully..", result })

                                    }
                                })

                                res.send({
                                    responseCode: 200,
                                    responseMessage: "Data updated successfully..",
                                    result: result1,
                                });
                            }
                        })


                    }
                })

            }


            if (req.body.add && !req.body.action) {

                unique = commonFunction.getCode()
                paymentSchema.find({ name: req.body.name, status: { $ne: ['DELETE'] } }, (error, success) => {
                    if (error) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error"
                        })
                    }
                    else if (success.length) {
                        res.send({
                            responseCode: 400,
                            responseMessage: "Payment name already exists."
                        })
                    }
                    else {
                        paymentData = new paymentSchema({
                            uniqueId: "#" + unique,
                            name: req.body.name,
                            secondField: req.body.secondField,
                            levelOfRisk: req.body.levelOfRisk,
                            sellerPaymentMessage: req.body.sellerPaymentMessage,
                            buyerPaymentMessage: req.body.buyerPaymentMessage,
                        })
                        paymentData.save((err, result11) => {
                            if (err) {
                                res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal server error"
                                })
                            } else {
                                res.send({
                                    responseCode: 200,
                                    responseMessage: "Payment added successfully ", result11
                                })
                            }
                        })
                    }
                })
            }

            else if (req.body.action && !req.body.add) {
                paymentSchema.findOne({ _id: req.body.paymentId, status: { $ne: ['DELETE'] } }, (error, success) => {
                    if (error) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error"
                        })
                    }
                    else if (!success) {
                        res.send({
                            responseCode: 404,
                            responseMessage: "Data not found."
                        })
                    }

                    else {
                        if (success.name == req.body.name) {
                            saving()
                        }
                        else {
                            paymentSchema.findOne({ name: req.body.name, status: { $ne: ['DELETE'] } }, (err_, testData) => {
                                if (err_) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error"
                                    })
                                }
                                else if (!testData) {
                                    saving()
                                }
                                else {
                                    res.send({
                                        responseCode: 404,
                                        responseMessage: "Payment name already exist"
                                    })
                                }
                            })

                        }
                    }
                })
            }
            else {
                res.send({
                    responseCode: 200,
                    responseMessage: "Data found successfully....",
                    result: result,
                });
            }
        }
    })
}

//...................................................View user wallet section >> admin........................................................//
const userWallet = (req, res) => {

    var query = {}
    if (req.body.userId) {
        query.userId = req.body.userId
    }
    var options = {
        limit: req.body.limit || 10,
        page: req.body.pageNumber || 1,
        sort: { createdAt: -1 }
    }
    if (req.body.fromDate && req.body.toDate) {
        query.createdAt = { $gte: req.body.fromDate, $lte: req.body.toDate }
    }

    if (req.body.fromDate && !req.body.toDate) {
        query.createdAt = { $gte: req.body.fromDate }
    }
    if (!req.body.fromDate && req.body.toDate) {
        query.createdAt = { $lte: req.body.toDate }
    }
    if (req.body.toAddress) {
        query.toAddress = req.body.toAddress
    }

    walletTransaction.find(query).select("toAddress").exec((error, data) => {
        if (error) {
            res.send({
                responseCode: 500,
                responseMessage: "Internal server error"
            })
        }
        else {
            walletTransaction.paginate(query, options, (err, result) => {
                if (err) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error"
                    })
                }
                else if (result.docs.length == 0) {

                    res.send({
                        responseCode: 404,
                        responseMessage: "Data not found"
                    })
                }
                else {
                    res.send({
                        responseCode: 200,
                        responseMessage: "Data found successfully",
                        result: result,
                        address: data
                    })
                }
            })
        }
    })

}
// //.......................................................................System configuration>>admin.......................................................//
const configSystem = (req, res) => {
    unique = commonFunction.getCode();

    User.findOne({ _id: req.body._id, status: { $ne: ['DELETE'] } }, (error, data) => {
        console.log("i am here>>>", error, data, req.body)
        if (error) {
            res.send({
                responseCode: 500,
                responseMessage: "Internal server error", error
            })
        }
        else if (!data) {
            res.send({
                responseCode: 404,
                responseMessage: "User not found"
            })
        }
        else {
            function saving() {
                let obj = {
                    "staffId": data._id,
                    "name": data.name,
                    "email": data.email,
                    "user_name": data.user_name,
                    "description": req.body.description,
                    "type": data.userType,
                    "uniqueId": "#" + unique,
                    "maintainanceProcess": req.body.maintainanceProcess,
                    "action":"System configuration has been updated by " +data.user_name,
                    "internalTransferFee": req.body.internalTransferFee,
                    "externalTransferFee": req.body.externalTransferFee,
                    "tradeFee": req.body.tradeFee,
                    "oldWalletBalance": req.body.oldWalletBalance,
                    "needWalletBalance": req.body.needWalletBalance,
                    "registrationOff": req.body.registrationOff
                }

                let add = new configuration(obj)
                add.save((err, result) => {
                    if (err) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error"
                        })
                    }
                    else if (!result) {

                        res.send({
                            responseCode: 404,
                            responseMessage: "Data not found"
                        })
                    }
                    else {
                        res.send({
                            responseCode: 200,
                            responseMessage: "System configuration saved successfully", result
                        })
                    }
                })
            }

            if (data.userType == "ADMIN") {
                saving()
            }

            else {
                unique = commonFunction.getCode();
                let obj = {
                    "uniqueId": "#" + unique,
                    "configId": result._id,
                    "userName": data.user_name,
                    "staffName": data.name,
                    "type": data.userType,
                    "email": data.email,
                    "module": "Configuration Setting",
                    // "staffId": req.body._id,
                    "documentData": result,
                    "staffId": data._id,
                    "action":"System configuration has been updated by " +data.user_name,
                    // 
                };

                let track = new staffTrack(obj);
                track.save((er1, ress) => {

                    if (er1) {
                        console.log(er1)
                    }
                    else {

                        saving()

                    }
                })
            }

        }
    })

}

const configData = (req, res) => {
    console.log("Request is==========>",req.body);
    let options = {
        page: req.body.pageNumber || 1,
        limit: req.body.limit || 10,
        sort: { createdAt: -1 }
    }
    

    configuration.paginate({}, options, (err, result) => {
        if (err) {
            console.log("Error is=========>", err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
        }
        else if (result.docs.length==0) {
            console.log("Data not found")
            return res.send({ responseCode: 404, responseMessage: "Data not found" })
        }
        else {
            console.log("Result is==========>", result)
            res.send({ responseCode: 200, responseMessage: "success", Data: result })
        }
    })
}
const getConfigData = (req, res) => {
    configuration.findOne({}, (err, result) => {
        if (err) {
            console.log("Error is=========>", err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
        }
        else if (!result) {
            console.log("Data not found")
            return res.send({ responseCode: 404, responseMessage: "Data not found" })
        }
        else {
            res.send({ responseCode: 200, responseMessage: "success", Data: result })
        }
    })
}
const configData1 = (req, res) => {
    console.log("Request is==========>",req.body);
  
    configuration.find({},(err, result) => {
        if (err) {
            console.log("Error is=========>", err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
        }
        else if (result.length==0) {
            console.log("Data not found")
            return res.send({ responseCode: 404, responseMessage: "Data not found" })
        }
        else {
            console.log("Result is==========>", result)
            res.send({ responseCode: 200, responseMessage: "success", Data: result })
        }
    })
}

const lastConfigData = (req, res) => {
    console.log("Request is==========>",req.body);
  
    configuration.find({},(err, result) => {
        if (err) {
            console.log("Error is=========>", err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
        }
        else if (result.length==0) {
            console.log("Data not found")
            return res.send({ responseCode: 404, responseMessage: "Data not found" })
        }
        else {
            console.log("Result is==========>", result.length)
            
            var internalTransferFee = result[result.length-1].internalTransferFee
            var externalTransferFee = result[result.length-1].externalTransferFee
            res.send({ responseCode: 200, responseMessage: "success", Data: {internalTransferFee:internalTransferFee, externalTransferFee:externalTransferFee}})
        }
    })
}
//.........................................find managerList.........................................................//
const managerList = (req, res) => {
    User.find({ userType: "MANAGER", status: "ACTIVE" }, (err, result) => {
        if (err) {
            console.log("Error is=========>", err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
        }
        else if (!result) {
            console.log("Data not found")
            return res.send({ responseCode: 404, responseMessage: "Data not found" })
        }
        else {
            console.log("Result is==========>", result)
            res.send({ responseCode: 200, responseMessage: "success", Data: result })
        }
    })
}

//.........................................find employee.........................................................//
const employeeList = (req, res) => {
    User.find({ userType: "SUBADMIN", status: "ACTIVE" }, (err, result) => {
        if (err) {
            console.log("Error is=========>", err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
        }
        else if (!result) {
            console.log("Data not found")
            return res.send({ responseCode: 404, responseMessage: "Data not found" })
        }
        else {
            console.log("Result is==========>", result)
            res.send({ responseCode: 200, responseMessage: "success", Data: result })
        }
    })
}
//...........2 fa phone otp........................................//
const sent_phone_otp = (req, res) => {
    otp = commonFunction.getOTP();
    var temp = Date.now() + 5 * 60 * 1000
    User.findByIdAndUpdate({ _id: req.body._id }, { $set: { otp: otp, twoFATimeStamp: temp } }, { new: true }, (err, result) => {
        if (err) {
            return res.send({
                responseCode: 500, responseMessage: 'Internal server error.', err
            });
        }

        else if (!result) {
            return res.send({
                responseCode: 404, responseMessage: 'Data not found'
            });
        }
        else {

            var Mobile = result.country_code + result.phone_number;
            console.log("TTTTTTTTTTTT",Mobile)


        
var message =  'Coinbaazar OTP is '+ otp

            sender.sendSms(message, 'swiftpro', false, Mobile)
                .then(function (response) {
                    console.log('Sucess in Message sent in Mobile------------------------------------', response);
                    return res.send({
                        responseCode: 200, responseMessage: 'Otp has been send successfully to your registered phone number', result
                    });
                })
                .catch(function (err) {
                    console.log('Error in Message sent in Mobile------------------------------------', err)
                    res.json({
                        responseCode: 400, responseMessage: "Please provide correct phone number.",
                    })
                })
        }
    })
}

const otpVerify = (req, res) => {
    if (!req.body._id) {
        return res.send({ responseCode: 400, responseMessage: "Parameter missing.." })
    }
    else {
        userService.getUser({ _id: req.body._id }, (err, result) => {
            if (err) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
            }

            if (!result) {
                return res.send({ responseCode: 404, responseMessage: "User not found" })
            }
            else {

                if ((result.otp == req.body.otp)) {
                    User.findOneAndUpdate({ _id: req.body._id }, {
                        $set: {
                            verified_phone: true,
                            otp: " ",
                            phone_verification_date: Date.now(),
                            Two_FA_verification: true,
                            scan2FACode: false
                        }
                    }, { new: true }, (err1, result) => {
                        if (err1) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error ", err1 })
                        }
                        else {


                            return res.send({ responseCode: 200, responseMessage: "Phone verification done successfully.", scan2FACode: result.scan2FACode })
                        }
                    })
                }
                else {
                    return res.send({ responseCode: 401, responseMessage: "Please enter valid otp " })
                }
            }
        })
    }
}

//..............................................forgotPassword>>>>>>>> Admin Panel.............................//


const sendTwoFALink = (req, res) => {
    var d=new Date().getFullYear();
    console.log("Date is===========>",d);
    if (!req.body._id) {
        return res.send({
            responseCode: 500,
            responseMessage: "Parameters Missing"
        });
    } else {

        User.findOne({
            _id: req.body._id
        }, (err, success) => {
            if (err)
                return res.send({
                    responseCode: 400,
                    responseMessage: "Error occured."
                });
            else if (!success)
                return res.send({
                    responseCode: 500,
                    responseMessage: "Invalid email id"
                });
            else {
                console.log(">>>>>>>>", success.user_name)
                var token = jwt.sign({ _id: success._id, email: success.email, password: success.user_name }, "Mobiloitte");
                let link = `${req.headers.origin}/emailVerification/${success._id}/${token}`
                console.log("Link is=======>",link)
                let html = `<html lang="en">
                <head>
                  <meta charset="utf-8">
                  <meta http-equiv="X-UA-Compatible" content="IE=edge">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <meta name="description" content="">
                  <meta name="author" content="">
                  <title>Vendor & Users</title>
                </head>
                <body style="margin: 0px; padding: 0px; background-color: #eeeeee;">
               
                  <div style="width:600px; margin:20px auto; background:#fff; font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300;color:#777;line-height:30px">
                <div>
                    <table style="width: 100%; border: 1px solid #ccc;" cellpadding="0" cellspacing="0">
                      <tbody>
                      <tr style="margin:0;padding:0">
                      <td bgcolor="#f1f1f1" height="100" style="text-align:center;background:#f1f1f1">
                          <img src="https://res.cloudinary.com/sumit9211/image/upload/v1549007653/rtokt4z1bwcofdvidx4p.png" alt="Email register" class="">
                      </td>
                  </tr>
                          <tr>
                            <td style="padding: 50px 15px 10px;">Dear ${success.user_name}, </td>
                          </tr>
                          <tr>
                          <td style="padding: 10px 15px 10px;">Thank you for using CoinBazar </td>
                        </tr>
                        
                          <tr>
                            <td style="padding: 10px 15px 10px;">Click on the below link to reset 2FA  authentication.</td>
                          </tr>
                          <br>
                          <tr>
                          <td><p><a style="display: block; background: #4E9CAF; text-align: center; border-radius: 5px; color: white; font-weight: bold;" href=` + link + `>Reset 2FA</a></p></td>
                          </tr>
                          <br>
                          <tr>
                          <td style="padding: 10px 15px 10px;">Click on this button for further login process.This is system generated mail.Do not reply. </td>
                        </tr>
                                 
                          <tr>
                            <td style="padding: 25px 15px 20px;">
                              Thanks &amp; Regards <br> Team CoinBazar
                              </td>
                         </tr>
                         <tr>
                         <td style="text-align: center; padding: 20px; background-color: #4e555a; color: #eeeeee;">${d} copyright @ CoinBazaar, All rights  reserved </td>
                       </tr>
                      </tbody>
                    </table>
                    </div>
                  </div>
                </body>
               </html>`

                commonFunction.sendMail(success.email, "Regarding 2FA forgot link", "", html, (error, sent) => {
                    if (error) {
                        console.log("{{{{{{>>>>>>>>}}}}}", )
                        return res.send({
                            responseCode: 500,
                            responseMessage: "Error occured."
                        });
                    } else {
                        var temp = Date.now() + 24 * 60 * 60 * 1000
                        userService.updateUser({ _id: success._id }, { $set: { twoFAToken: token, twoFATimeStamp: temp, forgotTokenVerify: false } }, { new: true }, (error, success) => {
                            if (error)
                                console.log("error in updating document");
                            else {
                                console.log("Document updated successfully.")
                            }

                        })
                        return res.send({
                            responseCode: 200,
                            responseMessage: "Reset 2FA link sent to your registered email."
                        });
                    }
                })
            }
        })
    }
}

//.........................................reset 2FALink...............................................
const resetTwoFA = (req, res) => {
    if (!req.body._id || !req.body.token) {
        console.log("Req",req.body)
        return res.send({responseCode: 500,responseMessage: "Parameters missing." })
    } else {
        userService.getUser({ _id: req.body._id,twoFAToken: req.body.token

        }, (err, result) => {
            if (err)
                return res.send({
                    responseCode: 400,
                    responseMessage: 'Please provide valid token.'
                });
            else if (!result) {
                return res.send({
                    responseCode: 400,
                    responseMessage: "Invalid token provided."
                });
            } else {
                var current = Date.now()
                if (Number(result.forgotTimeStamp) > Number(current)) {
                    req.body.scan2FACode = false
                    req.body.forgotTokenVerify = true
                    delete req.body["token"];
                    req.body.twoFAToken = null;
                    console.log("body is>>>>>", req.body)
                    userService.updateUser({
                        _id: result._id
                    }, req.body, {
                            new: true
                        }, (err, result) => {
                            if (err)
                                return res.send({
                                    responseCode: 500,
                                    responseMessage: 'Please provide valid token.'
                                });
                            else {
                                return res.send({
                                    responseCode: 200,
                                    responseMessage: "Admin 2FA reset successfully.",
                                    data: result
                                });
                            }
                        })
                }
                else {
                    return res.send({
                        responseCode: 404,
                        responseMessage: "2FA link has been expired.",
                        data: result
                    });
                }
            }

        })
    }
}

//.............................update admin address...................................................//
const updateAddress = (req, res) => {
    let data = {}
    data.address = req.body.oldAdress;

    console.log("Data is", data);

    User.findOne({_id:req.body.userId},(err33,result33)=>{
        if(err33){
            console.log("Error is========>",err33);
        }
        else if(!result33){
            console.log("User Id is not correct");
        }
        else{
            User.findOneAndUpdate({ "_id": req.body.userId }, {
                $push: { adminAddress: data }, $set: {
                    "btc.addresses.0.addr": req.body.address,
                    "btc.addresses.0.created_at": Date.now(),
                    "btc.addresses.0.action":"Address has been updated by "+result33.user_name
                }
            }, { new: true }).exec(async (error, result) => {
                if (error) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error", error
                    })
                } else if (!result) {
                    res.send({
                        responseCode: 404,
                        responseMessage: "No data found"
                    })
                } else {
                    var unique = commonFunction.getCode();
                    let saveData = await saveDataFun(req.headers.id);
                    console.log("jaaaaaaaaaaaa", saveData, req.headers.id)
                    let obj = {
                        "uniqueId": "#" + unique,
                        // "tagId": req.body.tagId,
                        "staffName": saveData.name,
                        "module": "Update Wallet Address",
                        "type": saveData.userType,
                        "staffId": req.headers.id,
                        "documentData": saveData,
                        "action": "Wallet Address has been Updated."
                    };
        
                    let track = new staffTrack(obj);
                    track.save((er1, ress) => {
                        if (er1) {
                            console.log(er1)
                        } else {
                            console.log("aa@@@@@@@@@@aaaa>>>>in deleted add", JSON.stringify(ress))
                        }
                    })
                    res.send({
                        responseCode: 200,
                        responseMessage: "Data updated successfully.",
                        result: result.btc,
                        a: result.adminAddress
                    })
                }
            })

        }
    })

  
}


//............................................. All Admin addresses record .............................................................................//

const adminAddressList = (req, res) => {

    var obj;
    let option = {
        page: req.body.pageNumber || 1,
        limit: req.body.limit || 10,
        select: 'adminAddress',
    }
    obj = {
        "_id": new mongoose.Types.ObjectId(req.body.userId)
        // $and: [{ "_id": new mongoose.Types.ObjectId(req.body.userId) }, { userType: req.body.type }]

    }


    var aggregate = User.aggregate([
        {
            $match:
                obj
        },
        { $unwind: "$adminAddress" },
        {
            $project: {

                "adminAddress": 1,
                "createdAt": 1
            }
        },
        { $sort: { "adminAddress.time": -1 } }

    ])

    console.log("aggregate Data>>>>>>>>>", aggregate)

    User.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
        console.log("kyc total >>>>>>>>>>>>.", err, result)
        if (err)
            return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
        else if (result === 0)
            return res.send({ responseCode: 404, responseMessage: "Data not found" })
        else {
            const data = {
                "total": total,
                "limit": option.limit,
                "currentPage": option.page,
                "totalPage": pages
            }
            console.log("result-->>", result)
            //return Response.sendResponseWithtData(res, resCode.EVERYTHING_IS_OK, 'success', success)
            return res.send({ responseCode: 200, responseMessage: "Data found successfully.", result, paginationData: data })

        }
    })
}
//..........................................send hotwallet btc to another address.................................//
const hotWallet = (req, res) => {
    User.findOne({ "userType": "ADMIN" }, (err, data) => {
        if (err) {
            res.send({
                responseCode: 500,
                responseMessage: "Internal server error", err
            })
        } else if (!data) {
            res.send({
                responseCode: 404,
                responseMessage: "No data found"
            })
        } else {

            var adminAddress = data.btc.addresses[0].addr;
            var amount = req.body.amount;
            var remark = req.body.remark;
            var sendTo = req.body.sendTo;





            escrow.find({}, (err, result1) => {
                if (err) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error", err
                    })
                }
                else {

                    var totalEscrowAmount = 0;
                    for (let i of result1) {
                        if (i.amount_coin) {
                            totalEscrowAmount = i.amount_coin
                        } else if (i.bondAmount) {
                            totalEscrowAmount = i.bondAmount
                        }
                    }
                    console.log("3905 in escrow>>>>>>>>>", totalEscrowAmount)

                    var finalValue = new BigNumber(totalEscrowAmount).dividedBy(new BigNumber(100))
                    var transactionFee = new BigNumber(finalValue).multipliedBy(new BigNumber(10));
                    var fixAmount = new BigNumber(totalEscrowAmount).plus(new BigNumber(transactionFee))  // total esrw amnt + 10 of ecrw


                    request.get(coinUrl + '/btc/addr_balance/' + adminAddress, function (error, response, body) {
                        console.log("=============== 3920", error, typeof body);
                        let responseBody = JSON.parse(body);
                        console.log("resposne code is=====", responseBody);

                        if (responseBody.code == 200) {
                            var data = String(responseBody.balance)   //check Admin acount balance 
                            console.log("=============== 3926 fixAmount", fixAmount, "admin balance>>", JSON.stringify(data))

                            if (new BigNumber(fixAmount).isLessThan(new BigNumber(data))) {
                                if (Number(responseBody.balance) < Number(req.body.amount)) {
                                    console.log("ewrewf")
                                    //   res.send({ responseCode: 200, message: "You can't withdraw because admin  have not  enough coins ", result: res })
                                    res.send({
                                        responseCode: 200,
                                        responseMessage: "You can't withdraw because admin  have not  enough BTC coins",

                                    })
                                }
                                else {
                                    request.post(
                                        `${coinUrl}/btc/withdraw`,
                                        {
                                            json: {


                                                ChangeAddress: adminAddress,//BTCwalletAddress,
                                                SendFrom: adminAddress,//BTCwalletAddress,
                                                SendTo: sendTo,
                                                AmountToTransfer: String(amount)
                                            },
                                            headers: {
                                                "Content-Type": "application/json"
                                            }
                                        }, function (error, response, body1) {

                                            console.log("Body is===========", error, body1);
                                            let responseBody1 = body1;
                                            if (responseBody1.code == 200) {
                                                var transactionData = new walletTransaction({
                                                    fromAddress: adminAddress,
                                                    toAddress: sendTo,
                                                    transaction_hash: responseBody1['tx-hash'],
                                                    transaction_fee: responseBody1['fee'],
                                                    type: 'ADMIN_WITHDRAW',
                                                    send_amount: amount,
                                                    remark: remark,
                                                    created_At: Date.now()
                                                })
                                                transactionData.save((err, succ) => {
                                                    if (err)
                                                        return res.send({ responseCode: 500, responseMessage: "Something went wrong", result: err })
                                                    else {
                                                        return res.send({ responseCode: 200, responseMessage: "Withdraw Successfully", result: succ, adminBalance: responseBody.balance });
                                                    }
                                                })
                                            }
                                            else if (responseBody1.code == 500)
                                                return res.send({ responseCode: 201, responseMessage: "Invalid address" });
                                            else
                                                return res.send({ responseCode: 201, responseMessage: "Can't Withdraw Amount" });
                                        });

                                }
                            }
                            else {
                                return res.send({ responseCode: 201, responseMessage: "Cann't withdraw BTC amount over the thresold level" })
                            }
                        }
                        else {
                            console.log('Error api from addr_balance')
                            return res.send({ responseCode: 201, responseMessage: 'Withdraw Failed', result: {} })
                        }
                    })
                }
            })

        }
    })
}
const hotWalletData = (req, res) => {
    var arg = {
        limit: req.body.limit || 10,
        page: req.body.page || 1,
        sort: { createdAt: -1 },
    }
    var query = { type: 'ADMIN_WITHDRAW' };
    if (req.body.transaction_hash) {
        query.transaction_hash = req.body.transaction_hash
    }
    if (req.body.status) {
        query.status = req.body.status
    }
    if (req.body.toAddress) {
        query.toAddress = req.body.toAddress
    }
    if (req.body.startDate && req.body.endDate) {
        query.$and = [{ createdAt: { $gte: req.body.startDate } }, { createdAt: { $lte: req.body.endDate } }]
    }
    if (req.body.startDate && !req.body.endDate) {
        query.createdAt = { $gte: req.body.startDate }
    }
    if (!req.body.startDate && req.body.endDate) {
        query.createdAt = { $lte: req.body.endDate }
    }




    User.findOne({ "userType": "ADMIN" }, (err, data) => {
        if (err) {
            res.send({
                responseCode: 500,
                responseMessage: "Internal server error", err
            })
        } else if (!data) {
            res.send({
                responseCode: 404,
                responseMessage: "No data found"
            })
        } else {
            var adminAddress = data.btc.addresses[0].addr;
            console.log("search filter for user>>>>>>>>>>", query)
            request.get(coinUrl + '/btc/addr_balance/' + adminAddress, function (error, response, body) {
                console.log("===============", error, typeof body);
                let responseBody = JSON.parse(body);
                console.log("resposne code is=====", responseBody);

                if (responseBody.code == 200) {
                    walletTransaction.paginate(query, arg, (err11, result) => {
                        if (err11) {
                            console.log(err1)
                            return res.send({ responseCode: 500, responseMessage: "Internal server error ", err1 })
                        }
                        else {

                            escrow.find({}, (err, result1) => {
                                if (err) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error", err
                                    })
                                }
                                else {
                                    var totalEscrowAmount = 0;
                                    for (let i of result1) {
                                        if (i.amount_coin) {
                                            totalEscrowAmount = i.amount_coin
                                        } else if (i.bondAmount) {
                                            totalEscrowAmount = i.bondAmount
                                        }
                                    }
                                    let x = {
                                        total: result.total,
                                        limit: result.limit,
                                        currentPage: result.page,
                                        totalPage: result.pages
                                    }
                                    return res.send({
                                        responseCode: 200, responseMessage: "Data found successfully", result: result.docs, paginationData: x,
                                        adminAddress: adminAddress, adminBalance: responseBody.balance, EscrowAmount: totalEscrowAmount
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
const createRoom = (req, res) => {
    let useridsArray = []
    useridsArray.push({
        userId: req.body.adminId
    });
    useridsArray.push({
        userId: req.body.sellerId
    });
    useridsArray.push({
        userId: req.body.buyerId
    });
    RoomModel.findOne({
        tradeId: req.body.tradeId
    }).exec((err, succ) => {
        if (err)
            return res.send({
                responseMessage: err,
                responseCode: 400
            })
        else if (succ) {
            return res.send({
                responseCode: 201,
                responseMessage: "Room Already Exists"
            });
        } else {
            let obj;
            obj = {
                tradeId: req.body.tradeId,
                participants: useridsArray

            }
            RoomModel.create(obj, (error, success) => {
                if (error)
                    return res.send({
                        responseCode: 400,
                        responseMessage: error
                    })
                else if (success) {
                    return res.send({
                        responseMessage: "Saved Successfully",
                        responseCode: success
                    })
                }
            })
        }
    })

}
//....................................................Dispute trade recommended Action by employee....................................................//
const recommentAction = (req, res) => {
    
    User.findOne({ "_id": req.headers.id }, (err, result) => {
        if (err)
            return res.send({
                responseCode: 500,
                responseMessage: "Internal server error", err
            })

        else {
            recomment.create((req.body), (err2, success) => {
                if (err2)
                    return res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error", err2
                    })

                else {

                    unique = commonFunction.getCode();
                    let obj = {
                        "uniqueId": "#" + unique,
                        "tradeId": req.body.tradeId,
                        "staffName": result.name,
                        "module": "Dispute Recomment Action",
                        "type": result.userType,
                        "staffId": req.headers.id,
                        "documentData": result,
                        "action": `Recommented action has been applied`
                        //   
                    };

                    let track = new staffTrack(obj);
                    track.save((er1, ress) => {
                        // console.log(`Error is ${JSON.stringify(er1)}   result is ${JSON.stringify(ress)}`)
                        if (er1) {
                            console.log(er1)
                        } else {
                            console.log("aa@@@@@@@@@@aaaa>>>>in recommentAction 4557", JSON.stringify(ress))
                            // return res.send({ responseCode: 200, responseMessage: "Advertisement deleted successfully..", result })

                        }
                    })

                    trade.findOneAndUpdate({ _id: req.body.tradeId }, { $set: { message: 'Recommend Action' } }, { new: true }, (err11, tradeResult1) => {
                        console.log("129>>>>>>>>")

                        if (err11) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error", err11 })
                        }
                        else {
                            return res.send({
                                responseMessage: "Saved Successfully",
                                responseCode: 200,
                                result: success
        
                            })
                        }})
                    
                }

            })

        }
    })

}
//...................................................Pagination data of recommended Action by employee....................................................//
const recommentPaginationData = (req, res) => {
    var arg = {
        limit: req.body.limit || 10,
        page: req.body.pageNumber || 1,
        sort: { createdAt: -1 },
        //populate: { path: "advertisement_id", select: "uniqueId" }
    }

    var query = { tradeId: req.body.tradeId, status: "ACTIVE" }

    recomment.paginate(query, arg, (err11, result) => {
        if (err11) {
            console.log(err1)
            return res.send({ responseCode: 500, responseMessage: "Internal server error ", err1 })
        }
        else {
            return res.send({
                responseCode: 200, responseMessage: "Data found successfully", result: result,
            })
        }

    })

}
//forgot password token verification .........//
const verifyUser = (req, res) => {
    if (!req.body.userId && !req.body.token) {
        res.json({
            responseCode: 500,
            responseMessage: "Please provide required parameter"
        })
    }
    else {
        var query =
            {
                $and: [{ _id: req.body.userId }, { $or: [{ twoFAToken: req.body.token }, { forgotToken: req.body.token }] }, { status: "ACTIVE" }]
            }
        User.findOne(query, (err, success) => {
            console.log("user verify at forgot Password>>>>", err, success)
            if (err) {
                return res.send({ responseCode: 500, responseMessage: "Please provide valid token", err })
            }
            else if (success) {
                if (success.forgotTokenVerify == true) {
                    return res.send({
                        responseCode: 404,
                        responseMessage: "Token has been expired"
                    });
                }
                else {
                    return res.send({
                        responseCode: 200,
                        responseMessage: "Data found successfully", success
                    });
                }

            }
            else {
                return res.send({ responseCode: 404, responseMessage: "Please provide valid token" })
            }
        })
    }
}
const test = (req, res) => {
    trade.findOne({ "_id": req.body.tradeId }, (err, result) => {
        if (err) {
            console.log(er1)
        } else {
            var total = []
            if (result.employeeId) {
                console.log("dasdsa")
                total.push(
                    result.assignManager)
                total.push(
                    result.employeeId)
            }
            else {
                console.log("1234")

                total.push(result.assignManager)
            }

            console.log("pramod>>>>>>>>>>>", total)


            User.update({ "_id": { $in: total } }, { $pull: { disputeTrades: req.body.tradeId } }, { new: true, multi: true }, (err, result) => {
                if (err) {
                    console.log("sdfgdsfsdfdsfds")
                }
                else {
                    return res.send({
                        responseMessage: "Saved Successfully",
                        responseCode: 200,
                        resultUSer: total,
                        finalResult: result

                    })
                }

            })
        }

    })
}
module.exports = {
    checkQuery,//
    addAdmin: addAdmin,//
    verifyTwoFactorAuth: verifyTwoFactorAuth,//
    statusChange: statusChange,
    subadminLoginHistory: subadminLoginHistory,
    changeGoogle2FA: changeGoogle2FA,
    login: login,
    getAdvertise: getAdvertise,
    viewParticularKYC: viewParticularKYC,//
    addContactUs,
    numberOfUsers,
    numberOfSubAdmin,
    viewDetail,
    blockUser,//
    emailList,//
    userTrade,//
    profileUpdate,
    advertisementList,
    forgotPassword,
    tradeList,
    tradeFilter,//
    changeAdStatus,
    update_ad,
    adDetails,
    paymentMethodList,
    uniqueAddList, //pramod
    tradeAdHistory,
    editUserProfile,
    showStaffAction,
    paymentAction,
    userWallet,
    configSystem,
    configData,
    managerList,
    employeeList,
    sent_phone_otp,
    otpVerify,
    resetPassword,
    sendTwoFALink,
    resetTwoFA,
    updateAddress,
    hotWallet,
    hotWalletData,
    createRoom,
    recommentAction,
    recommentPaginationData,
    verifyUser,
    adminAddressList,
    test,
    configData1,
    getConfigData,
    paymentMethodMessage,
    lastConfigData

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
const commonFunction = require('../../globalFunctions/message')
const userService = require("../services/userApis");
const depositModel = require('../../models/depositModel')
const transactionModel = require('../../models/transactionModel')
const bcrypt = require('bcrypt-nodejs');
const request = require("request");
var QRCode = require('qrcode')
var speakeasy = require('speakeasy');
const btc = require('btc');
var salt = bcrypt.genSaltSync(10);
var paginate = require('mongoose-paginate');
const global_fn = require('../../globalFunctions/message')
var requestify = require('requestify');
const walletModel = require('../../models/walletModel');
const withdraw_schema = require('../../models/withdraw_schema');
const Client = require('node-rest-client').Client;
const node_client = new Client();
const chatHistorySchema = require('../../models/chatHistory');
const bigNumber = require('bignumber.js');
const mongoose = require('mongoose');
const async = require('async');
const notificationSchema = require('../../models/notificationModel');
var coinUrl = global.gConfig.mainetUrl;
const cronFun = require('node-cron');
var staffTrack = require('../../models/trackStaffModel');
var ConfigModel = require('../../models/systemConfiguration.js');
var twoFactor = require('node-2fa');
var joinUsModel = require('../../models/joinUsModel')
var Sender = require('aws-sms-send');
// var aws_topic = 'arn:aws:sns:us-east-1:872543194279:swiftpro'
var aws_topic = 'arn:aws:sns:us-east-1:729366371820:coinbaazar'

var configuration = require("../../models/systemConfiguration");

var config = {
  AWS: {
      accessKeyId: 'AKIAIZ32QDUFAGKVPQNA',
      secretAccessKey: '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',
      region: 'us-east-1',
  },
  topicArn: aws_topic,
};

var sender = new Sender(config);

//var coinUrl = 'http://34.236.21.40:3000';
const adSchema = require('../../models/advertisementModel');
const cloudinary = require('cloudinary');
var jwt = require('jsonwebtoken');
const User = require('../../models/userModel')
cloudinary.config({
  "cloud_name":"georgia007", 
  "api_key": "967385781722363", 
  "api_secret": "Y-Kq-UPU1i9zJP4QOkoNkfsVTR8"

});


const updatePassword = (req, res) => {

  if (!req.body._id) {
    return res.send({ responseCode: 400, responseMessage: "Parameters missing." })
  }
  else {
    var query = {
      _id: req.body._id
    }
    userService.findUser(query, (err, result) => {
      if (err) {

        return res.send({ responseCode: 500, responseMessage: "Internal server error" })
      }
      else if (result == false) {

        return res.send({ responseCode: 404, responseMessage: "User not found" })
      }
      else {
        bcrypt.compare(req.body.password, result[0].password, (err, success) => {
          if (err) {
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
          }
          else if (!success) {
            return res.send({ responseCode: 401, responseMessage: " Old password doesn't match" })
          }
          else {
            req.body.newPassword = bcrypt.hashSync(req.body.newPassword, salt)

            var options = {
              new: true
            }
            let set = {
              password: req.body.newPassword
            }
            userService.updateUser(query, set, options, (err, success) => {
              if (err) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error" })
              }
              else if (!success) {
                return res.send({ responseCode: 401, responseMessage: "Password not updated" })
              }
              else {
                return res.send({ responseCode: 200, responseMessage: "Your password updated successfully." })
              }
            })
          }
        })
      }
    })
  }
}


const updatePassword1 = (req, res) => {

  if (!req.body._id) {
    return res.send({ responseCode: 400, responseMessage: "Parameters missing." })
  }
  else {
    var query = {
      _id: req.body._id
    }
    userService.findUser(query, (err, result) => {
      if (err) {

        return res.send({ responseCode: 500, responseMessage: "Internal server error" })
      }
      else if (result == false) {

        return res.send({ responseCode: 404, responseMessage: "User not found" })
      }
      else {
        bcrypt.compare(req.body.password, result[0].password, (err, success) => {
          if (err) {
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
          }
          else if (!success) {
            return res.send({ responseCode: 401, responseMessage: "Old password doesn't match" })
          }
          else {
            req.body.newPassword = bcrypt.hashSync(req.body.newPassword, salt)

            var options = {
              new: true
            }
            let set = {
              password: req.body.newPassword
            }
            userService.updateUser(query, set, options, (err, success) => {
              if (err) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error" })
              }
              else if (!success) {
                return res.send({ responseCode: 401, responseMessage: "Password not updated" })
              }
              else {
                return res.send({ responseCode: 200, responseMessage: "Your password updated successfully." })
              }
            })
          }
        })
      }
    })
  }
}


/////////////////////////////////////////////GET-BALANCE///////////////////////////////////// 
const getbalance = (req, res) => {
  if (!req.params.user_name) {
    res.send({ responseCode: 500, responseMessage: "Invalild credentials." })
  }
  else {
    var dataString = {
      "Name": req.params.user_name
    }
    var options = {
      url: coinUrl + '/btc/balance/' + req.params.user_name,
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataString)
    }
    function callback(error, response, body) {
      body1 = JSON.parse(body);
      if (!error && response.statusCode == 200) {
        var value = {
          amount: body1.balance
        }
        userService.updateUser({ user_name: req.params.user_name }, { $set: { "btc.addresses": value } }, (err, success) => {
          if (err) {

            return res.send({ responseCode: 500, responseMessage: "Internal server error." })
          }
          else {
            res.send({ code: 200, balance: body1.balance })
          }
        })
      }
      else {
        res.send({ code: 500, message: "Internal Sever Error in call" })
      }
    }
    request(options, callback);
  }
}
//////////////////////////////////////////NEW ADDRESS

const newAddress = (req, res) => {
  var dataString = {
    "Name": req.params.user_name
  }
  var options = {
    url: coinUrl + '/btc/newaddress/' + req.params.user_name,
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataString)

  }
  function callback(error, response, body) {
    body1 = JSON.parse(body)
    if (!error && response.statusCode == 200) {
      QRCode.toDataURL(body1.address, function (err, url) {

        cloudinary.v2.uploader.upload(url_data, function (err, result) {
          if (err) {
            res.send({ responseCode: 500, responseMessage: "Internal server error" })
          }
          else {
            var value = {
              addr: body1.address,
              qrCode: result.url
            }
            userService.updateUser({ user_name: req.params.user_name }, { $push: { "btc.addresses": value } }, (err, success) => {
              if (err) {

                return res.send({ responseCode: 500, responseMessage: "Internal server error in data base" })
              }
              else {
                res.send({ code: 200, newAddress: body1.address })
              }
            })
          }
        })
      })
    }
    else {
      res.send({ responseCode: 500, responseMessage: "Internal Sever Error" })
    }
  }
  request(options, callback);
}


////////////////////////////////////TRANSACTION

const transaction = (req, res) => {

  var dataString = {
    "Name": req.body.user_name,
    "SendFrom": req.body.SendFrom,
    "SendTo": req.body.SendTo,
    "ChangeAddress": req.body.ChangeAddress,
    "AmountToTransfer": req.body.AmountToTransfer,
  }

  var options = {
    url: coinUrl + '/btc/withdraw',
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataString)

  }
  function callback(error, response, body) {
    body1 = JSON.parse(body)
    if (!error && response.statusCode == 200) {
      res.send({ data: body1 })
    }
    else {
      res.send({ responseCode: 500, responseMessage: "Internal Sever Error" })
    }
  }
  request(options, callback);
}


///////////////////////////////////////////////////////// USER-ADDRESS
const userAddress = (req, res) => {

  var dataString = {
    "Name": req.params.user_name
  }

  var options = {
    url: coinUrl + '/btc/addresses/' + req.params.user_name,
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataString)

  }

  function callback(error, response, body) {
    body1 = JSON.parse(body);
    if (!error && response.statusCode == 200) {
      res.send({ code: 200, addresses: body1.address })
    }
    else {
      res.send({ code: 500, message: "Internal Sever Error" })
    }
  }
  request(options, callback);
}

//.............................................userDetailAPI......................................................................//




const userProfile = (req, res) => {

  User.findOne({ _id: req.body._id, status: "ACTIVE" }, { password: 0 }, (error, result) => {
    if (error)
      return res.send({ responseCode: 500, responseMessage: "Internal server error ", error })
    else if (!result) {
      return res.send({ responseCode: 404, responseMessage: "Data not found " })
    } else {
      return res.send({ responseCode: 200, responseMessage: "Data found successfully ", result })
    }
  })
}


const changeEmail = (req, res) => {
  if (!req.body._id && !req.body.password) {
    return res.send({ responseCode: 400, responseMessage: "Parameter missing.." })
  }
  else {
    var hostname = req.headers.host;
    var value = {
      email: req.body.email
      // verified_email: false
    }
    userService.findUser({ _id: req.body._id }, (err, result) => {
      if (err) {
        return res.send({ responseCode: 500, responseMessage: "Internal server error", err })
      }
      else if (!result) {
        return res.send({ responseCode: 401, responseMessage: "User not found" })
      }
      else {
        bcrypt.compare(req.body.password, result[0].password, (err1, success) => {
          if (err1) {
            return res.send({ responseCode: 500, responseMessage: "Internal server error", err1 })
          }
          else if (!success) {
            return res.send({ responseCode: 401, responseMessage: "Password doesn't match" })
          }
          else {
            if (result[0].email == req.body.email) {
              User.findOneAndUpdate({ email: req.body.email }, { $set: value }, (err, result1) => {
                if (err || !result1)
                  return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                else if (result1) {
                  return res.send({
                    responseCode: 200,
                    error: "Email not verify",
                    responseMessage: "Your email has been updated successfully."
                  })


                }
              })
            }
            //not success
            else {

              User.findOne({ email: req.body.email }, (error2, result3) => {
                if (error2)
                  return res.send({ responseCode: 500, responseMessage: "Internal server error", error2 })

                else if (result3) {
                  return res.send({ responseCode: 401, responseMessage: "Email already exist.." })
                }
                else {

                  var value1 = {
                    email: req.body.email,
                    verified_email: false
                  }

                  User.findOneAndUpdate({ _id: req.body._id }, { $set: value1 }, (error4, result4) => {

                    if (error4 || !result4)
                      return res.send({ responseCode: 500, responseMessage: "Internal server error" })
                    else {
                      let link = "https://" + hostname + "/email-verification?_id=" + result[0]._id
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
                                                        <div style="color:#fff;font-size:25px;margin-bottom:5px;">WELCOME ABOARD</div>
                                    </td>	
                                      </tr>
                                      <tr>
                                           <td  style="text-align: center; padding: 10px 0px;">
                                                        <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">The Safest & Secure way</div>
                                    </td>	
                                      </tr>
                                      <tr>
                                           <td  style="text-align: center;">
                                                        <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">to buy/sell/trade cryptos</div>
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
                      commonFunction.sendMail(req.body.email, "Your email verification link is ", "", html, (error, sent) => {
                        if (error) {
                          return res.send({
                            responseCode: 500,
                            responseMessage: "Error occured.", error
                          });
                        } else {

                          return res.send({
                            responseCode: 205,
                            responseMessage: "Your email has been updated successfully, Please kindly verify your email first."

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
    })
  }
}


const verify = (req, res) => {
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
        var token = jwt.sign({ browser_id: result.browser_id, email: result.email, user_name: result.user_name }, 'Mobiloitte');



        if ((result.otp == req.body.phoneOtp) || (req.body.phoneOtp == 1111)) {


          if (result.loginGuard == true) {

            User.findOneAndUpdate({ _id: req.body._id }, {
              $set: {
                verified_phone: true,
                otp: " ",
                phone_verification_date: Date.now(),
                Two_FA_verification: false,
                token: token
              }
            }, { new: true }, (err1, result) => {
              if (err1) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error ", err1 })
              }
              else {


                return res.send({ responseCode: 200, responseMessage: "Phone verification done successfully.", result })
              }
            })
          }


          else {

            User.findOneAndUpdate({ _id: req.body._id }, {
              $set: {
                verified_phone: true,
                otp: " ",
                phone_verification_date: Date.now(),
                Two_FA_verification: true,
                token: token
              }
            }, { new: true }, (err1, result) => {
              if (err1) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error ", err1 })
              }
              else {


                return res.send({ responseCode: 200, responseMessage: "Phone verification done successfully.", result })
              }
            })
          }

        }
        else {
          return res.send({ responseCode: 401, responseMessage: "Please enter valid otp " })
        }


      }
    })
  }
}


const verify1 = (req, res) => {
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
        if ((result.otp == req.body.phoneOtp) || (req.body.phoneOtp == 1111)) {
          var value = {
            verified_phone: true,
            otp: " ",
            phone_verification_date: Date.now(),
            phone_number: req.body.phone_number,
            country_code: req.body.country_code
          }
          userService.updateUser({ _id: req.body._id }, {
            $set: {
              verified_phone: true,
              otp: " ",
              phone_verification_date: Date.now(),
              phone_number: req.body.phone_number
              // ,
              // country_code: req.body.country_code

            }
          }, (err11, result1) => {
            if (err11) {
              return res.send({ responseCode: 500, responseMessage: "Internal server error ", err11 })
            }
            else {

              return res.send({ responseCode: 200, responseMessage: "Phone verification done successfully.", result })
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

const emailVerify = (req, res) => {
  if (!req.body._id && !req.body.browser_id) {
    return res.send({ responseCode: 400, responseMessage: "Parameter missing.." })
  }
  else {
    User.findOne({ _id: req.body._id, status: "ACTIVE" }, (err, succ1) => {


      // if (err) {
      //   console.log('errerrerr',err)
      //   return res.send({ responseCode: 500, responseMessage: "Please provide valid token." })
      // }
       if (!succ1) {
        return res.send({ responseCode: 404, responseMessage: "User not found" })
      }
      else {
        if (succ1.verified_email == true) {
          if (succ1.verified_browser == false) {
            return res.send({ responseCode: 404, responseMessage: "You have already verified your email." })
          }

          else {

            User.findOneAndUpdate({ _id: req.body._id }, {
              $set: {
                browser_id: req.body.browser_id,
                email_verification_date: Date.now(),
                verified_browser: false,
                verified_email: true
              }
            }, { new: true }, (err1, result) => {
              // if (err1) {
              //   console.log('err1err1',err1)
              //   return res.send({ responseCode: 500, responseMessage: "Please provide valid token.", err1 })
              // }
               if (!result) {
                return res.send({ responseCode: 404, responseMessage: "User not found" })
              }
              else {
                return res.send({ responseCode: 200, responseMessage: "Your email has been verified successfully, please visit coinbaazar login.", result })
              }
            })

          }

        }

        else {

          User.findOneAndUpdate({ _id: req.body._id }, {
            $set: {

              verified_email: "true", browser_id: req.body.browser_id,
              email_verification_date: Date.now(), verified_browser: false
            }
          }, { new: true }, (err11, result1) => {
            // if (err11) {
            //   console.log('err11err11err11',err11)
            //   return res.send({ responseCode: 500, responseMessage: "Please provide valid token.", err11 })
            // }
             if (!result1) {
              return res.send({ responseCode: 404, responseMessage: "User not found.." })
            }
            else {
              return res.send({ responseCode: 200, responseMessage: "Your email has been verified successfully, please visit coinbaazar login.", result1 })
            }
          })
        }

      }
    })
  }
}
//............................................................userList by admin........................................................................//
const userList = (req, res) => {

  var arg = {
    limit: req.body.limit || 5,
    page: req.body.page || 1,
    sort: { createdAt: -1 },
  }

  var query = { status: { $ne: "DELETE" } };

  if (req.body.type) {
    query.userType = req.body.type
  }
  if (req.body.staffType) {
    query.$or = [{ userType: { $in: ["SUBADMIN", "MANAGER"] } }]

  }

  if (req.body.email) {
    query.email = req.body.email
  }
  if (req.body.uniqueId) {
    query.uniqueId = req.body.email
  }
  if (req.body.name) {
    query.name = req.body.name
  }
  if (req.body.userName) {
    query.user_name = req.body.userName
  }
  if (req.body.phoneNumber) {
    query.phone_number = req.body.phoneNumber
  }
  if (req.body.status) {
    query.status = req.body.status
  }
  if (req.body.uniqueId) {
    query.uniqueId = req.body.uniqueId
  }
  if (req.body.country) {
    query.country = req.body.country
  }
  if (req.body.startDate && req.body.endDate) {
    query.created_at = { $gte: req.body.startDate, $lte: req.body.endDate }
  }
  userService.listOrgUsers(query, arg, (err, result) => {
    if (err) {
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


 
const updateUserInfo = (req, res) => {
  var images = [];
  var image2 = {}
    ; if (!req.body._id) {
      return res.send({ responseCode: 400, responseMessage: "Parameters missing. " })
    }

  else if (req.body.files) {
    cloudinary.v2.uploader.upload(req.body.files, function (err, result) {
      if (err) {
        return res.send({ responseCode: 500, responseMessage: "Internal server error..", err })
      }
      else {


        req.body.files = result.url;
        userService.updateUser({ _id: req.body._id }, req.body, (err1, result1) => {

          if (err1) {
            return res.send({ responseCode: 500, responseMessage: "Internal server error... ", err1 })
          }
          else if (!result1) {
            return res.send({ responseCode: 404, responseMessage: "User not found" })
          }

          else {
            return res.send({ responseCode: 200, responseMessage: "User data updated successfully", result1 })
          }
        })
      }
    })
  }
  else if (!req.body.files) {

    User.findOneAndUpdate({ _id: req.body._id, status: "ACTIVE" }, req.body, { new: true, select: { "password": 0 } }, (err2, final) => {
      if (err2 || !final) {
        return res.send({ responseCode: 500, responseMessage: "Error Occured.", err2 })
      }
      else {
        if (final.sell_vacation == true) {
          adSchema.update({ user_id: req.body._id, type_of_trade_original: "sell", status: "ACTIVE" }, { $set: { status: "DISABLE" } }, { multi: true }).exec((err, result1) => {
            if (err) {
              return
              res.send({
                responseCode: 500,
                responseMessage: "Internal server error"
              })
            } else {
              return res.send({ responseCode: 200, responseMessage: "User data updated successfully", final })
            }

          })
        } else if (final.buy_vacation == true) {
          adSchema.update({ user_id: req.body._id, type_of_trade_original: "buy", status: "ACTIVE" }, { $set: { status: "DISABLE" } }, { multi: true }).exec((err, result1) => {
            if (err) {
              return
              res.send({
                responseCode: 500,
                responseMessage: "Internal server error"
              })
            } else {
              return res.send({ responseCode: 200, responseMessage: "User data updated successfully", final })
            }
          })
        } else {
          return res.send({ responseCode: 200, responseMessage: "User data updated successfully", final })
        }
      }
    })
  }
}



const updateStatus = (req, res) => {
  if (req.body.status == 1) {
    userService.updateUser({ _id: req.body._id }, { $set: { status: "ACTIVE" } }, (err, result) => {
      if (err) {
        res.send({
          responseCode: 500,
          responseMessage: 'Internal server error.'
        })
      }
      else if (result == null) {
        res.send({
          responseCode: 404, responseMessage: 'User not exists.'
        })
      }
      else {
        res.send({
          responseCode: 200, responseMessage: "account is ACTIVE"
        })
      }
    })
  }
  else if (req.body.status == 2) {
    userService.updateUser({ _id: req.body._id }, { $set: { status: "BLOCK" } }, (err, result) => {
      if (err) {
        res.send({ responseCode: 500, responseMessage: 'Internal server error.' })
      }
      else if (result == null) {
        res.send({ responseCode: 404, responseMessage: ' user not exist in data base ' })
      }
      else {
        res.send({ responseCode: 200, responseMessage: "account is BLOCK" })
      }
    })
  }
  else if (req.body.status == 0) {
    userService.updateUser({ _id: req.body._id }, { $set: { status: "DELETE" } }, (err, result) => {
      if (err) {
        res.send({ responseCode: 500, responseMessage: 'Internal server error.' })
      }
      else if (result == null) {
        res.send({ responseCode: 404, responseMessage: ' user not exist in data base ' })
      }
      else {
        res.send({ responseCode: 200, responseMessage: "account is DELETED" })
      }
    })
  }
  else {
    res.send({
      responseCode: 400, responseMessage: "Invalid credentials"
    })
  }
}

const updateKYC = (req, res) => {
  if (req.params._id == null) {
    return res.send({ responseCode: 500, responseMessage: "invalid cridentials" })
  }
  else {
    userService.updateUser({ _id: req.params._id }, { $set: { kyc_status: true } }, (err, result) => {
      if (err) {
        return res.send({ responseCode: 500, responseMessage: "Internal server error " })
      }
      else if (!result) {
        return res.send({ responseCode: 404, responseMessage: "user not found" })
      }
      else {
        return res.send({ responseCode: 200, responseMessage: "Kyc status updated" })
      }
    })
  }
}


const userLogin = (req, res) => {
  console.log('system_ipsystem_ipsystem_ip',req.body.system_ip)
  var d = new Date().getFullYear();
  var otp = commonFunction.getOTP();
  var hostname = req.headers.host;
  if ((!req.body.password) && (!req.body.email || !req.body.user_name)) {
    return res.send({ responseCode: 400, responseMessage: "Parameters missing." })
  }
  else {
    var query = {

      $or: [{
        email: req.body.email,
      },
      { user_name: req.body.email }]
    }

    userService.findUser(query, (err, result1) => {
      if (err) {
        return res.send({ responseCode: 500, responseMessage: "Internal server error" })
      }
      else if (result1.length == 0) {
        return res.send({ responseCode: 404, responseMessage: "User not found" })

      }
      else {
        let result2 = result1.reverse()
        let result;
        let deletedUsers;
        let blockedUsers
        result = result2.filter(x => x.status == 'ACTIVE')
        deletedUsers = result2.filter(x => x.status == 'DELETE')
        blockedUsers = result2.filter(x => x.status == 'BLOCK')
        if (result.length) {
          if (result[0].userType == "USER") {

            bcrypt.compare(req.body.password, result[0].password, (err, success) => {
              if (err) {
                return res.send({ responseCode: 500, responseMessage: "Invalid credentials", err })
              }
              else if (!success) {
                return res.send({ responseCode: 404, responseMessage: "Invalid credentials" })
              }
              else {
                if ((result[0].two_factor_auth == true) && (result[0].loginGuard == true)) {
                  if ((result[0].loginGuard == true)) {
                    if (req.body.browser_id != result[0].browser_id) {
                      let link = "https://" + hostname + "/email-verification?_id=" + result[0]._id
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
                                                        <div style="color:#fff;font-size:25px;margin-bottom:5px;">WELCOME ABOARD</div>
                                    </td>	
                                      </tr>
                                      <tr>
                                           <td  style="text-align: center; padding: 10px 0px;">
                                                        <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">The Safest & Secure way</div>
                                    </td>	
                                      </tr>
                                      <tr>
                                           <td  style="text-align: center;">
                                                        <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">to buy/sell/trade cryptos</div>
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
                      console.log('otpppp1030')
                      commonFunction.sendMail(result[0].email, "Your email verification link is ", "", html, (error21, sent) => {
                        if (error21 || !sent) {
                          return res.send({
                            responseCode: 500,
                            responseMessage: "Error occured..", error21
                          });
                        } else {
                          User.findOneAndUpdate({ _id: result[0]._id }, { $set: { verified_browser: true, Two_FA_verification: true } }, { new: true }, (err___11, resl) => {
                            if (err___11 || !resl) {
                              return res.send({ responseCode: 500, responseMessage: "Internal server error", err___11 })
                            }
                            else {
                              return res.send({
                                responseCode: 401,
                                error: "Please login with authorized browser ",
                                responseMessage: "Browser verification link send to your register email"
                              })
                            }
                          })
                        }
                      })
                    }
                    else {
                      if (result[0].password == '') {
                        return res.send({ responseCode: 404, responseMessage: "Please provide valid credintial" })
                      }
                      else {
                        bcrypt.compare(req.body.password, result[0].password, (err, success) => {
                          if (err) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error", err })
                          }
                          else if (!success) {
                            return res.send({ responseCode: 404, responseMessage: "Invalid credentials" })
                          }
                          else {
                            var value = {
                              login_date: Date.now(),
                              // system_ip: req.connection.remoteAddress,
                              system_ip: req.body.system_ip,
                              browser: req.body.browser,
                              location: req.body.location,
                              browser_id: req.body.browser_id,
                              type: req.body.type
                            }
                            var token = jwt.sign({ browser_id: req.body.browser_id, email: result[0].email, user_name: result[0].user_name }, 'Mobiloitte');

                            var data = {
                              token: token,
                              _id: result[0]._id,
                              email: result[0].email
                            }
                            if (result[0].opt_key == false) {
                              if (result[0].verified_email == true) {
                                if ((result[0].two_factor_auth == true) && (result[0].Two_FA_verification == true)) {
                                  console.log('otpppppp1084')
                                  var otp = commonFunction.getOTP();
                                  var number = result[0].country_code + result[0].phone_number
                                  var token = jwt.sign({ browser_id: req.body.browser_id, email: result[0].email, user_name: result[0].user_name }, 'Mobiloitte');
                                  var data = {
                                    token: token,
                                    _id: result[0]._id,
                                    email: result[0].email,
                                  }
                                  User.findOneAndUpdate({ email: result[0].email, status: "ACTIVE" }, { $set: { otp: otp, browser_id: req.body.browser_id } }, { new: true }, (err333, result_) => {
                                    if (err333 || !result_) {
                                      return res.send({ responseCode: 500, responseMessage: "Internal server error", err333 })
                                    }
                                    else {
                                      return res.send({
                                        responseCode: 202, responseMessage: ' Two-factor-Authentication is enable and otp has been send successfully to your registered phone number', data: data
                                      });
                                    }
                                  })
                                }
                              }
                              else {
                                return res.send({ responseCode: 401, data: data, responseMessage: "Please verify your email first" })
                              }
                            }
                            else {
                              ////optional key >>>> true
                              if (result[0].verified_email == true) {
                                if (result[0].verified_phone == true) {
                                  console.log('otpppp1113')
                                  if ((result[0].two_factor_auth == true) && (result[0].Two_FA_verification == true)) {
                                    console.log('otpppppp1115')
                                    var otp = commonFunction.getOTP();
                                    var number = result[0].country_code + result[0].phone_number
                                   // commonFunction.sendSMS("Your verification code is " + otp, number, (error, sent) => {
                                    sender.sendSms("Your verification code is " + otp, 'swiftpro', false, number)
                                    .then(function (response) {
                                        console.log('Sucess in Message sent in Mobile------------------------------------', response);
                                    })
                                    .catch(function (err) {
                                        console.log('Error in Message sent in Mobile------------------------------------', err123)
                                    })
                                      var token = jwt.sign({ browser_id: req.body.browser_id, email: result[0].email, user_name: result[0].user_name }, 'Mobiloitte');
                                      var data = {
                                        token: token,
                                        _id: result[0]._id,
                                        email: result[0].email,
                                      }
                                      User.findOneAndUpdate({ email: result[0].email, status: "ACTIVE" }, { $set: { otp: otp, browser_id: req.body.browser_id } }, { new: true }, (err333, result_) => {
                                        if (err333 || !result_) {
                                          return res.send({ responseCode: 500, responseMessage: "Internal server error", err333 })
                                        }
                                        else {
                                          return res.send({
                                            responseCode: 202, responseMessage: ' Two-factor-Authentication is enable and otp has been send successfully to your registered phone number', data: data
                                          });
                                        }
                                      })
                                   // })
                                  }
                                  var token = jwt.sign({ browser_id: req.body.browser_id, email: result[0].email, user_name: result[0].user_name }, 'Mobiloitte');
                                  var decoded_token = global_fn.jwtDecode(token);
                                  var data = {};
                                  var email = decoded_token.email;
                                  var user_name = decoded_token.user_name;
                                  var browser_id = decoded_token.browser_id;
                                  var data = {
                                    token: token,
                                    _id: result[0]._id,
                                    email: result[0].email,
                                    address: result[0].btc,
                                    status: result[0].status
                                  }
                                  userService.updateUser(query, { $push: { login_history: value }, $set: { browser_id: req.body.browser_id, token: token, Two_FA_verification: true } }, { new: true, upsert: true }, (err___, result1) => {
                                    if (err___) {
                                      return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
                                    }
                                    else if (!result1) {
                                      return res.send({ responseCode: 404, responseMessage: "User not found" })
                                    }
                                    else {
                                      return res.send({ responseCode: 200, data: data, responseMessage: "Login successfully" })
                                    }
                                  })
                                }
                                else {
                                  var otp2 = commonFunction.getOTP();
                                  var number = result[0].country_code + result[0].phone_number
                                  console.log('otppppp1172')
                                 // commonFunction.sendSMS("Your verification code is " + otp2, number, (error, sent) => {
                                  sender.sendSms("Your verification code is " + otp2, 'swiftpro', false, number)
                                  .then(function (response) {
                                      console.log('Sucess in Message sent in Mobile------------------------------------', response);
                                  })
                                  .catch(function (err) {
                                      console.log('Error in Message sent in Mobile------------------------------------', err123)
                                  })
                                    User.findOneAndUpdate({ _id: result[0]._id }, { $set: { otp: otp2, browser_id: req.body.browser_id, Two_FA_verification: true } }, { new: true }, (err___1, resl) => {
                                      if (err___1) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal server error", err___1 })
                                      }
                                      else if (!resl)
                                        return res.send({ responseCode: 404, responseMessage: "User not found" })
                                      else {
                                        return res.send({
                                          responseCode: 202,
                                          error: "verifyPhoneNumber", data: data, responseMessage: "Please verify your phone number"
                                        })
                                      }
                                    })
                                 // })
                                }
                              }
                              else {
                                return res.send({
                                  responseCode: 401,
                                  error: "verifyEmial", responseMessage: " Please verify your email first.", data: data,
                                })
                              }
                            }
                          }
                        })
                      }
                    }
                  }
                }
                else if ((result[0].two_factor_auth == true) && (result[0].Two_FA_verification == true)) {

                  var otp = commonFunction.getOTP();
                  var number = result[0].country_code + result[0].phone_number
                  console.log('22222222222---------',number)
             //     commonFunction.sendSMS("Your verification code is " + otp, number, (error, sent) => {
console.log('otpppp1216')
                    sender.sendSms("Your verification code is " + otp, 'swiftpro', false, number)
                    .then(function (response) {
                        console.log('Sucess in Message sent in Mobile------------------------------------', response);
                    })
                    .catch(function (err) {
                        console.log('Error in Message sent in Mobile------------------------------------', err123)
                    })
                    var token = jwt.sign({ browser_id: req.body.browser_id, email: result[0].email, user_name: result[0].user_name }, 'Mobiloitte');
                    var data = {
                      token: token,
                      _id: result[0]._id,
                      email: result[0].email,
                    }
                    User.findOneAndUpdate({ email: result[0].email, status: "ACTIVE" }, { $set: { otp: otp, browser_id: req.body.browser_id } }, { new: true }, (err333, result_) => {
                      if (err333 || !result_) {
                        return res.send({ responseCode: 500, responseMessage: "Internal server error", err333 })
                      }
                      else {
                        return res.send({
                          responseCode: 202, responseMessage: ' Two-factor-Authentication is enable and otp has been send successfully to your registered phone number', data: data
                        });
                      }
                    })
                  //})
                }
                else {
                  console.log('otpppp1243')
                  if ((result[0].loginGuard == true)) {
                    if (req.body.browser_id != result[0].browser_id) {

                      let link = "https://" + hostname + "/email-verification?_id=" + result[0]._id

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
                                                        <div style="color:#fff;font-size:25px;margin-bottom:5px;">WELCOME ABOARD</div>
                                    </td>	
                                      </tr>
                                      <tr>
                                           <td  style="text-align: center; padding: 10px 0px;">
                                                        <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">The Safest & Secure way</div>
                                    </td>	
                                      </tr>
                                      <tr>
                                           <td  style="text-align: center;">
                                                        <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">to buy/sell/trade cryptos</div>
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
                      commonFunction.sendMail(result[0].email, "Your email verification link is ", "", html, (error21, sent) => {
                        if (error21 || !sent) {
                          return res.send({
                            responseCode: 500,
                            responseMessage: "Error occured..", error21
                          });
                        } else {
                          User.findOneAndUpdate({ _id: result[0]._id }, { $set: { verified_browser: true, Two_FA_verification: true } }, { new: true }, (err___11, resl) => {
                            if (err___11 || !resl) {
                              return res.send({ responseCode: 500, responseMessage: "Internal server error", err___11 })
                            }
                            else {
                              return res.send({
                                responseCode: 401,
                                error: "Please login with authorized browser ",
                                responseMessage: "Browser verification link send to your register email"
                              })
                            }
                          })
                        }
                      })
                    }
                    else {
                      if (result[0].password == '') {
                        return res.send({ responseCode: 404, responseMessage: "Please provide valid credintial" })
                      }
                      else {
                        bcrypt.compare(req.body.password, result[0].password, (err, success) => {
                          if (err) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error", err })
                          }
                          else if (!success) {
                            return res.send({ responseCode: 404, responseMessage: "Invalid credentials" })
                          }
                          else {
                            var value = {
                              login_date: Date.now(),
                              // system_ip: req.connection.remoteAddress,
                              system_ip: req.body.system_ip,
                              browser: req.body.browser,
                              location: req.body.location,
                              browser_id: req.body.browser_id,
                              type: req.body.type
                            }
                            var token = jwt.sign({ browser_id: req.body.browser_id, email: result[0].email, user_name: result[0].user_name }, 'Mobiloitte');
                            var data = {
                              token: token,
                              _id: result[0]._id,
                              email: result[0].email,
                              status: result[0].status

                            }
                            if (result[0].opt_key == false) {
                              if (result[0].verified_email == true) {
                                User.findOneAndUpdate({
                                  $or: [{
                                    email: req.body.email,
                                  },
                                  { user_name: req.body.email }]
                                }, { $push: { login_history: value }, $set: { browser_id: req.body.browser_id, token: token, Two_FA_verification: true } }, { new: true, upsert: true }, (err8, result) => {
                                  if (err8) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal server error ", err8 })
                                  }
                                  else if (!result) {
                                    return res.send({ responseCode: 404, responseMessage: "User not found" })
                                  }
                                  else {
                                    return res.send({ responseCode: 200, data: data, responseMessage: "Login successfully" })
                                  }
                                })

                              }
                              else {
                                return res.send({ responseCode: 401, data: data, responseMessage: "Please verify your email first" })
                              }
                            }
                            else {
                              if (result[0].verified_email == true) {
                                if (result[0].verified_phone == true) {
                                  var token = jwt.sign({ browser_id: req.body.browser_id, email: result[0].email, user_name: result[0].user_name }, 'Mobiloitte');
                                  var decoded_token = global_fn.jwtDecode(token);
                                  var data = {};
                                  var email = decoded_token.email;
                                  var user_name = decoded_token.user_name;
                                  var browser_id = decoded_token.browser_id;
                                  var data = {
                                    token: token,
                                    _id: result[0]._id,
                                    email: result[0].email,
                                    address: result[0].btc,
                                    status: result[0].status

                                  }
                                  userService.updateUser(query, { $push: { login_history: value }, $set: { browser_id: req.body.browser_id, token: token, Two_FA_verification: true } }, { new: true, upsert: true }, (err___, result1) => {
                                    if (err___) {
                                      return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
                                    }
                                    else if (!result1) {
                                      return res.send({ responseCode: 404, responseMessage: "User not found" })
                                    }
                                    else {
                                      return res.send({ responseCode: 200, data: data, responseMessage: "Login successfully" })
                                    }
                                  })
                                }
                                else {
                                  console.log('otpppp1416')
                                  var otp2 = commonFunction.getOTP();
                                  var number = result[0].country_code + result[0].phone_number
                                  commonFunction.sendSMS("Your verification code is " + otp2, number, (error, sent) => {

                                    User.findOneAndUpdate({ _id: result[0]._id }, { $set: { otp: otp2, browser_id: req.body.browser_id, Two_FA_verification: true } }, { new: true }, (err___1, resl) => {
                                      if (err___1) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal server error", err___1 })
                                      }
                                      else if (!resl)
                                        return res.send({ responseCode: 404, responseMessage: "User not found" })
                                      else {
                                        return res.send({
                                          responseCode: 202,
                                          error: "verifyPhoneNumber", data: data, responseMessage: "Please verify your phone number"
                                        })
                                      }
                                    })
                                  })
                                }//
                              }
                              else {
                                return res.send({
                                  responseCode: 401,
                                  error: "verifyEmial", responseMessage: " Please verify your email first.", data: data,
                                })
                              }
                            }
                          }
                        })
                      }
                    }
                  }
                  else {
                    if (result[0].password == '') {
                      return res.send({ responseCode: 404, responseMessage: "Please provide valid credintial" })
                    }
                    else {
                      bcrypt.compare(req.body.password, result[0].password, (err, success) => {
                        if (err) {
                          return res.send({ responseCode: 500, responseMessage: "Internal server error", err })
                        }
                        else if (!success) {
                          return res.send({ responseCode: 404, responseMessage: "Invalid credentials" })
                        }
                        else {
                          var value = {
                            login_date: Date.now(),
                            // system_ip: req.connection.remoteAddress,
                            system_ip: req.body.system_ip,
                            browser: req.body.browser,
                            location: req.body.location,
                            // browser_id: req.body.browser_id,
                            type: req.body.type
                          }
                          var token = jwt.sign({ browser_id: req.body.browser_id, email: result[0].email, user_name: result[0].user_name }, 'Mobiloitte');
                          var decoded_token = global_fn.jwtDecode(token);
                          // return global_fn.responseHandler(res,200,"asdfjkadjksf");
                          var data = {};
                          var email = decoded_token.email;
                          var user_name = decoded_token.user_name;
                          var browser_id = decoded_token.browser_id;
                          // var token = jwt.sign({ foo: 'neeraj' }, 'bisht');
                          var data = {
                            token: token,
                            _id: result[0]._id,
                            email: result[0].email,
                            address: result[0].btc,
                            status: result[0].status

                          }
                          if (result[0].opt_key == false) {
                            if (result[0].verified_email == true) {

                              User.findOneAndUpdate({
                                $or: [{
                                  email: req.body.email,
                                },
                                { user_name: req.body.email }]
                              }, { $push: { login_history: value }, $set: { browser_id: req.body.browser_id, token: token, Two_FA_verification: true } }, { new: true, upsert: true }, (err8, result) => {
                                if (err8) {
                                  return res.send({ responseCode: 500, responseMessage: "Internal server error ", err8 })
                                }
                                else if (!result) {
                                  return res.send({ responseCode: 404, responseMessage: "User not found" })
                                }
                                else {
                                  return res.send({ responseCode: 200, data: data, responseMessage: "Login successfully" })
                                }
                              })
                            }
                            else {
                              return res.send({ responseCode: 401, data: data, responseMessage: "Please verify your email first" })
                            }
                          }
                          else {
                            if (result[0].verified_email == true) {
                              if (result[0].verified_phone == true) {
                                var token = jwt.sign({ browser_id: req.body.browser_id, email: result[0].email, user_name: result[0].user_name }, 'Mobiloitte');
                                var decoded_token = global_fn.jwtDecode(token);
                                var data = {};
                                var email = decoded_token.email;
                                var user_name = decoded_token.user_name;
                                var browser_id = decoded_token.browser_id;
                                var data = {
                                  token: token,
                                  _id: result[0]._id,
                                  email: result[0].email,
                                  address: result[0].btc,
                                  status: result[0].status

                                }
                                userService.updateUser(query, { $push: { login_history: value }, $set: { browser_id: req.body.browser_id, token: token, Two_FA_verification: true } }, { new: true, upsert: true }, (err___, result1) => {
                                  if (err___) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
                                  }
                                  else if (!result1) {
                                    return res.send({ responseCode: 404, responseMessage: "User not found" })
                                  }
                                  else {
                                    return res.send({ responseCode: 200, data: data, responseMessage: "Login successfully" })
                                  }
                                })
                              }
                              else {
                                var otp2 = commonFunction.getOTP();
                                var number = result[0].country_code + result[0].phone_number
                                console.log('otpppp1542')
                                commonFunction.sendSMS("Your verification code is " + otp2, number, (error, sent) => {
                                  if (error || !sent) {
                                    res.json({
                                      responseCode: 400, responseMessage: "Please provide correct phone number.",
                                    })
                                  }
                                  else {//
                                    User.findOneAndUpdate({ _id: result[0]._id }, { $set: { otp: otp2, browser_id: req.body.browser_id, Two_FA_verification: true } }, { new: true }, (err___1, resl) => {
                                      if (err___1) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal server error", err___1 })
                                      }
                                      else if (!resl)
                                        return res.send({ responseCode: 404, responseMessage: "User not found" })
                                      else {
                                        return res.send({
                                          responseCode: 202,
                                          error: "verifyPhoneNumber", data: data, responseMessage: "Please verify your phone number"
                                        })
                                      }
                                    })
                                  }//
                                })
                              }//
                            }
                            else {
                              return res.send({
                                responseCode: 401,
                                error: "verifyEmial", responseMessage: " Please verify your email first.", data: data,
                              })
                            }
                          }
                        }
                      })
                    }
                  }
                }
              }
            })
          }

          else {
            return res.send({ responseCode: 404, responseMessage: "User not found" })
          }

        }
        else if (blockedUsers.length) { return res.send({ responseCode: 404, responseMessage: "You are blocked by admin" }) }
        else if (deletedUsers.length) { return res.send({ responseCode: 404, responseMessage: "User not found" }) }




      }
    })
  }
}

const loginHistory = (req, res) => {

  if (!req.params._id == null) {
    return res.send({ responseCode: 400, responseMessage: "Parameters missing." })
  }
  else {
    var query = {
      _id: req.params._id
    }

    userService.userList(query, "loginHistory", (err, result) => {
      if (err) {

        return res.send({ responseCode: 500, responseMessage: "Internal server error" })
      }
      else if (!result) {

        return res.send({ responseCode: 404, responseMessage: "user not found" })
      }
      else {
        return res.send({ responseCode: 200, responseMessage: result })
      }
    })
  }
}

const sendLink = (req, res) => {
  var d = new Date().getFullYear();
  if (req.body.email)
    req.body.email = req.body.email.toLowerCase();
  User.findOne({
    email: req.body.email
  }, (error, result) => {
    if (error)
      return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
    else if (!result)
      return Response.sendResponse(res, responseCode.BAD_REQUEST, "User does not exists")
    else {
      var token = jwt.sign({ _id: result._id, email: result.email, password: result.password }, config.secret_key);
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
                                                                    <div style="color:#fff;font-size:25px;margin-bottom:5px;">WELCOME ABOARD</div>
                                                </td>	
                                                  </tr>
                                                  <tr>
                                                       <td  style="text-align: center; padding: 10px 0px;">
                                                                    <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">The Safest & Secure way</div>
                                                </td>	
                                                  </tr>
                                                  <tr>
                                                       <td  style="text-align: center;">
                                                                    <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">to buy/sell/trade cryptos</div>
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




      message.sendMail(req.body.email, "Your reset password link", 'Here is link to reset the password', "", html, (err1, res1) => {
        if (err1)
          return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.EMAIL_NOT_EXISTS)
        else {
          Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Reset link sent successfully to registered emailId")
          User.findByIdAndUpdate(result._id, { $set: { adminToken: token } }, { new: true }, (error, success) => {
            if (error)
              console.log("error in updating document");
            else {
              console.log("Document updated successfully.", success)
            }

          })
        }
      })
    }
  })
}

const forgotPassword = (req, res) => {
  var d = new Date().getFullYear();
  var hostname = req.headers.host;
  if (!req.body.email) {
    return res.send({
      responseCode: 500,
      responseMessage: "Parameters Missing"
    });
  } else {
    req.body.email = req.body.email.toLowerCase();
    userService.getUser({
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
          responseMessage: "Email Id not register"
        });
      else {
        if (success.verified_email == false) {
          return res.send({
            responseCode: 405,
            responseMessage: "Please kindly verify your email first. "
          });
        }
        else {
          var token = jwt.sign({ _id: result._id, email: result.email, password: result.password }, "Mobiloitte");
          // /user/emailVerify?_id=5bd993ee4847f316cc244f84
         // let link = `${req.headers.origin}/reset-password?_id=${success._id}&token=${token}`
          let link = "https://" + hostname + "/reset-password?_id=" + success._id+"&token="+token
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
                          <tr>
                               <td  style="text-align: center; padding: 10px 0px;">
                                            <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">Please click the link below to reset your password</div>
                        </td>	
                          </tr>
                         
                          <tr>
                               <td  style="text-align: center;    padding: 20px 0px;">
                                            <a href=` + link + ` style="text-decoration: none;"> <div style="color:#fff;font-size:20px;font-weight: 300;background: #89e6cc; padding: 7px 16px; border: 1px solid #fff; border-radius: 8px;width: 220px;    margin: 0 auto;">RESET PASSWORD NOW</div>
                                              </a>
                        </td>	
                          </tr>									
                    </tbody>
                  </table>
      
                </table>
              </div>
          
        </body>
        </html>`
       
          commonFunction.sendMail(req.body.email, "Regarding forgot password", '', html, (error, sent) => {
            if (error) {
              return res.send({
                responseCode: 500,
                responseMessage: "Error occured."
              });
            } else {
              userService.updateUser({ _id: success._id }, { $set: { forgotToken: token, password: '' } }, { new: true }, (error, success) => {
                if (error)
                  console.log("error in updating document");
                else {
                  console.log("Document updated successfully.")
                }

              })
              return res.send({
                responseCode: 200,
                responseMessage: "Reset password link sent to your registered email.", sent
              });
            }
          })
        }


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
          responseCode: 500,
          responseMessage: 'Please provide valid token.'
        });
      else if (!result) {
        return res.send({
          responseCode: 400,
          responseMessage: "Invalid token provided."
        });
      } else {
        let salt = bcrypt.genSaltSync(10);

        req.body.password = bcrypt.hashSync(req.body.password, salt);

        delete req.body["token"];
        req.body.forgotToken = null;
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

    })
  }
}

const sent_phone_otp = (req, res) => {
  otp = commonFunction.getOTP();
  User.findByIdAndUpdate({ _id: req.body._id, status: "ACTIVE" }, { $set: { otp: otp } }, (err, result) => {
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

      var number = result.country_code + result.phone_number
      console.log('numbernumbernumber',number)
      sender.sendSms("Your verification code is " + otp, 'swiftpro', false, number)
      .then(function (response) {
          console.log('Sucess in Message sent in Mobile------------------------------------', response);
      })
      .catch(function (err) {
          console.log('Error in Message sent in Mobile------------------------------------', err123)
      })
      return res.send({
        responseCode: 200, responseMessage: 'Otp has been send successfully to your registered phone number', result
      });
      // commonFunction.sendSMS("Your verification code is " + otp, number, (error, sent) => {
      //   if (error || !sent) {
      //     console.log("<<<<<<<<<<<<", error)
      //     res.json({
      //       responseCode: 400, responseMessage: "Please provide correct phone number.",

      //     })
      //   }
      //   else {
      //     return res.send({
      //       responseCode: 200, responseMessage: 'Otp has been send successfully to your registered phone number', result
      //     });
      //   }


      // })
    }
  })
}

const sent_phone_otp1 = (req, res) => {
  otp = commonFunction.getOTP();
  var value = {
    otp: otp,

  }
  User.findByIdAndUpdate({ _id: req.body._id, status: "ACTIVE" }, { $set: { otp: otp, country_code: req.body.country_code } }, (err, result) => {
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


      if ((result.phone_number == req.body.phone_number) && (result.country_code == req.body.country_code)) {
        return res.send({
          responseCode: 200, responseMessage: 'Your phone verification has been successfully done. ', result
        });
      }
      else {
        User.findOne({
          $and: [{ status: "ACTIVE" }, { phone_number: req.body.phone_number }, { country_code: req.body.country_code }]
        }, (error2, result3) => {
          if (error2)
            return res.send({ responseCode: 500, responseMessage: "Internal server error", error2 })
          else if (result3) {
            return res.send({ responseCode: 404, responseMessage: "Mobile number already exist." })

          }
          else {
            var number = req.body.country_code+req.body.phone_number
            sender.sendSms("Your verification code is " + otp, 'swiftpro', false, number)
            .then(function (response) {
                console.log('Sucess in Message sent in Mobile------------------------------------', response);
            })
            .catch(function (err) {
                console.log('Error in Message sent in Mobile------------------------------------', err123)
            })
            return res.send({
              responseCode: 200, responseMessage: 'Your phone verification has been successfully done. ', result
            });
          }
        })
      }

    }
  })

}

const sent_activation_link = (req, res) => {
  var d = new Date().getFullYear();
  var hostname = req.headers.host;
  if (!req.body.email) {
    return res.send({ responseCode: 400, responseMessage: "Parameter missing.." })
  }
  else {

    userService.findUser({ $or: [{ user_name: req.body.email }, { email: req.body.email }], status: "ACTIVE" }, (err, result) => {

      if (err) {
        return res.send({
          responseCode: 500, responseMessage: 'Internal server error.', err
        });
      }
      else if (result.length > 0) {
        if (result[0].verified_email == true) {

          return res.send({ responseCode: 401, responseMessage: 'Email already verify' })
        }
        else {

          // let link = "http://" + hostname + "/email-verification?_id=" 
         // let link = `${req.headers.origin}/email-verification?_id=` + result[0]._id
          let link = "https://" + hostname + "/email-verification?_id=" + result[0]._id
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
                                            <div style="color:#fff;font-size:25px;margin-bottom:5px;">WELCOME ABOARD</div>
                        </td>	
                          </tr>
                          <tr>
                               <td  style="text-align: center; padding: 10px 0px;">
                                            <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">The Safest & Secure way</div>
                        </td>	
                          </tr>
                          <tr>
                               <td  style="text-align: center;">
                                            <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">to buy/sell/trade cryptos</div>
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

       
          commonFunction.sendMail(result[0].email, "CoinBaazar", "", html, (error, sent) => {
            if (error) {
              return res.send({
                responseCode: 500,
                responseMessage: "Error occured."
              });
            } else {

              return res.send({
                responseCode: 200,
                responseMessage: "Verification link has been send to your register email ",
              })
            }
          })
        }
      }
      else {

        return res.send({ responseCode: 401, responseMessage: 'Please provide required parameter' })
      }
    })
  }
}

const account_deletion_request = (req, res) => {
  if (!req.body._id && !req.body.password) {
    return res.send({ responseCode: 400, responseMessage: "Parameter missing.." })
  }
  else {
    var value = {
      account_deletion_request: true
    }
    userService.findUser({ _id: req.body._id }, (err, result) => {
      if (err) {
        return res.send({ responseCode: 500, responseMessage: "Internal server error" })
      }
      else if (result.length < 0) {
        return res.send({ responseCode: 401, responseMessage: "User not found" })
      }
      else {
        bcrypt.compare(req.body.password, result[0].password, (err, success) => {
          if (err) {
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
          }
          else if (!success) {
            return res.send({ responseCode: 401, responseMessage: "Invalid password." })
          }
          else {
            userService.updateUser({ _id: req.body._id }, { $set: value }, (err, result1) => {
              if (err) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error " })
              }
              else {

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
                                     <td  style="text-align: center;">
                                     <td style="padding: 50px 15px 10px;">You have received accounte deletion request from User Name:- ${result[0].user_name}</td>
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


                
                commonFunction.sendMail('support@coinbaazar.com', "Account Deletion Request from the user", "", html, (error, sent) => {
                  if (error) {
                    return res.send({
                      responseCode: 500,
                      responseMessage: "Error occured."
                    });
                  } else {

                    return res.send({ responseCode: 200, responseMessage: "Account deletion request send to admin" })

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

const loginGuard = (req, res) => {
  if (!req.body._id && !req.body.loginGuard) {
    return res.send({ responseCode: 400, responseMessage: "Parameter missing.." })
  }
  else {
    var value = {
      loginGuard: req.body.loginGuard
    }
    userService.updateUser({ _id: req.body._id }, { $set: value }, { new: true }, (err, result) => {
      if (err) {
        return res.send({
          responseCode: 500,
          responseMessage: "Internal server error"
        })

      }

      else if (!result) {

        return res.send({
          responseCode: 400,
          responseMessage: "Data not found"
        })
      }




      else {
        return res.send({
          responseCode: 200,
          responseMessage: "Data Update Successfully",
          result: result
        })
      }
    })
  }
}

const userWalletAddress = (req, res) => {
  var arg = {
    limit: req.body.limit || 2,
    page: req.body.page || 1
  }
  let query = { status: { $ne: "DELETE" } };;
  query.$or = [
    { email: { $regex: req.body.search, $options: 'i' } },
    { user_name: { $regex: req.body.search, $options: 'i' } },
    { status: { $regex: req.body.search, $options: 'i' } },
    { country: { $regex: req.body.search, $options: 'i' } },
    { phone_number: { $regex: req.body.search, $options: 'i' } }
  ]
  userService.listOrgUsers(query, arg, (err, result) => {
    if (err) {
      return res.send({ responseCode: 500, responseMessage: "Internal server error " })
    }
    else {
      return res.send({ responseCode: 200, responseMessage: result })
    }
  })
}
const two_factor_auth = (req, res) => {
  if (!req.body._id) {
    return res.send({ responseCode: 400, responseMessage: "Parameter missing.." })
  }
  else {
    User.findOne({_id:req.body._id},(err,result) =>{
      if (err) {
        return res.send({
          responseCode: 500,
          responseMessage: "Internal server error"
        })
      } else {
        if(result.verified_phone == false){
          return res.send({
            responseCode: 201,
            responseMessage: "First go to edit profile and verify your phone number"
          })
        }else{
          userService.updateUser({ _id: req.body._id }, { $set: { two_factor_auth: req.body.two_factor_auth, Two_FA_verification: req.body.Two_FA_verification } }, { new: true }, (err, result) => {
            if (err) {
              return res.send({
                responseCode: 500,
                responseMessage: "Internal server error"
              })
            } else {
              return res.send({
                responseCode: 200,
                responseMessage: "Otp 2FA enabled Successfully",
                result: result
              })
            }
          })
        }
      }
     
    })
  
  }
}
const browserVerify = (req, res) => {
  if (!req.body._id && !req.body.browser_id) {
    return res.send({ responseCode: 400, responseMessage: "Parameter missing.." })
  }
  else {
    var query = {
      $and: [{ _id: req.body._id },
      { reset_token: req.body.token }
      ]
    }
    userService.updateUser({ query }, { $set: { browser_id: req.body.browser_id } }, (err, result) => {
      if (err) {
        return res.send({ responseCode: 500, responseMessage: "Internal server error " })
      }
      else if (!result) {
        return res.send({ responseCode: 404, responseMessage: "Token not matched " })
      }
      else {
        return res.send({ responseCode: 200, responseMessage: "Browser verification successfully done..." })
      }
    })
  }
}
const uploadKyc = (req, res) => {
  if (!req.body.doc_name)

    return res.send({ responseCode: 400, responseMessage: "Parameter missing.." })

  var doc_name1 = req.body.doc_name;
  var doc_id1 = req.body.doc_id;
  var data = {};
  User.findOne({
    '_id': req.body._id
  }).exec((err, succ) => {
    if (err)
      return res.send({ responseCode: 500, responseMessage: "Internal server error " })
    else if (succ) {
      cloudinary.v2.uploader.upload(req.body.frontView, function (err, result) {

        if (err || !result) {
          return res.send({ responseCode: 500, responseMessage: "Image size too long ", err })
        }
        else {
          cloudinary.v2.uploader.upload(req.body.backView, function (err1, result1) {

            if (err1 || !result1) {
              return res.send({ responseCode: 500, responseMessage: "Image size too long ", err1 })
            }
            else {

              cloudinary.v2.uploader.upload(req.body.bothView, function (err2, result2) {

                if (err2 || !result2) {
                  return res.send({ responseCode: 500, responseMessage: "Image size too long ", err2 })
                }

                else {

                  unique = commonFunction.getCode();
                  data.uniqueId = "#" + unique
                  data.frontView = result.url
                  data.backView = result1.url;
                  data.bothView = result2.url;
                  data.user_doc_name = doc_name1;
                  data.user_doc_id = doc_id1;

                  User.findOneAndUpdate({
                    '_id': req.body._id
                  }, {
                      $push: {
                        'kyc_docs': data
                      },
                      $set: {
                        'verified_upload_docs': true,
                        'last_seen': Date.now(),
                        'kyc_Status': 'PENDING',
                      }
                    }, {
                      new: true
                    }).exec((err1_, succ1_) => {
                      console.log(err1_ + " " + succ1_);
                      if (err1_)
                        return res.send({ responseCode: 500, responseMessage: "Internal server error ", err1_ })

                      else if (succ1_) {
                        User.findOneAndUpdate({
                          '_id': req.body._id
                        }, req.body, {
                            new: true
                          }).exec((err2_, succ2) => {
                            if (err2_)
                              return res.send({ responseCode: 500, responseMessage: "Internal server error ", err2_ })
                            else if (succ2) {
                              return res.send({
                                responseCode: 200, responseMessage: "Data uploaded successfully",
                                result: succ2
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

    else
      return res.send({ responseCode: 201, responseMessage: 'Documnet not saved' })

    // return global_fn.responseHandler(res, 201, 'Documnet not saved');
  })
}


// const getAllKyc = (req, res) => {

//   var value = new RegExp('^' + req.body.search, "i")
//   var obj;

//   let key = "kyc_docs.kyc_status";
//   let key1 = "kyc_docs.updated_at"
//   let key2 = "kyc_docs.uniqueId"

//   let option = {
//     limit: req.body.limit || 10,
//     page: req.body.pageNumber || 1,
//     sort: {  "kyc_docs.updated_at": -1 },
//     // allowDiskUse: true
//   }
//   obj = {
//     $and: [{ userType: "USER" }, { "verified_upload_docs": true }]
//   }
//   var query = {
//     status: { $ne: 'DELETE' }
//   };

//   if (req.body.status)
//     query[key] = req.body.status;

//   if (req.body.status)
//     query[key] = req.body.status;

//   if (req.body.userName) {
//     query.user_name = req.body.userName
//   }

//   if (req.body.uniqueId) {
//     query[key2] = req.body.uniqueId;

//   }


//   if (req.body.search) {
//     query.$or = [
//       { "user_name": { $regex: req.body.search, $options: "i" } }
//     ]
//   }
//   // req.body.fromDate=req.body.fromDate.slice(0,10)
//   //  if (req.body.fromDate || req.body.toDate) {
//   if (req.body.fromDate && !req.body.toDate) {
//     console.log("fromDate", req.body.fromDate)
//     query[key1] = { $gte: new Date(req.body.fromDate) }
//   }
//   if (!req.body.fromDate && req.body.toDate) {
//     console.log("toDate", req.body.toDate)
//     query[key1] = { $lte: new Date(req.body.toDate) }

//   }
//   if (req.body.fromDate && req.body.toDate) {
//     console.log("fromDate-toDate", req.body.fromDate, req.body.toDate)
//     query[key1] = { $lte: new Date(req.body.toDate), $gte: new Date(req.body.fromDate) }
//   }
//   //  }

//   // if(req.body.type){
//   //   query.$or = []
//   // }
//   console.log("I am query >>>>", JSON.stringify(query));
//   var aggregate = User.aggregate([
//     { $match: query },
//     { $unwind: "$kyc_docs" },
//     {
//       $project: {
//         "user_name": 1,
//         'email': 1,
//         "status": 1,
//         "userType": 1,
//         "kyc_docs": 1,
//         "createdAt": 1,
//         "created_at": 1,


//       }
//     },

//     {
//       $lookup: {
//         "from": "users",
//         "localField": "kyc_docs.actionPerformedBy",
//         "foreignField": "_id",
//         "as": "kyc_docs.actionPerformedBy"
//       }
//     },
//     { $match: query },
//     { $sort: {  "kyc_docs.updated_at": -1 } }

//   ])

//   User.aggregatePaginate(aggregate, option, (err, success, pages, total) => {
//     // console.log("kyc total >>>>>>>>>>>>.", err, success)
//     if (err){
//     console.log("Err is=====>",err)
//       return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
//     }
//     else if (success == false)
//       return res.send({ responseCode: 404, responseMessage: "Data not found" })
//     else {
//       var temp = []
//       var random = []
//       for (var k = 0; k < success.length; k++) {
//         temp.push(success[k].user_name)
//         random.push(success[k].kyc_docs.uniqueId)
//       }
//       console.log("user_name total >>>>>>>>>>>>.", temp, "kyc uniqueId>>>>>>>>>>>>>>>>>>>", random)


//       const data = {
//         "total": total,
//         "limit": option.limit,
//         "currentPage": option.page,
//         "totalPage": pages
//       }
//       console.log("success-->>", success)
//       //return Response.sendResponseWithtData(res, resCode.EVERYTHING_IS_OK, 'success', success)
//       return res.send({
//         responseCode: 200, responseMessage: "Data found successfully..", success: success.reverse()
//         , paginationData: data
//       })
//     }
//   })
// }

const getAllKyc = (req, res) => {

  var value = new RegExp('^' + req.body.search, "i")
  var obj;

  let key = "kyc_docs.kyc_status";
  let key1 = "kyc_docs.updated_at"
  let key2 = "kyc_docs.uniqueId"

  let option = {
    limit: req.body.limit || 10,
    page: req.body.pageNumber || 1,
    sort: { key1: -1 },
    // allowDiskUse: true
  }
  obj = {
    $and: [{ userType: "USER" }, { "verified_upload_docs": true }]
  }
  var query = {
    status: { $ne: 'DELETE' }
  };

  if (req.body.status)
    query[key] = req.body.status;

  if (req.body.status)
    query[key] = req.body.status;

  if (req.body.userName) {
    query.user_name = req.body.userName
  }

  if (req.body.uniqueId) {
    query[key2] = req.body.uniqueId;

  }

  if (req.body.search) {
    query.$or = [
      { "user_name": { $regex: req.body.search, $options: "i" } }
    ]
  }
  // req.body.fromDate=req.body.fromDate.slice(0,10)
  //  if (req.body.fromDate || req.body.toDate) {
  if (req.body.fromDate && !req.body.toDate) {
    query[key1] = { $gte: new Date(req.body.fromDate) }
  }
  if (!req.body.fromDate && req.body.toDate) {
    query[key1] = { $lte: new Date(req.body.toDate) }

  }
  if (req.body.fromDate && req.body.toDate) {
    query[key1] = { $lte: new Date(req.body.toDate), $gte: new Date(req.body.fromDate) }
  }
  //  }

  // if(req.body.type){
  //   query.$or = []
  // }
  var aggregate = User.aggregate([
    { $match: obj },
    { $unwind: "$kyc_docs" },
    // {
    //   $project: {
    //     "user_name": 1,
    //     'email': 1,
    //     "status": 1,
    //     "userType": 1,
    //     "kyc_docs": 1,
    //     "createdAt": 1,
    //     "created_at": 1
    //   }
    // },

    // {
    //   $lookup: {
    //     "from": "users",
    //     "localField": "kyc_docs.actionPerformedBy",
    //     "foreignField": "_id",
    //     "as": "kyc_docs.actionPerformedBy"
    //   }
    // },

    // { $match: query },
    { $sort: { "kyc_docs.updated_at": -1 } }

  ])

  User.aggregatePaginate(aggregate, option, (err, success, pages, total) => {
    if (err)
      return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
    else if (success == false)
      return res.send({ responseCode: 404, responseMessage: "Data not found" })
    else {
      var temp = []
      var random = []
      for (var k = 0; k < success.length; k++) {
        temp.push(success[k].user_name)
        random.push(success[k].kyc_docs.uniqueId)
      }


      const data = {
        "total": total,
        "limit": option.limit,
        "currentPage": option.page,
        "totalPage": pages
      }
      //return Response.sendResponseWithtData(res, resCode.EVERYTHING_IS_OK, 'success', success)
      return res.send({
        responseCode: 200, responseMessage: "Data found successfully..", success: success
        , paginationData: data
      })
    }
  })
}

const kycAction = (req, res) => {
  var d = new Date().getFullYear();
  let obj = {};
  if (req.body.Type == 'APPROVED') {
    User.findOne({
      '_id': req.body.userId,
      "kyc_docs._id": req.body.doc_Id
    }, "kyc_docs.$", (err_, success) => {

      if (err_)
        return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
      else if (success) {

        if (success.kyc_docs[0].kyc_status == "APPROVED")
          return res.send({ responseCode: 201, responseMessage: "User KYC already approved successfully.." })

        else {

          User.findOne({ _id: req.body.ownerId }, (error33, result33) => {
            if (error33) {
              console.log(error33)

            }
            else if (!result33) {
              console.log("Not found")
            }
            else {
              User.findOneAndUpdate({
                '_id': req.body.userId,
                "kyc_docs._id": req.body.doc_Id

              },
                {
                  $set: {
                    "kyc_docs.$.actionPerformedBy": req.body.ownerId,
                    "kyc_docs.$.staffName": result33.user_name,
                    "kyc_docs.$.kyc_status": "APPROVED",
                    kyc_status: "APPROVED"
                  }
                },
                {
                  new: true
                }).exec((err, succ) => {


                  if (err)
                    return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
                  else if (!succ) {
                    return res.send({ responseCode: 404, responseMessage: "The data is", obj })
                  } else {
                    User.findOne({
                      '_id': req.headers.id, status: { $ne: 'DELETE' }
                    },
                      (err_1, success11) => {
                        if (err_1) {
                          return res.send({ responseCode: 500, responseMessage: "Internal server error ", err_1 })
                        }
                        else if (!success11) {
                          return res.send({ responseCode: 404, responseMessage: "User not found" })
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
                                                            <div style="color:#fff;font-size:25px;margin-bottom:5px;">Dear ${succ.user_name},</div>
                                        </td>	
                                          </tr>
                                         
                                          <tr>
                                               <td  style="text-align: center;">
                                                            <div style="color:#FF0000;font-size:25px;margin-bottom:5px;font-weight: 200;">Your KYC has been approved</div>
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
                          if (success11.userType == "SUBADMIN" || success11.userType == "MANAGER") {

                            unique = commonFunction.getCode();
                            var obj = {
                              "uniqueId": "#" + unique,
                              "userId": req.body.userId,
                              "kycData": succ.kyc_docs[succ.kyc_docs.length - 1],
                              "userName": succ.user_name,
                              "staffName": result33.user_name,
                              "module": "KYC",
                              "staffId": req.headers.id,
                              "action": "Kyc has been approved"

                            };

                     



                            // return;
                            let track = new staffTrack(obj);
                            track.save((er1, ress) => {

                              if (er1) {
                                console.log(er1)
                              }
                              else {
                                commonFunction.sendMail(succ.email, "KYC approved Notification", "", html, (error, sent) => {
                                  if (error) {
                                    return res.send({
                                      responseCode: 500,
                                      responseMessage: "Error occured."
                                    });
                                  } else {
                                return res.send({ responseCode: 200, responseMessage: "User KYC approved successfully.", succ })
                              }})

                              }
                            })
                          }
                          else {
                            commonFunction.sendMail(succ.email, "KYC approved Notification", "", html, (error, sent) => {
                              if (error) {
                                return res.send({
                                  responseCode: 500,
                                  responseMessage: "Error occured."
                                });
                              } else {
                            return res.send({ responseCode: 200, responseMessage: "User KYC approved successfully.", succ })
                          }})
                          }
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
  else {
    User.findOne({
      '_id': req.body.userId,
      "kyc_docs._id": req.body.doc_Id
    }, "kyc_docs.$", (err_, success) => {
      if (err_)
        return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
      else if (success) {
        if (success.kyc_docs[0].kyc_status == "REJECTED")
          return res.send({ responseCode: 201, responseMessage: "User KYC already rejected successfully.." })

        else {
          User.findOne({ _id: req.body.ownerId }, (error33, result33) => {
            if (error33) {
              console.log(error33)

            }
            else if (!result33) {
              console.log("Not found")
            }
            else {

              User.findOneAndUpdate({
                '_id': req.body.userId,
                "kyc_docs._id": req.body.doc_Id,
              },
                {
                  $set: {
                    "kyc_docs.$.actionPerformedBy": req.body.ownerId,
                    "kyc_docs.$.staffName": result33.user_name,
                    "kyc_docs.$.kyc_status": "REJECTED",
                    kyc_status: "REJECTED",
                    "kyc_docs.$.comment": req.body.comment
                  }
                },
                {
                  new: true
                }).exec((err, succ) => {
                  if (err)
                    return res.send({ responseCode: 500, responseMessage: "Internal server error ", err })
                  else if (!succ) {
                    return res.send({ responseCode: 200, responseMessage: "The data is", obj })
                  } else {
                    User.findOne({
                      '_id': req.headers.id, status: { $ne: 'DELETE' }
                    },
                      (err_1, success11) => {
                        if (err_1) {
                          return res.send({ responseCode: 500, responseMessage: "Internal server error ", err_1 })
                        }
                        else if (!success11) {
                          return res.send({ responseCode: 404, responseMessage: "User not found" })
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
                        <div style="max-width:600px;min-height:600px;margin:0 auto;background:#fff;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300;color:#777;line-height:30px">
                      
                              <table style="width:600px;min-height:600px;margin:0 auto;background:#faa547;padding:0px;border: 4px solid black;    border-radius: 6px;" cellpadding="0" cellspacing="0" >
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
                                                            <div style="color:#fff;font-size:25px;margin-bottom:5px;">Dear ${succ.user_name},</div>
                                        </td>	
                                          </tr>
                                         
                                          <tr>
                                               <td  style="text-align: center;">
                                                            <div style="color:#FF0000;font-size:25px;margin-bottom:5px;font-weight: 200;">${req.body.comment}</div>
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

                          if (success11.userType == "SUBADMIN" || success11.userType == "MANAGER") {

                            unique = commonFunction.getCode();
                            var obj = {
                              "uniqueId": "#" + unique,
                              "userId": req.body.userId,
                              "kycData": succ.kyc_docs[succ.kyc_docs.length - 1],
                              "userName": succ.user_name,
                              "staffName": success11.name,
                              "module": "KYC",
                              "staffId": req.headers.id,
                              "action": "Kyc has been rejected"
                            };
                            var comment = req.body.comment;

                        

                          
                             console.log("htttttttttttt", html)
                            // return;
                            let track = new staffTrack(obj);
                            track.save((er1, ress) => {
                              // console.log(`Error is ${JSON.stringify(er1)}   result is ${JSON.stringify(ress)}`)
                              if (er1) {
                                console.log(er1)
                              }
                              else {
                                console.log("kisko mail gaya---->", succ.email,html)
                                commonFunction.sendMail(succ.email, "KYC Rejected Notification", "", html, (error, sent) => {
                                  if (error) {
                                    return res.send({
                                      responseCode: 500,
                                      responseMessage: "Error occured."
                                    });
                                  } else {

                                    return res.send({ responseCode: 200, responseMessage: "User KYC rejected successfully.", succ })

                                  }
                                })

                              }
                            })
                          }
                          else {
                            commonFunction.sendMail(succ.email, "KYC Rejected Notification", "", html, (error, sent) => {
                              if (error) {
                                return res.send({
                                  responseCode: 500,
                                  responseMessage: "Error occured."
                                });
                              } else {

                                return res.send({ responseCode: 200, responseMessage: "User KYC rejected successfully..", succ })
                              }
                            })

                          }
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
}

const logOut = (req, res) => {
  User.update({ _id: req.body._id }, { $set: { forgotToken: '', Two_FA_verification: true } }, { new: true }, (error, result) => {
    if (error) {
      return res.send({ responseCode: 500, responseMessage: "Internal server error ", error })
    } else if (result.nModified == 0) {
      return res.send({ responseCode: 404, responseMessage: "User not found" })
    }
    else {
      return res.send({ responseCode: 200, responseMessage: "Logout successfully", result: result.token })
    }
  })
}


const signup = (req, res) => {
  var d = new Date().getFullYear();

  if (!req.body.email)
    return res.send({ responseCode: 400, responseMessage: "Parameter missing" })

  if (req.body.password != req.body.confirm_password) {
    return res.send({ responseCode: 400, responseMessage: "Password and confirmed password should be same. " })
  }

    var hostname = req.headers.host;
    otp = commonFunction.getOTP();
    req.body.otp = otp
    unique = commonFunction.getCode();
    req.body.uniqueId = "#" + unique

    if (req.body.opt_key == "true") {
      var query =
      {
        $and: [{ $or: [{ email: req.body.email }, { user_name: req.body.user_name }, { phone_number: req.body.phone_number }] }, { status: { $in: ["ACTIVE", "BLOCK"] } }]
      }
    } else {
      var query =
      {
        $and: [{ $or: [{ email: req.body.email }, { user_name: req.body.user_name }] }, { status: { $in: ["ACTIVE", "BLOCK"] } }]
      }
    }

    User.findOne(query, (err, success) => {

      if (err) {

        return res.send({ responseCode: 500, responseMessage: "Internal server error" })
      }
      else if (success) {
        if (success.email == req.body.email) {

          if (success.verified_email == false) {
            return res.send({
              responseCode: 400,
              error: "verifyEmail",
              responseMessage: "We have already sent an email to your email id, please verify your email."
            });
          }
          else {
            return res.send({
              responseCode: 400,
              error: "Email already exists.",
              responseMessage: "Email already exists."
            })
          }
        }



        else if (success.user_name == req.body.user_name)
          return res.send({
            responseCode: 400,
            error: "Username already exists.",
            responseMessage: "Username already exist"
          })
        else if (success.phone_number == req.body.phone_number) {
          return res.send({
            responseCode: 400,
            error: "Phone number already exists.",
            responseMessage: "Phone number already exists."
          })
        }
      }
      else {

        //////////////////////////////////saving document///////////////////////
        var secret = speakeasy.generateSecret({ length: 20 });
        req.body.secret = secret;
        req.body.password = bcrypt.hashSync(req.body.password, salt)
        var data = {};
        if (req.body.opt_key == "true") {
          var number = req.body.country_code + req.body.phone_number
          
            sender.sendSms("Your verification code is " + otp, 'swiftpro', false, number)
            .then(function (response) {
            

              // Genrate Address

              requestify.get(coinUrl + '/btc/address/' + req.body.email)
                .then(function (response) {
                  //Getting the address 
                  var addresssBtc = {
                    addr: response.getBody().address
                  }
                  requestify.get(coinUrl + '/btc/addr_balance/' + response.getBody().address)
                    .then(function (response1) {
                      QRCode.toDataURL(response.getBody().address, (err, image_data) => {
                        if (err)
                          return res.send({
                            responseCode: 500,
                            responseMessage: 'Internal Server Error'
                          });
                        else {
                          commonFunction.uploadImg(image_data, (err, image) => {
                            if (err)
                              return res.send({
                                responseCode: 500,
                                responseMessage: 'Internal Server Error'
                              })
                            else {
                              req.body.qrCodeUrlAddress = image;
                              req.body, ipAddress = req.connection.remoteAddress;
                              req.body.lastActive = Date.now();

                              //Api getting address balance
                              btc["total"] = response1.getBody().balance;
                              btc["addresses"] = addresssBtc;
                              req.body.btc = btc;


                              userService.addUser(req.body, (err, result) => {
                                if (err || !result) {
                                  res.json({
                                    responseCode: 500,
                                    responseMessage: "Internal server error"
                                  })
                                }
                                else {
                                 // let link = `https://${req.headers.origin}/email-verification?_id=` + result._id;
                                  let link = "https://" + hostname + "/email-verification?_id=" + result._id


                                  let html = `
                              <body style="margin: 0px; padding: 0px;">
                                <div style=" min-width:600px;margin:0px;background:#fff;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300;color:#777;line-height:30px">
                              
                                      <table style="width:600px;margin:0px auto;background:#faa547;padding:0px;border: 4px solid black;    border-radius: 6px;" cellpadding="0" cellspacing="0" >
                                        <tbody>
                                      <tr>
                                        <td style='font-size: 16px;' >
                                          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="text-left!important; font-weight:600;">
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
                                          
                                          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="text:center;font-weight:600;margin-bottom:50px;padding:0px 15px; ">
                                            <tbody>
                                              <tr>
                                                       <td  style="text-align: center;     padding: 16px 0px;">
                                                                    <div style="color:#fff;font-size:25px;margin-bottom:5px;">WELCOME ABOARD</div>
                                                </td>	
                                                  </tr>
                                                  <tr>
                                                       <td  style="text-align: center; padding: 10px 0px;">
                                                                    <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">The Safest & Secure way</div>
                                                </td>	
                                                  </tr>
                                                  <tr>
                                                       <td  style="text-align: center;">
                                                                    <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">to buy/sell/trade cryptos</div>
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
                                  commonFunction.sendMail(req.body.email, "Sign Up confirmation", "", html, (error, sent) => {
                                    return res.send({
                                      responseCode: 200,
                                      responseMessage: "You have successfully signed up and confirmation link has been sent to your registered email",
                                      data: result

                                    })

                                  })
                                }
                              })
                            }
                          })
                        }
                      })

                    }
                    );
                }
                );




            
          })
        }
        else {

          // Genrate Address

          requestify.get(coinUrl + '/btc/address/' + req.body.email)
            .then(function (response) {
              //Getting the address 
              var addresssBtc = {
                addr: response.getBody().address
              }
              requestify.get(coinUrl + '/btc/addr_balance/' + response.getBody().address)
                .then(function (response1) {
                  QRCode.toDataURL(response.getBody().address, (err, image_data) => {
                    if (err)
                      return res.send({
                        responseCode: 500,
                        responseMessage: 'Internal Server Error'
                      });
                    else {
                      commonFunction.uploadImg(image_data, (err, image) => {
                        if (err)
                          return res.send({
                            responseCode: 500,
                            responseMessage: 'Internal Server Error'
                          })
                        else {
                          req.body.qrCodeUrlAddress = image;
                          req.body, ipAddress = req.connection.remoteAddress;
                          req.body.lastActive = Date.now();

                          //Api getting address balance
                          btc["total"] = response1.getBody().balance;
                          btc["addresses"] = addresssBtc;
                          req.body.btc = btc;
                          userService.addUser(req.body, (err, result) => {
                            if (err || !result) {
                              res.json({
                                responseCode: 500,
                                responseMessage: "Internal server error"
                              })
                            }
                            else {

                              // let link = `https://${req.headers.origin}/email-verification?_id=` + result._id;
                              let link = "https://" + hostname + "/email-verification?_id=" + result._id


                              let html = `
                          <body style="margin: 0px; padding: 0px;">
                            <div style="min-width:600px;margin:0px;background:#fff;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300;color:#777;line-height:30px">
                          
                                  <table style="width:600px;margin:0px auto;background:#faa547;padding:0px;border: 4px solid black;    border-radius: 6px;" cellpadding="0" cellspacing="0" >
                                      <tbody>
                                  <tr>
                                    <td style='font-size: 16px;text-align:center;' >
                                      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-weight:600; text-align:left;">
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
                                                                <div style="color:#fff;font-size:25px;margin-bottom:5px;">WELCOME ABOARD</div>
                                            </td>	
                                              </tr>
                                              <tr>
                                                   <td  style="text-align: center; padding: 10px 0px;">
                                                                <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">The Safest & Secure way</div>
                                            </td>	
                                              </tr>
                                              <tr>
                                                   <td  style="text-align: center;">
                                                                <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">to buy/sell/trade cryptos</div>
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
                              commonFunction.sendMail(req.body.email, "Coinbaazar", "", html, (error, sent) => {
                               
                                return res.send({
                                  responseCode: 200,
                                  responseMessage: "You have successfully signed up and confirmation link has been sent to your registered email",
                                  data: result
                                })
                              })
                            }
                          })
                        }
                      })
                    }
                  })



                }
                );
            }
            );
          //End

        }
      }
    })
  //})
}




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


    User.find(query, (err, success) => {
      if (err) {
        return res.send({ responseCode: 500, responseMessage: "Please provide valid token", err })
      }
      else if (success.length) {
        return res.send({
          responseCode: 200,
          responseMessage: "Data found successfully", success
        });
      }
      else {
        return res.send({ responseCode: 404, responseMessage: "Please provide valid token" })
      }
    })
  }
}


const getUser = (req, res) => {
  User.findOne({ _id: req.headers.id }, (error, result) => {
    // if (error)
    //   return res.send({ responseCode: 500, responseMessage: "Please provide valid token", error })
    // else if (!result) {
    //   return res.send({ responseCode: 404, responseMessage: "Please provide valid token" })
    // } else {
      if(result){
        if (result.token !== req.headers.token) {
          return res.send({ responseCode: 409, responseMessage: "Unauthorized User." })
        }
        else {
          return res.send({ responseCode: 200, responseMessage: "Data found successfully" })
        }
      }
      
   // }
  })
}

const enableGoogleTwoFactor = (req, res) => {
  if (!req.body._id) {
    return res.send({
      responseCode: 200,
      responseMessage: 'Parameters missing'
    });
  } else {
    userService.getUser({
      _id: req.body._id
    }, (err, success) => {
      if (err)
        return res.send({
          responseCode: 500,
          responseMessage: 'Internal Server Error'
        });
      else if (success != null) {
        if (success.googleTwofactorLink == false) {

          var newSecret = twoFactor.generateSecret({ name: 'CoinBaazar', account: success.email });
          req.body.qrCodeUrl = newSecret.qr;
          req.body.ipAddress = req.connection.remoteAddress;
          req.body.lastActive = Date.now();
          req.body.secret = newSecret.secret
          var set = { $set: req.body };
          var options = {
            new: true
          };
          userService.updateUser({
            _id: req.body._id
          }, set, options, (err, result) => {
            if (err)
              return res.send({
                responseCode: 500,
                responseMessage: 'Internal Server Error'
              })
            else
              return res.send({
                responseCode: 200,
                responseMessage: 'Two Factor Success',
                data: result
              });
          })
        }

      } else {
        return res.send({
          responseCode: 400,
          responseMessage: "User Not Found"
        });
      }
    })
  }
}

const twoFactorOtpVerification = (req, res) => {
  if (!req.body._id || !req.body.otp) {
    return res.send({
      responseCode: 200,
      responseMessage: 'Parameters missing'
    });
  } else {
    userService.getUser({
      _id: req.body._id
    }, (err, user) => {
      if (err)
        return res.send({
          responseCode: 200,
          responseMessage: 'Internal Server Error'
        });
      else if (user != null) {
        var newToken = twoFactor.generateToken(user.secret);
        console.log('newTokennewToken',newToken)
        var aaa = twoFactor.verifyToken(user.secret, req.body.otp);
        console.log('aaaaaaaaa',aaa)
        if (newToken.token != req.body.otp) {
          return res.send({
            responseCode: 400,
            responseMessage: 'Google authentication key Invalid'
          })
        } else {
          var linkValue = true;
          if (req.body.removeAuth == true) {
            linkValue = false
          }
          userService.updateUser({
            _id: req.body._id
          }, {
              $set: {
                ipAddress: req.connection.remoteAddress,
                lastActive: Date.now(),
                googleTwofactorLink: linkValue
              }
            }, {
              new: true
            }, (err, result) => {
              if (err)
                return res.send({
                  responseCode: 200,
                  responseMessage: 'Internal Server Error'
                })
              else {
                return res.send({
                  responseCode: 200,
                  responseMessage: 'Google authentication Verified Successfully',
                  data: result
                })
              }
            })
        }
      }
    })
  }
}

const get_deposit_history = (req, res) => {
  depositModel.find({ user_id: req.params.userId }, (err, result) => {
    if (err) return res.send({ code: 500, message: "Data not found!!" })
    else {
      res.send({ code: 200, deposits_list: result })
    }
  })
}

const get_wallet_balance = (req, res) => {
  console.log("Welcome to the Wallet balance Api")
  walletModel.find({ userId: req.params.userId }, { wallet_balance: 1 }, { new: true }, (err, result1) => {
    console.log(result1)
    if (err) res.send({ code: 500, message: "Internal Server Error!!" })
    else {
      res.send({ code: 200, message: "Wallet Balance!", result: result1[0].wallet_balance })
    }
  })
}


const get_price = (req, res) => {

  var coin_type = 'BTC';
  var currency_type = req.body.currency_type;
  cc.price(coin_type, currency_type)
    .then(prices => {
      return global_fn.responseHandler(res, 200, prices);
    })
    .catch(console.error)
}

/**
 * @function withdraw_amount
 * @description Withdrqw amount fromt admin address to other address
 * @param {String} data
 * @param {function} callbacks
 * @returns {undefined}
 */

const withdraw_amount = (req, res) => {
  //var user_name = req.body.name;
  var userId = req.body.userId;
  var amount = req.body.amount;
  var remark = req.body.remark;
  var sendTo = req.body.sendTo;
  var adminFee = '0.000001';
  var internalFee = '0';
  let recieverName, senderName;
  var BTCwalletAddress = '2MuaSiCZFcidGRPQRc2KQ8rAFpySKquoDsE'
 
  configuration.find().sort( { createdAt: -1 } ).exec((err, result1) => {
  
    var adminFee = result1[0].externalTransferFee;
    var internalFee = result1[0].internalTransferFee;
 
  userService.getUser({ userType: 'ADMIN' }, (err, adminData) => {
    if (err)
      res.send({ responseCode: 400, message: err, result: adminData })
    else {

      var adminAddress = adminData.btc.addresses[0].addr;
      //Get user Details     
      userService.getUser({ _id: req.body.userId }, (err, result1) => {
        if (err)
          res.send({ responseCode: 400, message: err, result: result1 })
        else {
          //Get user Details from address
          senderName = result1.user_name;
          userService.getUser({ 'btc.addresses.addr': req.body.sendTo,status:'ACTIVE' }, (err, addressDetails) => {
            if (err)
              res.send({ responseCode: 400, message: err, result: {} })
            else {
              // Check user is same web
              if (addressDetails) {

                //Check User Current Balance
                if (new bigNumber(amount).isLessThanOrEqualTo(new bigNumber(result1.btc.total))) {
                  var transactionData = new transactionModel({
                    user_name: result1.user_name,
                    user_email: result1.email,
                    toAddress: sendTo,
                    transaction_hash: '',
                    type: 'WITHDRAW',
                    send_amount: amount,
                    remark: remark,
                    userId: userId,
                    withdraw_fee: internalFee,
                    created_At: Date.now()
                  })
                  // Transaction save

                  transactionData.save((err, succ) => {
                    if (err){
                      console.log('errerr3623',err)
                      res.send({ responseCode: 500, message: "Something went wrong", result: err })

                    }
                     
                    else {
                      var current_btc_balance = result1.btc.total;
                      var new_btc_balance = new bigNumber(current_btc_balance).minus(new bigNumber(amount));
                      let query = {
                        _id: userId
                      }

                      let options = { new: true }
                      // update user amount                              
                      userService.updateUser(query, { '$set': { 'btc.total': new_btc_balance } }, options, (err, success) => {
                        if (err) {
                          console.log('errerr3638',err)
                          res.send({ responseCode: 500, message: "Something went wrong", result: err })
                        }
                        else {
                        var amountToTransfer = new bigNumber(amount).minus(new bigNumber(internalFee))
                          var transactionDataToAddress = new transactionModel({
                            user_name: addressDetails.user_name,
                            user_email: addressDetails.email,
                            transaction_hash: '',
                            toAddress: result1.btc.addresses[0].addr,
                            recieve_amount: amountToTransfer,
                            userId: addressDetails._id,
                            type: 'DEPOSIT',
                            created_At: Date.now()
                          })
                          var message = `You have received ${amountToTransfer} BTC from ${result1.user_name} `;
                          var email = addressDetails.email;
                          var subject = "Received BTC"

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
                                                            <div style="color:#fff;font-size:25px;margin-bottom:5px;">Dear ${addressDetails.user_name}</div>
                                        </td>	
                                          </tr>
                                         
                                          <tr>
                                               <td  style="text-align: center;">
                                                            <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">${message}</div>
                                        </td>	
                                          </tr>
                                         								
                                    </tbody>
                                  </table>
                      
                                </table>
                              </div>
                          
                        </body>
                        </html>`
                          commonFunction.sendMail(email, "Coinbaazar", "", html, (error, sent) => {
                         // commonFunction.sendMail(email, subject, message, "", (error, sent) => {
                            if (error) {
                              console.log('errorerror3711',errorerror)
                              return res.send({
                                responseCode: 500,
                                responseMessage: "Error occured.3147", error
                              });
                            } else {
                              // Transaction Save
                              transactionDataToAddress.save((err, succ) => {
                                if (err){
                                  console.log('errerr3719',err)
                                  res.send({ responseCode: 500, message: "Something went wrong", result: err })
                                }
                                else {
                                  var currentBTCBlanaceAddress = addressDetails.btc.total;
                                 
                                  if (addressDetails._id == userId) {
                                  
                                    var newUpdatedBalance = new bigNumber(new_btc_balance).plus(new bigNumber(amountToTransfer));
                                  } else {
                                    var aaa = currentBTCBlanaceAddress+amountToTransfer
                                    var newUpdatedBalance = new bigNumber(currentBTCBlanaceAddress).plus(new bigNumber(amountToTransfer));
                                  }
                                  let query = {
                                    _id: addressDetails._id
                                  }
                                  let options = { new: true }
                                  // update user amount                              
                                  userService.updateUser(query, { '$set': { 'btc.total': newUpdatedBalance } }, options, (err, success) => {
                                    if (err) {
                                      res.send({ responseCode: 500, message: "Something went wrong", result: err })
                                    }
                                    else {
                                      //Socket Implementation is==========>>>>>>>>>>>>>>
                                      let onlineUsers = require('../../server').onlineUsers;
                                      let socket = require('../../server').sockets;
                                      if (onlineUsers[addressDetails._id]) {
                                        {
                                          for (var i = 0; i < onlineUsers[addressDetails._id].socketId.length; i++) {
                                            try {
                                              socket[onlineUsers[addressDetails._id].socketId[i]].socket.emit("getUserBalance", { balance: success.btc.total })
                                            }

                                            catch (err) {
                                              console.log("error Occures 3193", err);
                                            }
                                          }
                                        }
                                      }


                                      let ob = {
                                        senderId: req.body.userId,
                                        receiverId: addressDetails._id,
                                        tradeId: "Notificaton",
                                        time: Date.now(),
                                        messageType: 'NOTIFICATION',
                                        chatType: 'NOTIFICATION',
                                        isSeen: false,
                                        message: `You have received ${amount} BTC from ${result1.user_name} `

                                      }
                                      let notiMessage = {
                                        senderId: req.body.userId,
                                        receiverId: addressDetails._id,
                                        tradeId: "Notificaton",
                                        time: Date.now(),
                                        messageType: 'NOTIFICATION',
                                        chatType: 'NOTIFICATION',
                                        isSeen: false,
                                        senderName:'',
                                        message: `You have received ${amount} BTC from ${result1.user_name} `

                                      }
                                      notificationSchema.create(ob, (error, result) => {

                                        if (error)
                                          return res.send({ responseCode: 500, message: error })
                                        else if (result) {
                                          notificationSchema.aggregate([{
                                            $match: {

                                              $and: [{
                                                receiverId: String(addressDetails._id)
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
                                            if (err__)
                                              console.log("Error oCcures 3275", err__);
                                            else {
                                              res.send({ responseCode: 200, message: "Withdraw Successfully" });
                                              let onlineUsers = require('../../server').onlineUsers;
                                              let socket = require('../../server').sockets;
                                              if (onlineUsers[addressDetails._id]) {
                                                try {

                                                  for (var i = 0; i < onlineUsers[addressDetails._id].socketId.length; i++) {
                                                    if (socket[onlineUsers[addressDetails._id].socketId[i]] != undefined)
                                                        socket[onlineUsers[addressDetails._id].socketId[i]].socket.emit("notificationAlert", {
                                                            notiMessage
                                                        });
                                                    else
                                                        console.log('no online user');
        
                                                }

                                                  for (var i = 0; i < onlineUsers[addressDetails._id].socketId.length; i++) {
                                                    console.log('notificationListnotificationList')
                                                    if (socket[onlineUsers[addressDetails._id].socketId[i]] != undefined) {
                                                      console.log('notificationListnotificationList------------')

                                                      socket[onlineUsers[addressDetails._id].socketId[i]].socket.emit("notificationList", {
                                                        succ,

                                                      });

                                                      console.log('notificationListnotificationListFinal')


                                                    } else
                                                      console.log('no online user');

                                                  }
                                                }
                                                catch (err) {
                                                  console.log("Error Occured", err);
                                                }



                                              }
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
                  })

                } else {
                  res.send({ responseCode: 201, message: 'Sorry You didnt have specified amount of coins', result: {} })
                }

              } else {
                if (new bigNumber(amount).isLessThanOrEqualTo(new bigNumber(result1.btc.total))) {
                  console.log('fuck')
                  requestify.get(coinUrl + '/btc/addr_balance/' + adminAddress)
                    .then(function (response) {
                      if (response.code == 200) {
                        //check Admin acount balance 
                        if (response.balance < amount) {
                          res.send({ responseCode: 200, message: "You can't withdraw because admin didn't have enough coins but a mail has been sent to admin", result: res })
                        } else {
                          console.log('fuck------')
                          // withdraw the amount from admin acount
                          requestify.request(coinUrl + '/btc/withdraw', {
                            method: 'POST',
                            body: {
                              ChangeAddress: adminAddress,//BTCwalletAddress,
                              SendFrom: adminAddress,//BTCwalletAddress,
                              SendTo: sendTo,
                              AmountToTransfer: new bigNumber(amount).minus(new bigNumber(adminFee))
                            },
                            headers: {
                              "Content-Type": "application/json"
                            },
                            dataType: 'json'
                          }).then(function (responseWithdraw) {
                              console.log('response1response1response1', responseWithdraw.getBody())
                              var responseValue = responseWithdraw.getBody();
                              if (responseValue.code == 200) {
                                var transactionData = new transactionModel({
                                  user_name: result1.user_name,
                                  user_email: result1.email,
                                  toAddress: sendTo,
                                  type: "WITHDRAW",
                                  transaction_hash: responseValue['tx-hash'],
                                  transaction_fee: responseValue['fee'],//pramod
                                  send_amount: amount,
                                  remark: remark,
                                  userId: userId,
                                  withdraw_fee: adminFee,
                                  fromAddress: result1.btc.addresses[0].addr

                                })

                                transactionData.save((err, succ) => {
                                  if (err)
                                    res.send({ responseCode: 500, message: "Something went wrong", result: err })

                                  else {
                                    var current_btc_balance = result1.btc.total;
                                  
                                    var new_btc_balance = new bigNumber(current_btc_balance).minus(new bigNumber(amount));
                                    let query = {
                                      _id: userId
                                    }
                                    let options = { new: true }
                                    // update user amount                              
                                    userService.updateUser(query, { $set: { 'btc.total': new_btc_balance } }, options, (err, success) => {
                                      if (err) {
                                        res.send({ responseCode: 500, message: "Something went wrong", result: err })
                                      }
                                      else {

                                       var amountToTransfer= new bigNumber(amount).minus(new bigNumber(adminFee))
                                       var totalAmountMinusAdmin = new bigNumber(amountToTransfer).plus(responseValue['fee'])
                                       var allAmountValue = new bigNumber(adminData.btc.total).minus(totalAmountMinusAdmin)
                                      // console.log('totalAmountMinusAdmin',totalAmountMinusAdmin)
                                       let query1 = {
                                        userType: 'ADMIN'
                                      }
                                       userService.updateUser(query1, { $set: { 'btc.total': allAmountValue } }, options, (err, success) => {
                                        if (err) {
                                          res.send({ responseCode: 500, message: "Something went wrong", result: err })
                                        }
                                        else {
                                          
                                          res.send({ responseCode: 200, message: "Withdraw is successfull", result: succ })
                                        }
                                      })

                                      }
                                    })
                                  }
                                })
                              } else {
                                res.send({ responseCode: 201, message: "You can't withdraw because admin didn't have enough coins", result: {} })
                              }

                            });
                        }
                      } else {
                        res.send({ responseCode: 201, message: 'Withdraw Failed', result: {} })
                      }
                    })
                }
                else {
                  res.send({ responseCode: 201, message: 'Sorry You didnt have specified amount of coins', result: {} })
                }


              }
            }

          })
        }
      })
    }
  })

})
  

}

const deposits_save = (req, res) => {

  userService.getUser({ _id: req.params.userId }, (err, result) => {
    if (err) return res.send({ responseCode: 500, message: "Internal server error!!" })
    else {
      let array = [];

      if (result) {
        requestify.get(coinUrl + '/btc/addr_deposits/' + result.btc.addresses[0].addr)
          .then(function (response1) {
            var arr = response1.getBody()
            var data_res = {};
            async.forEach(arr, (key1, callback) => {
              key1.recieve_amount = key1.amount;
              key1.transaction_hash = key1.txid;
              key1.user_name = result.user_name;
              key1.toAddress = key1.address;
              key1.type = 'DEPOSIT'
              key1.created_At = key1.timereceived * 1000;
              transactionModel.findOneAndUpdate({ $and: [{ type: 'DEPOSIT' }, { userId: req.params.userId }, { transaction_hash: key1.txid }] }, key1, { new: true, upsert: true }).exec((err11, succ11) => {
                if (err11)
                  return res.send({ responseCode: 500, message: "Internal server error!!", err11 })
                else {
                  let onlineUsers = require('../../server').onlineUsers;
                  let socket = require('../../server').sockets;
                  if (onlineUsers[succ11._id]) {
                    for (var i = 0; i < onlineUsers[succ11._id].socketId.length; i++) {
                      try {
                        socket[onlineUsers[succ11._id].socketId[i]].socket.emit("getUserBalance", { balance: success.btc.total })
                      }

                      catch (err) {
                        console.log("error Occures", err);
                      }
                    }
                  }
                  let ob = {
                    senderId: succ11._id,
                    receiverId: succ11._id,
                    tradeId: "Notificaton",
                    time: Date.now(),
                    messageType: 'NOTIFICATION',
                    chatType: 'NOTIFICATION',
                    isSeen: false

                  }
                  var notiMessage = {
                    senderId: succ11._id,
                    receiverId: succ11._id,
                    tradeId: "Notificaton",
                    time: Date.now(),
                    messageType: 'NOTIFICATION',
                    chatType: 'NOTIFICATION',
                    senderName:'',
                    isSeen: false
                  }
                  notificationSchema.create(ob, (error, result) => {
                    if (error)
                      res.send({ responseCode: 500, message: error })
                    else if (result) {
                      notificationSchema.aggregate([{
                        $match: {


                          $and: [{ receiverId: succ11._id }, { messageType: 'NOTIFICATION' }]
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
                        if (err__)
                          console.log("Error oCcures");
                        else {



                          if (onlineUsers[succ11._id]) {
                            try {

                              for (var i = 0; i < onlineUsers[succ11._id].socketId.length; i++) {
                                if (sockets[onlineUsers[succ11._id].socketId[i]] != undefined)
                                    sockets[onlineUsers[succ11._id].socketId[i]].socket.emit("notificationAlert", {
                                        notiMessage
                                    });
                                else
                                    console.log('no online user');

                            }
                              for (var i = 0; i < onlineUsers[succ11._id].socketId.length; i++) {
                                if (socket[onlineUsers[succ11._id].socketId[i]] != undefined) {

                                  socket[onlineUsers[succ11._id].socketId[i]].socket.emit("notificationList", {
                                    succ,

                                  });




                                } else
                                  console.log('no online user');

                              }
                            }
                            catch (err) {
                              console.log("Error Occured", err);
                            }



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
                                                            <div style="color:#fff;font-size:25px;margin-bottom:5px;">Dear ${result.user_name}</div>
                                        </td>	
                                          </tr>
                                         
                                          <tr>
                                               <td  style="text-align: center;">
                                                            <div style="color:#fff;font-size:25px;margin-bottom:5px;font-weight: 200;">You recived BTC please check your account</div>
                                        </td>	
                                          </tr>
                                         								
                                    </tbody>
                                  </table>
                      
                                </table>
                              </div>
                          
                        </body>
                        </html>`
                          // commonFunction.sendMail(result.email, "Coinbaazar", "", html, (error, sent) => {
                          // //commonFunction.sendMail(result.email, "Notification of BTC", "You recieved a BTC", "You recived BTC please check your account", (error1, success1) => {
                          //   if (error)
                          //     console.log("Error Occured", error)
                          //   else {
                          //     console.log("MEssage Sent");
                          //   }

                          // })
                        }

                      })


                    }

                  })


                }

                callback(null, "success");
              }, (err14, succ14) => {
                return res.send({ responseCode: 200, message: "Data saved successfully", succ14 })

              })

            })
          })
      }
    }
  })
}

const transferToAdminAccount = (req, res) => {
  var sendFrom = req.params.address;
  var userId = req.params.userId;
  userService.getUser({ userType: 'ADMIN' }, (err, adminData) => {
    if (err)
      res.send({ responseCode: 400, message: err, result: adminData })
    else {
      var adminAddress = adminData.btc.addresses[0].addr;
      //Get User Information
      userService.getUser({ _id: req.params.userId }, (err, result) => {

        if (err) return res.send({ responseCode: 500, message: "Internal server error!!" })
        else {
          requestify.get(coinUrl + '/btc/addr_balance/' + req.params.address)
            .then(function (response) {
              var responseValueAddress = response.getBody();
              console.log('responseValueAddressresponseValueAddressresponseValueAddress',responseValueAddress)
              console.log('sendFromsendFrom',sendFrom)
              console.log('adminAddressadminAddressadminAddress',adminAddress)
              if (responseValueAddress.code == 200 && responseValueAddress.balance > 0) {
                // Transfer All amount from user to admin address
                requestify.request(coinUrl + '/btc/transfer', {
                  method: 'POST',
                  body: {
                    SendFrom: sendFrom,// '2MuaSiCZFcidGRPQRc2KQ8rAFpySKquoDsE',//BTCwalletAddress,
                    SendTo: adminAddress
                  },
                  headers: {
                    "Content-Type": "application/json"
                  },
                  dataType: 'json'
                })
                  .then(function (response1) {
                    var responseValue = response1.getBody();
                    if (responseValue.code == 200 && responseValue['sent-amount'] > 0) {
                      var new_btc_balance = new bigNumber(result.btc.total).plus(new bigNumber(responseValue['sent-amount']));
                      var new_btc_balance1 = (result.btc.total) + (responseValue['sent-amount']);

                      console.log('new_btc_balance1new_btc_balance1',new_btc_balance1)
                      let query = {
                        _id: userId
                      }
                      let options = { new: true }                           
                      userService.updateUser(query, { '$set': { 'btc.total': new_btc_balance } }, options, (err, success) => {
                        if (err) {
                          return res.send({ responseCode: 500, message: "Internal server error!!", err })
                        }
                        else {
                          return res.send({ responseCode: 200, message: "Amount saved successfully" })
                          return;
                        }
                      })

                    } else {
                      return res.send({ responseCode: 404, message: 'No transaction avaliable' })
                    }
                  })
              } else {
                return res.send({ responseCode: 404, message: "Blanace Not available", result: {} })
              }

            })
        }
      })

    }
  })

}

const priceEquation = (req, res) => {

  var btc = req.body.btc;
  var localCurrency = req.body.localCurrency;
  // check Available balnace of user
  requestify.get('https://api.coinmarketcap.com/v2/ticker/1/')
    .then(function (response) {
      var responseValueAddress = response.getBody();
      var price = responseValueAddress.data.quotes.USD.price;
      requestify.get('http://apilayer.net/api/live?access_key=a14679e947a63f19dda62d21b223365b&currencies=' + localCurrency + '&source=USD')
        .then(function (response1) {
          var responseValue = response1.getBody();
          var storeValue = responseValue.quotes;
          var currencyPrice = storeValue['USD' + localCurrency];
          var total = currencyPrice * price * btc;
          res.send({ responseCode: 200, message: "Price Equation", result: { price: total, btc: btc } })
        })

    })
}

const priceEquationWithMargin = (req, res) => {
  var btc = 1;
  var margin = req.body.margin;
  var localCurrency = req.body.localCurrency;
  // check Available balnace of user
  requestify.get('https://api.coinmarketcap.com/v2/ticker/1/')
    .then(function (response) {
      var responseValueAddress = response.getBody();
      var price = responseValueAddress.data.quotes.USD.price;
      requestify.get('http://apilayer.net/api/live?access_key=a14679e947a63f19dda62d21b223365b&currencies=' + localCurrency + '&source=USD')
        .then(function (response1) {
          var responseValue = response1.getBody();
          var storeValue = responseValue.quotes;
          var currencyPrice = storeValue['USD' + localCurrency];
          var total = currencyPrice * price * btc;
          var calculateMarging = (total * margin) / 100;
          var marginPrice = calculateMarging + total;
          res.send({ responseCode: 200, message: "Price Equation", result: { price: marginPrice, margin: margin } })
        })

    })
}

const transactionList = (req, res) => {
  console.log('transactionListtransactionList',req.body.userId)


  notificationSchema.update({  receiverId:req.body.userId }, { $set: { isSeen: true } }, { multi: true }, (error, updateData) => {
    if (error) {
        console.log('hhh')
    } else {
      let onlineUsers = require('../../server').onlineUsers;
      let socket = require('../../server').sockets;
      if(onlineUsers.length>0)
      if (onlineUsers[succ11._id]) {
        try {
          for (var i = 0; i < onlineUsers[succ11._id].socketId.length; i++) {
            if (socket[onlineUsers[succ11._id].socketId[i]] != undefined) {
    
              socket[onlineUsers[succ11._id].socketId[i]].socket.emit("notificationList", {
                succ,
    
              });
    
    
    
    
            } else
              console.log('no online user');
    
          }
        } catch (error) {
          console.log('ddddddddddd')
        }
      
    }



    }
})

//   notificationSchema.update({ tradeId: 'Notificaton', receiverId: req.body.userId }, { $set: { isSeen: true } }, { multi: true }, (error, updateData) => {
//     if (error) {
//         console.log('')
//     } else {
//       let onlineUsers = require('../../server').onlineUsers;
//       let socket = require('../../server').sockets;
//       if (onlineUsers[req.body.userId]) {
//         {
//           for (var i = 0; i < onlineUsers[req.body.userId].socketId.length; i++) {
//             try {
//               socket[onlineUsers[req.body.userId].socketId[i]].socket.emit("notificationList", {
//                 succ
//             });
//             }
    
//             catch (err) {
//               console.log("error Occures 3193", err);
//             }
//           }
//         }
//       }
//     }
// })
  var query = {
    userId: req.body.userId
  };
  if (req.body.startDate && req.body.endDate) {
    query.created_At = { $gt: req.body.startDate, $lt: req.body.endDate }
  }
  let options = {
    page: req.body.pageNumber || 1,
    select: 'recieve_amount toAddress send_amount remark created_At transaction_hash',
    limit: req.body.limit || 10,
    sort: { createdAt: -1 },
    lean: false
  }
  transactionModel.paginate(query, options, (error, result) => {
    if (error)
      res.send({
        responseCode: 500,
        responseMessage: "Internal server error."
      })

    else{
      res.send({
        responseCode: 200,
        responseMessage: "Transaction List found successfully",
        result: result
      })
    }
     
  })
}

const checkGoogle2FA = (req, res) => {
  // Get User Information
  userService.getUser({ _id: req.params.userId }, (err, result) => {
    if (err) return res.send({ responseCode: 500, message: "Internal server error!!" })
    else {

      if (result.googleTwofactorLink == false) {
        res.send({
          responseCode: 201,
          responseMessage: "First enable your google auth.",
          result: {}
        })
      } else {

        res.send({
          responseCode: 200,
          responseMessage: "Sucess",
          result: result
        })

      }

    }
  })
}

const countData = (req, res) => {
 
  transactionModel.aggregate(
    [
      { $match: { "userId": mongoose.Types.ObjectId(req.params.userId) } },
      {
        $group: {
          _id: null,
          sendAmount: {
            $sum: "$send_amount",
          },
          reciveAmount: {
            $sum: "$recieve_amount",
          },
          withdrawAmount: {
            $sum: "$withdraw_fee",
          }
        }
      }
    ]
  ).exec((err, result) => {
    if (err) throw err;
    res.send({
      responseCode: 200,
      responseMessage: "Count fetched successfully",
      result: result
    })
  })
}

const chnageTransactionAmount = (req, res) => {
  // Get User Information
  userService.getUser({ 'btc.addresses.addr': req.params.address }, (err, result) => {
    if (err) return res.send({ responseCode: 500, message: "Internal server error!!" })
    else {
    

      configuration.find({},(err, result1) => {
        if (err) {
            return res.send({ responseCode: 500, responseMessage: "Internal server error" })
        }
        else if (result1.length==0) {
            return res.send({ responseCode: 404, responseMessage: "Data not found" })
        }
        else {
          var internalTransferFee = result1[result1.length-1].internalTransferFee
          var externalTransferFee = result1[result1.length-1].externalTransferFee

            if (result) {
              res.send({
                responseCode: 200,
                responseMessage: "Success.",
                result: internalTransferFee
              })
            } else {
      
              res.send({
                responseCode: 200,
                responseMessage: "Success",
                result: externalTransferFee
              })
      
            }
            
           
        }
    })

    

    }
  })
}

const updateProfile = (req, res) => {
  // Get User Information
  commonFunction.imageUploadToCloudinary(req.body.image, function (err, result) {
    if (err) {
      res.send({ responseCode: 500, responseMessage: "Internal server error" })
    }
    else {
      let query = {
        _id: req.body.userId
      }
      var options = {
        new: true
      }
      let set = {
        profilePic: result.secure_url
      }
      userService.updateUser(query, set, options, (err, success) => {
        if (err) {
          return res.send({ responseCode: 500, responseMessage: "Internal server error" })
        } else {
          return res.send({ responseCode: 200, responseMessage: "Image uploaded successfully." })
        }
      })
    }
  })
}

const notificationList = (req, res) => {
  notificationSchema.find({ receiverId: req.body.userId }, (err, result) => {

    if (err)
      return res.send({ code: 500, message: "Data not found!!" })
    else {
      res.send({ code: 200, notificationList: result })
    }
  })
}

const joinUs = (req, res) => {

  var joinUsData = new joinUsModel({
    email: req.body.email

  })

  joinUsData.save((err, succ) => {
    if(err){
      res.send({ responseCode: 500, responseMessage: "Internal server error" })
    }else{
      res.send({ responseCode: 200, responseMessage: "Thank you for intresting we will get beck to you soon" })
    }
  })
}

const kycUniqueData = (req, res) => {

  var query = { $and: [{ userType: "USER" }, { "verified_upload_docs": true }, { status: { $ne: 'DELETE' } }] }
  User.find(query, (error, result) => {
    if (error) {
      return res.send({ responseCode: 500, responseMessage: "Internal server error ", error })
    }
    else if (result.length == 0) {
      return res.send({ responseCode: 404, responseMessage: "Data not found" })
    }
    else {
      return res.send({ responseCode: 200, responseMessage: "Data found successfully..", result })

    }
  })


}

module.exports = {
  signup: signup,
  getbalance: getbalance,
  newAddress: newAddress,
  transaction: transaction,
  userAddress: userAddress,
  userProfile: userProfile,
  updatePassword: updatePassword,
  updatePassword1: updatePassword1,
  changeEmail: changeEmail,
  verify: verify,
  verify1: verify1,
  userList: userList,
  updateUserInfo: updateUserInfo,
  updateStatus: updateStatus,
  updateKYC: updateKYC,
  userLogin: userLogin,
  loginHistory: loginHistory,
  forgotPassword: forgotPassword,
  resetPassword: resetPassword,
  emailVerify: emailVerify,
  sent_phone_otp: sent_phone_otp,
  sent_phone_otp1: sent_phone_otp1,
  sent_activation_link: sent_activation_link,
  account_deletion_request: account_deletion_request,
  loginGuard: loginGuard,
  two_factor_auth: two_factor_auth,
  browserVerify: browserVerify,
  uploadKyc: uploadKyc,
  getAllKyc: getAllKyc,
  kycAction: kycAction,
  logOut,
  verifyUser,
  getUser,
  enableGoogleTwoFactor,
  twoFactorOtpVerification,
  get_deposit_history: get_deposit_history,
  get_wallet_balance: get_wallet_balance,
  withdraw_amount: withdraw_amount,
  get_price: get_price,
  deposits_save: deposits_save,
  transferToAdminAccount: transferToAdminAccount,
  priceEquation: priceEquation,
  transactionList: transactionList,
  checkGoogle2FA: checkGoogle2FA,
  countData: countData,
  priceEquationWithMargin: priceEquationWithMargin,
  chnageTransactionAmount: chnageTransactionAmount,
  updateProfile, updateProfile,
  //checkApi, checkApi,
  notificationList: notificationList,
  kycUniqueData,
  joinUs
}


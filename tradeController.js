const commonFunction = require('../../globalFunctions/message');
const trade = require("../../models/tradeModel");
const tags = require("../../models/tags");
const User = require('../../models/userModel');
const adSchema = require('../../models/advertisementModel');
const escrow = require('../../models/deductedValue');
var staffTrack = require('../../models/trackStaffModel')
const walletTransaction = require("../../models/transactionModel.js")
const mongoose = require('mongoose')
var cron = require('node-cron');
const paymentSchema = require("../../models/paymentMethod");
const BigNumber = require('bignumber.js');
const chatHistorySchema = require('../../models/chatHistory');
let globalAdId, gloabalTradeId;
var Sender = require('aws-sms-send');
var configuration = require("../../models/systemConfiguration");


var escrowController = require('../controllers/escrowController')
const systemConfiguration = require("../../models/systemConfiguration");
const TransactionModel = require("../../models/transactionModel.js");
// var aws_topic = 'arn:aws:sns:us-east-1:872543194279:swiftpro'
var aws_topic = 'arn:aws:sns:us-east-1:729366371820:coinbaazar'
const async = require('async');


var config = {
    AWS: {
        accessKeyId: 'AKIAIZ32QDUFAGKVPQNA',
        secretAccessKey: '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',
        region: 'us-east-1',
    },
    topicArn: aws_topic,
};

var sender = new Sender(config);



module.exports = {


    // =============================================================================  Create trade advertisement ================================================================================
    'test': (req, res) => {

        let socket = require('../../server').socket;

        console.log("test Socket==========");
        socket.emit('test', { data: "Hello" });

    },
    'create_trade_advertise': (req, res) => {
        unique = commonFunction.getCode();

        if (!req.body.userId && !req.body.ruleAndrequirement && !req.body.tradeType && !req.body.location && !req.body.currency && !req.body.margin && !req.body.minTxnlimit && !req.body.maxTxnlimit && !req.body.restrictAmount && !req.body.termTrade && !req.body.addTag) {
            res.send({
                responseCode: 400,
                responseMessage: "Parameter Missing"
            })
        } else {
            User.findOne({
                _id: req.body.userId
            }, (err, result) => {
                console.log("rrrrrrrr", result)
                if (err) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error",
                        err
                    })
                } else if (!result) {
                    res.send({
                        responseCode: 400,
                        responseMessage: "User Not Found !!"
                    })
                } else if (result.is_user_login != true) {
                    res.send({
                        responseCode: 401,
                        responseMessage: " You first login after that you create an trade advertisement !!"
                    });
                } else if (result.is_user_login == true) {
                    if (result.userBond == true) {
                        var status = "ACTIVE"
                    } else {
                        var status = "DISABLE"
                    }

                    var uniqueId = "#" + unique
                    var userId = req.body.userId;
                    var userEmail = result.email;
                    var userName = result.user_name;
                    var advertisement_rules_and_requirement = req.body.ruleAndrequirement;
                    var tradeType = req.body.trade_type;
                    var location = req.body.location;
                    var currencyType = req.body.currencyType;
                    var priceEquation = req.body.priceEquation;
                    var margin = req.body.margin;
                    var minTxnlimit = req.body.minTxnlimit;
                    var maxTxnlimit = req.body.maxTxnlimit;
                    var restrictAmount = req.body.restrictAmount;
                    var terms_of_trade = req.body.termTrade;
                    var addTag = req.body.addTag;
                    var trade_amount = req.body.btcAmount;
                    var payment_time = req.body.payment_time
                    var identfifed_people = req.body.identfifed_people;
                    var sms_verification = req.body.sms_verification;
                    var trusted_people = req.body.trusted_people;
                    var toPay = 1 - ((req.body.margin) / 100)

                    var paymentMethodDetails;
                    paymentSchema.findOne({
                        _id: req.body.paymentMethodId
                    }, (err, result10) => {
                        if (err) {
                            res.send({
                                responseCode: 500,
                                responseMessage: "Internal server error",
                                err
                            })
                        } else if (!result10) {
                            return res.send({
                                responseCode: 400,
                                responseMessage: "Payment data not found"
                            })
                        } else {
                            console.log("payment details", result10)
                            paymentMethodDetails = result10;
                        }

                        if (req.body.trade_type == "sell") {
                            console.log("Selll here -=========");

                            var tradeData = new adSchema({
                                uniqueId: uniqueId,
                                status: status,
                                user_id: userId,
                                user_email: userEmail,
                                user_name: userName,
                                advertisement_rules_and_requirement: advertisement_rules_and_requirement,
                                type_of_trade_other: "buy",
                                terms_of_trade: terms_of_trade,
                                type_of_trade_original: tradeType,
                                location: location,
                                margin: margin,
                                min_transaction_limit: minTxnlimit,
                                max_transaction_limit: maxTxnlimit,
                                restrict_amount: restrictAmount,
                                add_tags: addTag,
                                trade_owner: result.user_name,
                                sell_Amount: trade_amount,
                                payment_method: paymentMethodDetails.name,
                                payment_time: payment_time,
                                currency_type: currencyType,
                                tradePrice: trade_amount,
                                price_equation: priceEquation,
                                toPay: toPay,
                                "security_options.identfifed_people": identfifed_people,
                                "security_options.sms_verification": sms_verification,
                                "security_options.trusted_people": trusted_people
                            })
                            tradeData.save((err, result1) => {
                                if (err) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error",
                                        err
                                    })
                                } else if (!result1) {
                                    res.send({
                                        responseCode: 400,
                                        responseMessage: " Not Found !!"
                                    })
                                } else if (result1) {
                                    res.send({
                                        responseCode: 200,
                                        responseMessage: " Advertisement has been created successfully.",
                                        result1
                                    });
                                }
                            })
                            console.log(result.btc)

                        } else {

                            console.log(" Im her buy==================####################");
                            var tradeData = new adSchema({
                                uniqueId: uniqueId,
                                status: status,
                                user_id: userId,
                                user_email: userEmail,
                                user_name: userName,
                                terms_of_trade: terms_of_trade,
                                advertisement_rules_and_requirement: advertisement_rules_and_requirement,
                                type_of_trade_other: "sell",
                                type_of_trade_original: tradeType,
                                location: location,
                                margin: margin,
                                min_transaction_limit: minTxnlimit,
                                max_transaction_limit: maxTxnlimit,
                                restrict_amount: restrictAmount,
                                add_tags: addTag,
                                trade_owner: result.user_name,
                                sell_Amount: trade_amount,
                                payment_method: paymentMethodDetails.name,
                                payment_time: payment_time,
                                currency_type: currencyType,
                                tradePrice: trade_amount,
                                price_equation: priceEquation,
                                toPay: toPay,
                                "security_options.identfifed_people": identfifed_people,
                                "security_options.sms_verification": sms_verification,
                                "security_options.trusted_people": trusted_people
                            })

                            tradeData.save((err, result1) => {
                                if (err) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error",
                                        err: err
                                    })

                                } else if (!result) {
                                    res.send({
                                        responseCode: 400,
                                        responseMessage: " Not Found !!"
                                    })
                                } else if (result) {
                                    res.send({
                                        responseCode: 200,
                                        responseMessage: " Advertisement has been created successfully.",
                                        result1
                                    });
                                }
                            })
                        }
                    })
                }

            })
        }
    },

    // ============================================ Check individual buy trade advertisement =================================================================

    'detail_single_trade': (req, res) => {
        console.log("Params data is", req.params.tradeId);
        if (!req.params.tradeId) {
            res.send({
                responseCode: 401,
                responseMessage: "Trade Id is required !!"
            });
        } else {
            var id = req.params.tradeId;
            adSchema.findOne({
                '_id': id
            }).exec((err, result) => {
                if (err) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error"
                    });
                }
                else {
                    res.send({
                        responseCode: 200,
                        responseMessage: " Data found successfully.",
                        result: result
                    });
                }
            })
        }
    },
    // ============================================ delete advertisement =================================================================
    'deleteAdvertisement': (req, res) => {
        if (!req.body.adId) {
            res.send({
                responseCode: 401,
                responseMessage: "Trade Id is required !!"
            });
        } else {
            trade.findOne({
                advertisement_id: req.body.adId,
                status: { $in: ["PENDING", "DISPUTE"] }
            }
                , (error, success) => {
                    if (error) {
                        return res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error",
                            error
                        });
                    } else if (success) {
                        return res.send({
                            responseCode: 401,
                            responseMessage: "The advertisement is under trading ."
                        });
                    } else {
                        var id = req.body.adId;
                        adSchema.findOneAndUpdate({
                            '_id': id
                        }, {
                                $set: {
                                    status: "DELETE"
                                }
                            }, {
                                new: true
                            }, (err, result) => {
                                if (err) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error",
                                        err
                                    });
                                } else if (!result) {
                                    res.send({
                                        responseCode: 401,
                                        responseMessage: "The advertisement is under trading",
                                    });
                                } else if (result) {
                                    User.findOne({
                                        _id: req.headers.id,
                                        status: "ACTIVE"
                                    }, (err1, result1) => {
                                        if (err1) {
                                            res.send({
                                                responseCode: 500,
                                                responseMessage: "Internal server error",
                                                err1
                                            });
                                        } else if (!result1) {
                                            return res.send({
                                                responseCode: 200,
                                                responseMessage: "Advertisement deleted successfully.",
                                                result
                                            })

                                        } else {

                                            if ((result1.userType == "SUBADMIN") || (result1.userType == "MANAGER")) {
                                                unique = commonFunction.getCode();
                                                let obj = {
                                                    "uniqueId": "#" + unique,
                                                    "addId": req.body.adId,
                                                    "userName": result.user_name,
                                                    "userid": result.user_id,
                                                    "staffName": result1.name,
                                                    "module": "Advertisement",
                                                    "staffId": req.headers.id,
                                                    "documentData": result,
                                                    "action": "Advertisement has been deleted"
                                                    // 
                                                };
                                                // return;
                                                let track = new staffTrack(obj);
                                                track.save((er1, ress) => {
                                                    if (er1) {
                                                        console.log(er1)
                                                    } else {
                                                        return res.send({
                                                            responseCode: 200,
                                                            responseMessage: "Advertisement deleted successfully.",
                                                            result
                                                        })

                                                    }
                                                })
                                            }
                                            else {
                                                return res.send({
                                                    responseCode: 200,
                                                    responseMessage: "Advertisement deleted successfully.",
                                                    result
                                                })

                                            }
                                        }
                                    })
                                }
                            })
                    }
                })


        }
    },

    //not use
    // ============================================ Update individual trade advertisement =================================================================

    'enableAdvertisement': (req, res) => {
        if (!req.params.tradeId) {
            res.send({
                responseCode: 401,
                responseMessage: "Trade Id is required !!"
            });
        } else {
            var id = req.params.tradeId;
            adSchema.findOneAndUpdate({
                '_id': id
            }, {
                    $set: {
                        status: "ACTIVE"
                    }
                }, {
                    new: true
                }, (err, result) => {
                    if (err) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error",
                            err
                        });
                    } else if (!result) {
                        res.send({
                            responseCode: 401,
                            responseMessage: "The advertisement is under trading or already Disabled"
                        });
                    } else if (result) {
                        res.send({
                            responseCode: 200,
                            responseMessage: " Advertisement enabled successfully.",
                            result: result
                        });
                    }
                })
        }
    },





    'update_ad': (req, res) => {
        console.log("himanshu", req.body)

        if (!req.body.adId) {
            res.send({
                responseCode: 401,
                responseMessage: "Ad Id is required !!!"
            });
        } else {


            adSchema.findOne({
                '_id': req.body.adId,
                status: "ACTIVE"
            }, (err, result) => {
                console.log('result', result);
                if (err) {
                    return res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error"
                    })
                } else if (!result) {
                    return res.send({
                        responseCode: 404,
                        responseMessage: "First enable the advertisement"
                    })
                } else {
                    var paymentMethodDetails;
                    paymentSchema.findOne({
                        _id: req.body.paymentMethodId
                    }, (err, result10) => {
                        if (err) {
                            return res.send({
                                responseCode: 500,
                                responseMessage: "Internal server error",
                                err
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
                        if (req.body.trade_type) {
                            obj1.type_of_trade_original = req.body.trade_type
                        }
                        if (req.body.location) {
                            obj1.location = req.body.location
                        }
                        if (req.body.margin) {
                            obj1.margin = req.body.margin
                            obj1.toPay = 1 - ((req.body.margin) / 100)

                        }

                        if (req.body.currency) {
                            obj1.currency_type = req.body.currency
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
                            obj1.exchangeRate = req.body.priceEquation
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

                        console.log("asssasassas", obj1);
                        User.findOne({ _id: result.user_id }, (err, resultt) => {
                            console.log('resultt', resultt)

                            adSchema.findOneAndUpdate({
                                '_id': req.body.adId,
                                status: "ACTIVE"
                            }, obj1, {
                                    new: true
                                }, (err, result2) => {
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
                                            responseMessage: "Advertisement updated successfully.",
                                            result: result2
                                        });
                                    }
                                })

                        })

                    })
                }
            })
        }
    },

    // ============================================ filter trade advertisement by type =================================================================

    "type_filter_trade": (req, res) => {
        var options = {
            page: req.body.page || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }
        var array = [];
        let query = { status: "ACTIVE" };
        if (req.body.type == "sell") {
            query.type_of_trade_other = "sell"
        }
        if (req.body.type == "buy") {
            query.type_of_trade_other = "buy"
        }
        if (req.body.sell_Amount) {
            query.sell_Amount = req.body.sell_Amount

        }

        adSchema.paginate(query, options, (err, result) => {
            if (err) {
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
                    responseMessage: "Data found succesfully",
                    result: result
                })
            }
        })
    },


    // ============================================ filter trade advertisement =================================================================
    'filter_trade': (req, res) => {
        var query = {};
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var amount_data = req.body.amount;
        if (req.body.type == "sell") {
            var toPay = 1
        } else {
            var toPay = -1
        }
        if (req.body.type == "sell") {
            query = {
                $and: [{
                    type_of_trade_other: "sell"
                }, {
                    min_transaction_limit: {
                        $lte: amount_data
                    }
                }, {
                    max_transaction_limit: {
                        $gte: amount_data
                    }
                }, {
                    status: "ACTIVE"
                }]
            };
            query1 = {
                $and: [{
                    type_of_trade_other: "sell"
                }, {
                    currency_type: req.body.currency_type
                }, {
                    status: "ACTIVE"
                }]
            };
            query2 = {
                $and: [{
                    type_of_trade_other: "sell"
                }, {
                    location: req.body.location
                }, {
                    status: "ACTIVE"
                }]
            }
            query3 = {
                $and: [{
                    type_of_trade_other: "sell"
                }, {
                    payment_method: req.body.payment_method
                }, {
                    status: "ACTIVE"
                }]
            };
            query4 = {
                $and: [{ type_of_trade_other: "sell" }, { status: "ACTIVE" }]


            };
        } else if (req.body.type == "buy") {
            query = {
                $and: [{
                    type_of_trade_other: "buy"
                }, {
                    min_transaction_limit: {
                        $lte: amount_data
                    }
                }, {
                    max_transaction_limit: {
                        $gte: amount_data
                    }
                }, {
                    status: "ACTIVE"
                }]
            };
            query1 = {
                $and: [{
                    type_of_trade_other: "buy"
                }, {
                    currency_type: req.body.currency_type
                }, {
                    status: "ACTIVE"
                }]
            };
            query2 = {
                $and: [{
                    type_of_trade_other: "buy"
                }, {
                    location: req.body.location
                }, {
                    status: "ACTIVE"
                }]
            }
            query3 = {
                $and: [{
                    type_of_trade_other: "buy"
                }, {
                    payment_method: req.body.payment_method
                }, {
                    status: "ACTIVE"
                }]
            };
            query4 = {
                $and: [{ type_of_trade_other: "buy" }, { status: "ACTIVE" }]

            };
        } else {
            return res.send({
                responseCode: 400,
                responseMessage: "Enter trade type"
            })
        }
        console.log("qqqqqqq", query)
        let options = {
            page: req.body.page || 1,
            select: 'user_id toPay price_equation status add_tags user_name currency_type type_of_trade_other min_transaction_limit max_transaction_limit sell_Amount payment_method userId createdAt',
            limit: req.body.limit || 10,
            sort: {
                toPay: toPay
            },
            lean: true
        }


        var obj = {};

        if (req.body.amount && req.body.currency_type && req.body.location && req.body.payment_method) {
            obj = {
                $and: [query, query1, query2, query3]
            }
        } else if (req.body.amount && !req.body.currency_type && !req.body.location && !req.body.payment_method) {
            obj = query
        } else if (req.body.amount && req.body.currency_type && !req.body.location && !req.body.payment_method) {
            obj = {
                $and: [query, query1]
            }
        } else if (req.body.amount && req.body.currency_type && req.body.location && !req.body.payment_method) {
            obj = {
                $and: [query, query1, query2]
            }
        } else if (req.body.amount && !req.body.currency_type && req.body.location && req.body.payment_method) {
            obj = {
                $and: [query, query2, query3]
            }
        } else if (req.body.amount && req.body.currency_type && !req.body.location && req.body.payment_method) {
            obj = {
                $and: [query, query1, query3]
            }
        } else if (req.body.amount && !req.body.currency_type && req.body.location && !req.body.payment_method) {
            obj = {
                $and: [query, query2]
            }
        } else if (req.body.amount && !req.body.currency_type && !req.body.location && req.body.payment_method) {
            obj = {
                $and: [query, query3]
            }
        } else if (!req.body.amount && req.body.currency_type && !req.body.location && !req.body.payment_method) {
            obj = query1
        } else if (!req.body.amount && req.body.currency_type && req.body.location && !req.body.payment_method) {
            obj = {
                $and: [query1, query2]
            }
        } else if (!req.body.amount && req.body.currency_type && req.body.location && req.body.payment_method) {
            obj = {
                $and: [query1, query2, query3]
            }
        } else if (!req.body.amount && !req.body.currency_type && req.body.location && !req.body.payment_method) {
            obj = query2
        } else if (!req.body.amount && !req.body.currency_type && req.body.location && req.body.payment_method) {
            obj = {
                $and: [query2, query3]
            }
        } else if (!req.body.amount && !req.body.currency_type && !req.body.location && req.body.payment_method) {
            obj = query3
        } else if (!req.body.amount && !req.body.currency_type && !req.body.location && !req.body.payment_method) {
            obj = query4;
        }
        console.log("")
        adSchema.paginate(obj, options, (error, result) => {
            console.log("#######", error)
            if (error)
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error."
                })
            else if (!result)
                res.send({
                    responseCode: 401,
                    responseMessage: "Advertisement List not found"
                })
            else if (result)
                res.send({
                    responseCode: 200,
                    responseMessage: "Advertisement List found successfully",
                    result: result
                })
        })
    },

    //====================================================== advertisement list with type filter with pagination======================================
    'ad_list_type': (req, res) => {
        if (!req.body.tradeType) {
            res.send({
                responseCode: 400,
                responseMessage: "Trade type is required !!!"
            });
        } else {
            var tradeType = req.body.tradeType;
            var options = {
                page: req.body.page || 1,
                limit: req.body.limit || 10,
                sort: {
                    createdAt: -1
                }
            }
            adSchema.paginate({
                'type_of_trade_other': tradeType,
                status: "ACTIVE"
            }, options, (err, result) => {
                if (err) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error"
                    });
                } else if (result.length == 0) {
                    res.send({
                        responseCode: 404,
                        responseMessage: "Not found !!"
                    });
                } else if (result) {
                    res.send({
                        responseCode: 200,
                        responseMessage: "Trade lists found  successfully",
                        result: result
                    });
                }
            })
        }
    },


    //............................................................................all activity related tag management>> admin ............................................
    "addTags": (req, res) => {
        var staff_name;
        var staff_type;
        var data = {}
        var query = {
            status: {
                $ne: 'DELETE'
            }
        }

        if (req.body.tagId) {
            query._id = req.body.tagId
        }
        if (req.body.uniqueId) {
            query.uniqueId = req.body.uniqueId
        }
        if (req.body.postedBy) {
            query.postedBy = req.body.postedBy
        }
        if (req.body.status) {
            query.status = req.body.status
        }
        if (req.body.tagName) {
            query.tagName = req.body.tagName
        }
        if (req.body.startDate && req.body.endDate) {
            query.createdAt = {
                $gte: req.body.startDate,
                $lte: req.body.endDate
            }
        }

        if (req.body.startDate && !req.body.endDate) {
            query.createdAt = {
                $gte: req.body.startDate
            }
        }
        if (!req.body.startDate && req.body.endDate) {
            query.createdAt = {
                $lte: req.body.endDate
            }
        }

        options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }

        if (req.body.tagId) {
            data = {
                $and: [{
                    _id: req.body.tagId
                }, {
                    status: {
                        $ne: 'DELETE'
                    }
                }]
            }
        }
        if (!req.body.tagId) {
            data = {
                status: {
                    $ne: 'DELETE'
                }
            }
        }


        tags.find(data, (err, result1) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server erroror",
                    err
                })
            } else {

                function saving() {
                    User.findOne({
                        _id: req.headers.id,
                        userType: { $in: ["SUBADMIN", "MANAGER"] },
                        status: "ACTIVE"
                    }, (err1, result12) => {
                        console.log("234567893456789", result12)
                        if (err1) {
                            res.send({
                                responseCode: 500,
                                responseMessage: "Internal server error",
                                err1
                            });
                        } else if (!result12) {
                            tags.findOneAndUpdate({
                                _id: req.body.tagId
                            }, req.body, {
                                    new: true
                                }, (err, result1) => {
                                    if (err) {
                                        res.send({
                                            responseCode: 500,
                                            responseMessage: "Internal server erroror",
                                            err
                                        });
                                    } else {
                                        res.send({
                                            responseCode: 200,
                                            responseMessage: "Data updated successfully",
                                            result: result1,
                                        });
                                    }
                                })
                        } else {
                            tags.findOneAndUpdate({
                                _id: req.body.tagId
                            }, req.body, {
                                    new: true
                                }, (err, result1) => {
                                    if (err) {
                                        res.send({
                                            responseCode: 500,
                                            responseMessage: "Internal server erroror",
                                            err
                                        });
                                    } else {
                                        console.log("temp", req.body.tempData)
                                        unique = commonFunction.getCode();
                                        staff_name = result12.name;
                                        staff_type = result12.userType;
                                        let obj = {
                                            "uniqueId": "#" + unique,
                                            "tagId": req.body.tagId,
                                            "staffName": result12.name,
                                            "module": "Tag",
                                            "type": result12.userType,
                                            "staffId": req.headers.id,
                                            "documentData": result1,
                                            "action": `Tag data has been ${req.body.tempData}`
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
                                            responseMessage: "Data updated successfully",
                                            result: result1,
                                        });
                                    }
                                })


                        }
                    })

                }


                var uniqueId = []
                for (i = 0; i < result1.length; i++) {
                    uniqueId.push({
                        "id": i,
                        result: result1[i].uniqueId
                    })
                }

                tags.paginate(query, options, (error, result) => {
                    if (error) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server erroror",
                            error
                        });

                    } else {

                        if (req.body.add && !req.body.action) {

                            unique = commonFunction.getCode()
                            tags.find({
                                tagName: req.body.tagName,
                                status: {
                                    $ne: ['DELETE']
                                }
                            }, (error, success) => {
                                if (error) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error"
                                    })
                                } else if (success.length) {
                                    res.send({
                                        responseCode: 400,
                                        responseMessage: "Tag name already exists."
                                    })
                                } else {
                                    tagData = new tags({
                                        uniqueId: "#" + unique,
                                        tagName: req.body.tagName,
                                        postedBy: req.body.postedBy
                                    })
                                    tagData.save(async (err, result) => {
                                        if (err) {
                                            res.send({
                                                responseCode: 500,
                                                responseMessage: "Internal server error"
                                            })
                                        } else {
                                            unique = commonFunction.getCode();

                                            let saveData = await saveDataFun(req.headers.id);

                                            let obj = {
                                                "uniqueId": "#" + unique,
                                                "tagId": req.body.tagId,
                                                "staffName": saveData.name,
                                                "module": "Tag",
                                                "type": saveData.userType,
                                                "staffId": req.headers.id,
                                                "documentData": result,
                                                "action": "Tag has been added.",

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

                                            res.send({
                                                responseCode: 200,
                                                responseMessage: "Tag added successfully ",
                                                result
                                            })
                                        }
                                    })
                                }
                            })
                        } else if (req.body.action && !req.body.add) {
                            tags.findOne({
                                _id: req.body.tagId,
                                status: {
                                    $ne: ['DELETE']
                                }
                            }, (error, success) => {
                                if (error) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error"
                                    })
                                } else if (!success) {
                                    res.send({
                                        responseCode: 404,
                                        responseMessage: "Data not found."
                                    })
                                } else {
                                    if (success.tagName == req.body.tagName) {
                                        saving()
                                    } else {
                                        tags.findOne({
                                            tagName: req.body.tagName,
                                            status: {
                                                $ne: ['DELETE']
                                            }
                                        }, (err_, testData) => {
                                            if (err_) {
                                                res.send({
                                                    responseCode: 500,
                                                    responseMessage: "Internal server error"
                                                })
                                            } else if (!testData) {
                                                saving()
                                            } else {
                                                res.send({
                                                    responseCode: 404,
                                                    responseMessage: "Tag name already exist"
                                                })
                                            }
                                        })

                                    }
                                }
                            })
                        } else {
                            res.send({
                                responseCode: 200,
                                responseMessage: "Data found successfully",
                                result: result,
                                uniqueId: uniqueId.reverse()
                            });


                        }




                    }

                })

            }
        })
    },


    //====================================================== advertisement list with type filter with pagination======================================

    'trade_list': (req, res) => {

        var options = {
            page: req.params.page || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }
        adSchema.paginate({
            status: "ACTIVE"
        }, options, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                });
            } else if (result.length == 0) {
                res.send({
                    responseCode: 404,
                    responseMessage: "Not found !!"
                });
            } else if (result) {
                res.send({
                    responseCode: 200,
                    responseMessage: "Trade lists found  successfully.",
                    result: result
                });
            }
        })

    },

    //==================================================== List of all advertisement ================================================
    'user_advertisement_list': (req, res) => {
        let options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }
        adSchema.paginate({
            status: "ACTIVE"
        }, options, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal Server error",
                    err
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "List shown successfully",
                    result: result
                })
            }
        })
    },


    "tagList": (req, res) => {
        tags.find({}, (err, result) => {
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
    },

    //not use
    //  ========================================================tdit tag api=====================================================//
    "editTag": (req, res) => {
        function saving() {
            tags.findOneAndUpdate({
                _id: req.body.tagId
            }, req.body, {
                    new: true
                }, (err, result1) => {
                    if (error) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server erroror",
                            err
                        });
                    } else {
                        res.send({
                            responseCode: 200,
                            responseMessage: "Data updated successfully",
                            result: result1,
                        });
                    }
                })
        }
        if (req.body.add && !req.body.action) {

            unique = commonFunction.getCode()
            tags.find({
                tagName: req.body.tagName,
                status: {
                    $ne: ['DELETE']
                }
            }, (error, success) => {
                if (error) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error"
                    })
                } else if (success.length) {
                    res.send({
                        responseCode: 400,
                        responseMessage: "Tag name already exists."
                    })
                } else {
                    tagData = new tags({
                        uniqueId: "#" + unique,
                        tagName: req.body.tagName,
                        postedBy: req.body.postedBy
                    })
                    tagData.save((err, result) => {
                        if (err) {
                            res.send({
                                responseCode: 500,
                                responseMessage: "Internal server error"
                            })
                        } else {
                            res.send({
                                responseCode: 200,
                                responseMessage: "Tag successfull added",
                                result
                            })
                        }
                    })
                }
            })
        } else if (req.body.action && !req.body.add) {
            tags.findOne({
                _id: req.body.tagId,
                status: {
                    $ne: ['DELETE']
                }
            }, (error, success) => {
                if (error) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error"
                    })
                } else if (!success) {
                    res.send({
                        responseCode: 404,
                        responseMessage: "Data not found."
                    })
                } else {
                    if (success.tagName == req.body.tagName) {
                        saving()
                    } else {
                        tags.findOne({
                            tagName: req.body.tagName,
                            status: {
                                $ne: ['DELETE']
                            }
                        }, (err_, testData) => {
                            if (err_) {
                                res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal server error"
                                })
                            } else if (!testData) {
                                saving()
                            } else {
                                res.send({
                                    responseCode: 404,
                                    responseMessage: "Tag name already exist"
                                })
                            }
                        })

                    }
                }
            })
        } else {
            tags.remove({
                _id: req.body.tags
            }, (err, result1) => {
                if (error) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server erroror",
                        err
                    });
                } else {
                    res.send({
                        responseCode: 200,
                        responseMessage: "Data deleted successfully",
                        result: result1,
                    });
                }
            })

        }
    },
    "paymentMethodList": (req, res) => {
        console.log('aaaaaaaaaaaaaa')
        paymentSchema.find({ status: { $ne: ["DELETE"] } }, (err, result) => {
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
    },

    // =========================My ad list ============
    'user_ad_list': (req, res) => {

        var options = {
            page: req.body.page || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }
        adSchema.paginate({
            user_id: req.body.userId
        }, options, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                });
            } else if (result.length == 0) {
                res.send({
                    responseCode: 404,
                    responseMessage: "Not found !!"
                });
            } else if (result) {
                res.send({
                    responseCode: 200,
                    responseMessage: "Trade lists found  successfully",
                    result: result
                });
            }
        })

    },

    //========================================================== Request for purchase trade ==================================================================

    "tradeExchangeRequest": (req, res) => {

        unique = commonFunction.getCode()
        adSchema.findOne({
            _id: req.body.adId,
            status: "ACTIVE"
        }).populate("user_id").exec((err, result2) => {
            globalAdId = result2._id;
            if ((result2.user_id._id).toString().toLowerCase() == (req.body.userId).toString().toLowerCase())
                return res.send({
                    responseCode: 201,
                    responseMessage: "You can't buy or sell your own trade"
                })

            var check1 = 0;
            if (err) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error."
                })
            } else if (!result2) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "No Advertisement found"
                })
            } else {
                if (req.body.amount_in_currency >= result2.min_transaction_limit && req.body.amount_in_currency <= result2.max_transaction_limit) {
                    check1++;
                } else {
                    return res.send({
                        responseCode: 500,
                        responseMessage: "Amount should be between min and max limit"
                    })
                }
                if (check1) {
                    User.findOne({
                        _id: req.body.userId,
                        status: "ACTIVE"
                    }, (err, result) => {
                        if (err) {
                            res.send({
                                responseCode: 500,
                                responseMessage: "Internal Server error"
                            })
                        } else if (!result2) {
                            res.send({
                                responseCode: 404,
                                responseMessage: "User not found"
                            })
                        } else {
                            for (i = 0; i < result.blocked_by_me.length; i++) {
                                if (result.blocked_by_me[i].name == result2.user_id.user_name) {
                                    return res.send({
                                        responseCode: 400,
                                        responseMessage: "You have blocked this advertisment owner"
                                    })
                                }
                            }
                            for (j = 0; j < result.blocked_by.length; j++) {

                                if (result.blocked_by[j].name == result2.user_id.user_name) {
                                    return res.send({
                                        responseCode: 400,
                                        responseMessage: "You are blocked by this advertisment owner"
                                    })
                                }
                            }


                            var check = 0;
                            if ((result2.security_options.identfifed_people == true && result2.security_options.sms_verification == true) || (result2.security_options.identfifed_people == true && result2.security_options.sms_verification == false) && result2.security_options.trusted_people == true) {
                                if (result.verified_email == true && result.verified_phone == true && result.kyc_status == "APPROVED") {

                                    let flag = 0;
                                    for (let i of result2.user_id.trusted_by) {

                                        if (i.name == result.user_name) {
                                            flag++;
                                            break;
                                        } else {
                                            check = 0;

                                        }
                                    }
                                    if (flag == 1) {
                                        check++;
                                    }
                                    else {
                                        return res.send({
                                            responseCode: 400,
                                            responseMessage: "First trust the advertisement owner."
                                        })
                                    }
                                } else if (result.verified_email == false) {
                                    return res.send({
                                        responseCode: 400,
                                        responseMessage: "Please verify your email before initiating  the trade"
                                    })
                                }
                                else if (result.verified_phone == false) {
                                    return res.send({
                                        responseCode: 400,
                                        responseMessage: "Please verify your phone number before initiating  the trade"
                                    })
                                }
                                else if (result.kyc_status != "APPROVED") {
                                    return res.send({
                                        responseCode: 400,
                                        responseMessage: "Please do your KYC verification before initiating the trade"
                                    })
                                }
                            } else if (result2.security_options.sms_verification == true && result2.security_options.trusted_people == true) {
                                if (result.verified_email == true && result.verified_phone == true) {
                                    let flag = 0;
                                    for (let i of result2.user_id.trusted_by) {
                                        if (i.name == result.user_name) {
                                            flag++;
                                            break;
                                        } else {
                                            check = 0;

                                        }
                                    }
                                    if (flag == 1) {
                                        check++;
                                    }
                                    else {
                                        return res.send({
                                            responseCode: 400,
                                            responseMessage: "First trust the advertisement owner ."
                                        })
                                    }

                                } else {
                                    return res.send({
                                        responseCode: 400,
                                        responseMessage: "Please verify your Email and Phone number"
                                    })
                                }
                            } else if (result2.security_options.identfifed_people == true) {
                                if (result.verified_email == true && result.verified_phone == true && result.kyc_status == "APPROVED") {
                                    check++;
                                } else {
                                    check = 0;
                                    return res.send({
                                        responseCode: 400,
                                        responseMessage: "Please verify your Email and Phone number or you are not a kyc verified user"
                                    })
                                }
                            } else if (result2.security_options.identfifed_people == true && result2.security_options.sms_verification == true) {
                                if (result.verified_email == true && result.verified_phone == true && result.kyc_status == "APPROVED") {
                                    check++;
                                } else {
                                    check = 0;
                                    return res.send({
                                        responseCode: 400,
                                        responseMessage: "Please verify your Email and Phone number or you are not a kyc verified user"
                                    })
                                }
                            } else if (result2.security_options.sms_verification == true) {
                                if (result.verified_email == true && result.verified_phone == true) {
                                    check++;
                                } else {
                                    check = 0;
                                    return res.send({
                                        responseCode: 400,
                                        responseMessage: "Please verify your Email and Phone number "
                                    })
                                }
                            } else if (result2.security_options.trusted_people == true) {

                                let flag = 0;
                                for (let i of result2.user_id.trusted_by) {
                                    if (i.name == result.user_name) {
                                        flag++;
                                        break;
                                    } else {
                                        check = 0;
                                    }
                                }
                                if (flag > 0) {
                                    check++;
                                }
                                else {
                                    return res.send({
                                        responseCode: 404,
                                        responseMessage: "First trust the advertisement owner "
                                    })
                                }
                            } else if ((result2.security_options.identfifed_people == false && result2.security_options.sms_verification == false && result2.security_options.trusted_people == false)) {
                                check++;
                            }


                        }
                        if (check > 0) {
                            configuration.find({}).lean().exec((err, result67) => {
                                var arr = [];
                                arr = result67;
                                let index = result67.length - 1;
                                var adminFee = result67[index].tradeFee;


                                if (result2.type_of_trade_other == "buy") {
                                    if (result2.user_id.btc.total < 0.0)
                                        return res.send({
                                            responseCode: 201,
                                            responseMessage: "Seller do not have any BTC"
                                        })
                                    var trade_amount = req.body.amount_of_cryptocurrency;
                                    var finalBTC = result2.user_id.btc.total
                                    let percentAdminFee = new BigNumber(adminFee).dividedBy(new BigNumber(100));
                                    var transactionFee = new BigNumber(trade_amount).multipliedBy(new BigNumber(percentAdminFee)); // calculating 1% of total amount

                                    var escrowAmount = new BigNumber(transactionFee).plus(new BigNumber(trade_amount))

                                    finalBTC = new BigNumber(finalBTC).minus(new BigNumber(escrowAmount))
                                    if (new BigNumber(finalBTC).isLessThan(new BigNumber(0))) {
                                        return res.send({
                                            responseCode: 400,
                                            responseMessage: "Seller don't have enough BTC"
                                        })
                                    }
                                    trade.findOne({ "request_status": "Pending", tradeOpenId: req.body.userId }).lean().exec((err, checkTrade) => {
                                        console.log('checkTradecheckTrade', checkTrade)
                                        if (checkTrade) {
                                            return res.send({
                                                responseCode: 201,
                                                responseMessage: "You are already in a trade!"
                                            })
                                        } else {
                                            var obj = new trade({
                                                uniqueId: "#" + unique,
                                                buyerId: result._id,
                                                userId: result2.user_id._id,
                                                tradeOpenId: req.body.userId,
                                                addUniqueId: result2.uniqueId,
                                                amount_in_currency: req.body.amount_in_currency,
                                                amount_of_cryptocurrency: req.body.amount_of_cryptocurrency,
                                                trade_owner_name: result.user_name,
                                                advertisement_id: result2._id,
                                                payment_method: result2.payment_method,
                                                payment_window_time: result2.payment_time,
                                                remainingPaymentTime: result2.payment_time * 60,
                                                type_of_trade_original: result2.type_of_trade_original,
                                                type_of_trade_other: result2.type_of_trade_other,
                                                trade_type: result2.type_of_trade_other,
                                                currency_type: result2.currency_type,
                                                country: result2.location,
                                                advertisement_owner_name: result2.user_name,
                                                dispute_time: result2.dispute_time,
                                                comment: req.body.comment,
                                                exchangeRate: result2.price_equation,
                                                price_equation: result2.price_equation,
                                                buyer: [{
                                                    buyer_id: result._id,
                                                    buyer_name: result.user_name,
                                                    buyer_email: result.email
                                                }],
                                                seller: [{
                                                    seller_id: result2.user_id._id,
                                                    seller_name: result2.user_name,
                                                    seller_email: result2.user_email
                                                }]
                                            })
                                            obj.save((err, result11) => {
                                                gloabalTradeId = result11._id;
                                                if (err) res.send({
                                                    code: 500,
                                                    message: "Internal server error!!"
                                                })
                                                else {

                                                    User.findOneAndUpdate({
                                                        '_id': result2.user_id._id
                                                    }, {
                                                            $set: {
                                                                "btc.total": finalBTC
                                                            }
                                                        }, (err, result111) => {

                                                            var obj = new escrow({
                                                                uniqueId: "#" + unique,
                                                                seller_id: result2.user_id._id,
                                                                seller_name: result2.user_id.user_name,
                                                                seller_email: result2.user_id.email,
                                                                buyer_id: result._id,
                                                                trade_amount: req.body.amount_of_cryptocurrency,
                                                                buyer_name: result.user_name,
                                                                buyer_email: result.email,
                                                                trade_id: result11._id,
                                                                amount_coin: escrowAmount,
                                                                total_coin: escrowAmount
                                                            })
                                                            obj.save((err, result211) => {
                                                                if (err) {
                                                                    return res.send({
                                                                        code: 500,
                                                                        message: "Internal server error!!"
                                                                    })
                                                                } else {
                                                                    //=============================Abhishek Start=================================//
                                                                    var obj1 = new TransactionModel({
                                                                        send_amount: escrowAmount,
                                                                        amount_coin: req.body.amount_of_cryptocurrency,
                                                                        userId: result2.user_id._id,
                                                                        toAddress: result.btc.addresses[0].addr
                                                                    });
                                                                    obj1.save((err22, result22) => {
                                                                        if (err22) {
                                                                            return res.send({
                                                                                code: 500,
                                                                                message: "Internal server error!!"
                                                                            })
                                                                        }
                                                                        else {

                                                                            var subject = "Regarding trade request on your advertisement";
                                                                            var email = result11.seller[0].seller_email;
                                                                            if (email) {
                                                                                email = email;
                                                                            } else {
                                                                                email = 'la-najmuddin@mobiloitte.com'
                                                                            }
                                                                            var message = result11.buyer[0].buyer_name + " has requested for a new trade " + result11.uniqueId;
                                                                            commonFunction.sendMailDynamic(email, subject, message, "Trade Request", (error, sent) => {
                                                                                if (error) {
                                                                                    return res.send({
                                                                                        responseCode: 500,
                                                                                        responseMessage: "Error occured.", error
                                                                                    });
                                                                                } else {
                                                                                    //SMS 
                                                                                    var Mobile = result111.country_code + result111.phone_number;
                                                                                    sender.sendSms(message, 'swiftpro', false, Mobile)
                                                                                        .then(function (response) {
                                                                                            console.log('Sucess in Message sent in Mobile------------------------------------', response);
                                                                                        })
                                                                                        .catch(function (err) {
                                                                                            console.log('Error in Message sent in Mobile------------------------------------', err)
                                                                                        })


                                                                                    let socket = require('../../server').socket;
                                                                                    let onlineUsers = require('../../server').onlineUsers;
                                                                                    let sockets = require('../../server').sockets
                                                                                    if (onlineUsers[result111._id]) {
                                                                                        for (var i = 0; i < onlineUsers[result111._id].socketId.length; i++) {
                                                                                            try {

                                                                                                sockets[onlineUsers[result111._id].socketId[i]].socket.emit("getUserBalance", {
                                                                                                    balance: result111.btc.total
                                                                                                });
                                                                                            }
                                                                                            catch (err) {
                                                                                                console.log("Error Occured", err);
                                                                                            }

                                                                                        }
                                                                                    }

                                                                                    return res.send({
                                                                                        responseCode: 200,
                                                                                        responseMessage: "Trade request sent successfully",
                                                                                        result: result11,
                                                                                        addOwnerId: result2.user_id._id

                                                                                    })
                                                                                }
                                                                            })

                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        })

                                                }
                                            })
                                        }
                                    })

                                } else {
                                    if (result.btc.total < req.body.amount_of_cryptocurrency)
                                        return res.send({
                                            responseCode: 201,
                                            responseMessage: "You do not have enough BTC"
                                        })
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    var trade_amount = req.body.amount_of_cryptocurrency;
                                    var finalBTC = result.btc.total;
                                    //var transactionFee = trade_amount * (1 / 100); // calculating 1% of total amount
                                    finalBTC = new BigNumber(finalBTC).minus(new BigNumber(trade_amount))
                                    if (new BigNumber(finalBTC).isLessThan(new BigNumber(0.00))) {
                                        return res.send({
                                            responseCode: 400,
                                            responseMessage: "You don't have enough BTC"
                                        })
                                    }
                                    trade.findOne({ "request_status": "Pending", tradeOpenId: req.body.userId }).lean().exec((err, checkTrade) => {
                                        console.log('checkTradecheckTrade', checkTrade)
                                        if (checkTrade) {
                                            return res.send({
                                                responseCode: 201,
                                                responseMessage: "You are already in a trade!"
                                            })
                                        } else {
                                            var obj = new trade({
                                                uniqueId: "#" + unique,
                                                buyerId: result2.user_id._id,
                                                tradeOpenId: req.body.userId,
                                                addUniqueId: result2.uniqueId,
                                                userId: result2.user_id._id,
                                                amount_in_currency: req.body.amount_in_currency,
                                                amount_of_cryptocurrency: req.body.amount_of_cryptocurrency,
                                                trade_owner_name: result.user_name,
                                                advertisement_id: result2._id,
                                                payment_method: result2.payment_method,
                                                payment_window_time: result2.payment_time,
                                                remainingPaymentTime: result2.payment_time * 60,
                                                type_of_trade_original: result2.type_of_trade_original,
                                                type_of_trade_other: result2.type_of_trade_other,
                                                trade_type: result2.type_of_trade_other,
                                                currency_type: result2.currency_type,
                                                country: result2.location,
                                                advertisement_owner_name: result2.user_name,
                                                dispute_time: result2.dispute_time,
                                                comment: req.body.comment,
                                                exchangeRate: result2.price_equation,
                                                seller: [{
                                                    seller_id: result._id,
                                                    seller_name: result.user_name,
                                                    seller_email: result.email
                                                }],
                                                buyer: [{
                                                    buyer_id: result2.user_id._id,
                                                    buyer_name: result2.user_name,
                                                    buyer_email: result2.user_email
                                                }]
                                            })
                                            obj.save((err, result11) => {
                                                gloabalTradeId = result11._id;
                                                if (err) res.send({
                                                    code: 500,
                                                    message: "Internal server error!!"
                                                })
                                                else {

                                                    User.findOneAndUpdate({
                                                        '_id': result._id
                                                    }, {
                                                            $set: {
                                                                "btc.total": finalBTC
                                                            }
                                                        }, (err, result111) => {
                                                            var obj = new escrow({
                                                                trade_amount: req.body.amount_of_cryptocurrency,

                                                                buyer_id: result2.user_id._id,
                                                                buyer_name: result2.user_id.user_name,
                                                                buyer_email: result2.user_id.email,
                                                                seller_id: result._id,
                                                                seller_name: result.user_name,
                                                                seller_email: result.email,
                                                                trade_id: result11._id,
                                                                amount_coin: req.body.amount_of_cryptocurrency,
                                                                total_coin: req.body.amount_of_cryptocurrency
                                                            })
                                                            obj.save((err, result211) => {

                                                                if (err) {
                                                                    return res.send({
                                                                        code: 500,
                                                                        message: "Internal server error!!"
                                                                    })
                                                                } else {
                                                                    //============================Abhishek Start==============================//
                                                                    let obj1 = new TransactionModel({
                                                                        user_name: result.user_name,
                                                                        user_email: result.user_email,
                                                                        send_amount: req.body.amount_of_cryptocurrency,
                                                                        userId: req.body.userId,
                                                                        toAddress: result.btc.addresses[0].addr
                                                                    })
                                                                    obj1.save((err23, result23) => {
                                                                        if (err23) {
                                                                            console.log("Err 23 is============>", err23);
                                                                            return res.send({
                                                                                code: 500,
                                                                                message: "Internal server error!!"
                                                                            })
                                                                        }
                                                                        else {


                                                                            var subject = "Regarding trade request on your advertisement";
                                                                            var email = result11.buyer[0].buyer_email;
                                                                            var message = result11.seller[0].seller_email + " has requested for a new trade " + result11.uniqueId;
                                                                            commonFunction.sendMailDynamic(email, subject, message, "Trade Request", (error, sent) => {
                                                                                if (error) {
                                                                                    return res.send({
                                                                                        responseCode: 500,
                                                                                        responseMessage: "Error occured.", error
                                                                                    });
                                                                                } else {

                                                                                    //SMS 
                                                                                    var Mobile = result111.country_code + result111.phone_number;
                                                                                    sender.sendSms(message, 'swiftpro', false, Mobile)
                                                                                        .then(function (response) {
                                                                                            console.log('Sucess in Message sent in Mobile------------------------------------', response);
                                                                                        })
                                                                                        .catch(function (err) {
                                                                                            console.log('Error in Message sent in Mobile------------------------------------', err)
                                                                                        })

                                                                                    let onlineUsers = require('../../server').onlineUsers;
                                                                                    let sockets = require('../../server').sockets
                                                                                    for (var i = 0; i < onlineUsers[result111._id].socketId.length; i++) {
                                                                                        try {
                                                                                            console.log("Socket id are=======", onlineUsers[result111._id]);

                                                                                            sockets[onlineUsers[result111._id].socketId[i]].socket.emit("getUserBalance", {
                                                                                                balance: result111.btc.total
                                                                                            });
                                                                                        }
                                                                                        catch (err) {
                                                                                            console.log("Error Occured", err);
                                                                                        }

                                                                                    }


                                                                                    return res.send({
                                                                                        responseCode: 200,
                                                                                        responseMessage: "Trade request sent successfully",
                                                                                        result: result11,
                                                                                        addOwnerId: result2.user_id._id

                                                                                    })

                                                                                }
                                                                            })

                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        })

                                                }
                                            })
                                        }

                                    })
                                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                                }
                            })
                        }
                    })
                }
            }
        })
    },



    //==============================================================get payment method list api=====================================================//

    //not use 
    //========================================================Buy Trade list api=====================================================//
    "getListCompleteBuyTrade": (req, res) => {
        var options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }
        var query = {
            $and: [{
                buyerId: req.body.userId
            }, {
                request_status: 'Completed'
            }]
        }
        trade.paginate(query, options, (error, result) => {
            if (error) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (result.length == 0) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Data not found"
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "Buy trade list found successfully",
                    Data: result
                });
            }
        })
    },


    // not use
    //============================================================ Sell Trade list api=====================================================//
    "getSellTradeList": (req, res) => {
        var options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }
        var query = {
            $and: [{
                "seller.0.seller_id": req.body.userId
            }, {
                request_status: 'Completed'
            }]
        }
        trade.paginate(query, options, (error, result) => {
            if (error) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (result.length == 0) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Data not found"
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "Buy trade list found successfully",
                    Data: result
                });
            }
        })
    },
    //============================================================cancel trade api==================================================================//


    "cancelTrade": (req, res) => {

        
        if (!req.body.tradeId) {
            return res.send({
                responseCode: 404,
                responseMessage: "Trade id not found"
            })
        } else {
            trade.findOne({
                _id: req.body.tradeId,  status:{$ne:"CANCEL"}
            }, (err, result) => {
                if (err) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal servver error"
                    })
                } else if (!result) {
                    res.send({
                        responseCode: 404,
                        responseMessage: "Trade is either disabled or completed"
                    })
                } else {
                    function saving() {
                        escrow.findOne({
                            trade_id: req.body.tradeId
                        }, (err, result1) => {
                            if (err) {
                                res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal servver error"
                                })
                            } else if (!result1) {
                                res.send({
                                    responseCode: 404,
                                    responseMessage: "No escrow wallet created with this trade id data found"
                                })
                            } else {
                       
                                    User.findOne({
                                        _id: result1.seller_id
                                    }, (err, result2) => {
                                        console.log("4", result2);
                                        if (err) {
                                            res.send({
                                                responseCode: 500,
                                                responseMessage: "Internal servver error"
                                            })
                                        } else if (!result) {
                                            res.send({
                                                responseCode: 404,
                                                responseMessage: "No seller found"
                                            })
                                        } else {
                                            var oldAmount = result2.btc.total
                                            let newAmount = new BigNumber(oldAmount).plus(new BigNumber(result1.total_coin))
                                            User.findOneAndUpdate({
                                                _id: result1.seller_id
                                            }, {
                                                    $set: {
                                                        "btc.total": newAmount
                                                    }
                                                }, {
                                                    new: true
                                                }, (err, result3) => {
                                                    if (err) {
                                                        res.send({
                                                            responseCode: 500,
                                                            responseMessage: "Internal servver error"
                                                        })
                                                    } else {
                                                        escrow.findOneAndUpdate({
                                                            trade_id: req.body.tradeId
                                                        }, {
                                                                $set: {
                                                                    amount_coin: 0
                                                                }
                                                            }, {
                                                                new: true
                                                            }, (err, result4) => {
                                                                if (err) {
                                                                    res.send({
                                                                        responseCode: 500,
                                                                        responseMessage: "Internal servver error"
                                                                    })
                                                                } else {
                                                                    trade.findOneAndUpdate({
                                                                        _id: req.body.tradeId
                                                                    }, {
                                                                            $set: {
                                                                                status: "CANCEL",
                                                                                request_status: "Cancel",
                                                                                cancelReason: req.body.reason,
                                                                                remainingPaymentTime: 0
                                                                            }
                                                                        }, {
                                                                            new: true
                                                                        }, (err, ress) => {
                                                                            //============================Abhishek Start===================//
                                                                            var obj1 = new TransactionModel({
    
                                                                                user_name: result3.user_name,
                                                                                userId: result1.seller_id,
                                                                                recieve_amount: new BigNumber(result1.amount_coin)
    
                                                                            })
    
                                                                            obj1.save((err24, result24) => {
                                                                                if (err24) {
                                                                                    console.log("Error 24 is==========>", err24);
                                                                                }
                                                                                else {
    
    
    
                                                                                    var subject = "Regarding trade cancellation by buyer";
                                                                                    var email = ress.seller[0].seller_email;
                                                                                    var message = ress.buyer[0].buyer_name + " has canceled the ongoing trade  " + result.uniqueId;
                                                                                    commonFunction.sendMailDynamic(email, subject, message, "Cancel Trade", (error, sent) => {
                                                                                        if (error) {
                                                                                            return res.send({
                                                                                                responseCode: 500,
                                                                                                responseMessage: "Error occured.", error
                                                                                            });
                                                                                        } else {
                                                                                            User.findOne({ _id: ress.seller[0].seller_id }, (err123, result123) => {
                                                                                                if (err123) return res.send({ responseCode: 500, responseMessage: "Error occured.", error });
                                                                                                else {
                                                                                                    //SMS
                                                                                                    var Mobile = result123.country_code + result123.phone_number;
                                                                                                    sender.sendSms(message, 'swiftpro', false, Mobile)
                                                                                                        .then(function (response) {
                                                                                                            console.log('Sucess in Message sent in Mobile------------------------------------', response);
                                                                                                        })
                                                                                                        .catch(function (err) {
                                                                                                            console.log('Error in Message sent in Mobile------------------------------------', err)
                                                                                                        })
                                                                                                    console.log("mail sent>>>>>>>>>>>2796")
                                                                                                }
                                                                                            })
    
                                                                                            let onlineUsers = require('../../server').onlineUsers;
                                                                                            let sockets = require('../../server').sockets
                                                                                            // for (var i = 0; i < onlineUsers[result3._id].socketId.length; i++) {
                                                                                            //     try {
                                                                                            //         console.log("Socket id are=======", onlineUsers[result3._id]);
    
                                                                                            //         sockets[onlineUsers[result3._id].socketId[i]].socket.emit("getUserBalance", {
                                                                                            //             balance: result3.btc.total
                                                                                            //         });
                                                                                            //     }
                                                                                            //     catch (err) {
                                                                                            //         console.log("Error Occured", err);
                                                                                            //     }
    
                                                                                            // }
                                                                                            return res.send({
                                                                                                responseCode: 200,
                                                                                                responseMessage: "Trade cancelled successfully",
                                                                                                result: result4
    
                                                                                            })
                                                                                        }
                                                                                    })
    
                                                                                }
                                                                            })
    
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
                    //.......
                    if (result.assignManager) {
                        var totalAssign = []
                        if (result.employeeId) {
                            totalAssign.push(
                                result.assignManager)
                            totalAssign.push(
                                result.employeeId)
                        }
                        else {

                            totalAssign.push(result.assignManager)
                        }

                        User.update({ "_id": { $in: totalAssign } }, { $pull: { disputeTrades: req.body.tradeId } }, { new: true, multi: true }, (err, result) => {
                            if (err) {
                                console.log(er1)
                            } else {
                                saving()
                            }
                        })

                    }
                    else {
                        saving()
                    }

                    //.......
                }
            })
        }
    },
    //============================================================ get list of cancelled trade==================================================================//
    "getCancelTradeList": (req, res) => {
        var options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }
        var query = {
            $and: [{
                $or: [{
                    buyerId: req.body.userId
                }, {
                    "seller.0.seller_id": req.body.userId
                }]
            }, {
                request_status: 'Cancel'
            }]
        }
        trade.paginate(query, options, (error, result) => {
            if (error) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (result.length == 0) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Data not found"
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "Cancelled trade list found successfully",
                    Data: result
                });
            }
        })
    },
    //============================================================ get list of complete trade==================================================================//
    "getCompleteTradeList": (req, res) => {
        var options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }
        var query = {
            $and: [{
                $or: [{
                    buyerId: req.body.userId
                }, {
                    "seller.0.seller_id": req.body.userId
                }]
            }, {
                request_status: 'Complete'
            }]
        }
        trade.paginate(query, options, (error, result) => {
            if (error) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (result.length == 0) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Data not found"
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "Completed trade list found successfully",
                    Data: result
                });
            }
        })
    },
    //============================================================ get list of All trade==================================================================//
    "getAllTradeList": (req, res) => {

        var options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }
        var query = {
            $or: [{
                buyerId: req.body.userId
            }, {
                "seller.0.seller_id": req.body.userId
            }]
        };
        trade.paginate(query, options, (error, result) => {
            if (error) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (result.length == 0) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Data not found"
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "All trade list found successfully",
                    Data: result
                });
            }
        })
    },
    //===============================================open trade posted by user============================================================================
    "openTradeList": (req, res) => {
        var options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }
        var query = {
            $and: [{
                $or: [{
                    buyerId: req.body.userId
                }, {
                    "seller.0.seller_id": req.body.userId
                }]
            }, {
                request_status: 'Pending'
            }]
        }
        trade.paginate(query, options, (error, result) => {
            if (error) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (result.length == 0) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Data not found"
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "Pending trade list found successfully",
                    Data: result
                });
            }
        })
    },
    //=============================================== list of Dispute trade =========================================================================
    "disputeTradeList": (req, res) => {
        var options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }
        var query = {
            $and: [{
                $or: [{
                    buyerId: req.body.userId
                }, {
                    "seller.0.seller_id": req.body.userId
                }]
            }, {
                request_status: 'Dispute'
            }]
        }
        trade.paginate(query, options, (error, result) => {
            if (error) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (result.length == 0) {
                return res.send({
                    responseCode: 404,
                    responseMessage: "Data not found"
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "Dispute trade list found successfully",
                    Data: result
                });
            }
        })
    },
    //=============================================== Dispute trade =========================================================================
    "disputeTrade": async (req, res) => {


        // trade.findOneAndUpdate({
        //     _id: req.body.tradeId
        // }, {
        //         $set: {
        //             assignManagerDate: Date.now(),
        //             disputeDate: Date.now(),
        //             // currentMonth: new Date().getMonth(),
        //             // dispute_status: true,
        //             // disputeDone: true,
        //             // disputeReason: req.body.disputeReason,
        //             // status: req.body.status,
        //             // request_status: req.body.request_status,
        //             // disputeUniqueId: "#" + unique
        //         }
        //     }, {
        //         new: true
        //     },

        let obj = {
            status: req.body.status,
            disputeReason: req.body.disputeReason,
            request_status: req.body.request_status,
            tradeId: req.body.tradeId

        }




        let disputeData = await escrowController.assignTradeToManager1(obj)
        res.send(disputeData)

        //     trade.findOne({
        //             _id: req.body.tradeId
        //         },  
        //         (err, result) => {
        //             if (err) {
        //                 res.send({
        //                     responseCode: 500,
        //                     responseMessage: "Internal server error"
        //                 })
        //             } else {
        //                 res.send({
        //                     responseCode: 200,
        //                     responseMessage: "Dispute done successfully",
        //                     result: result
        //                 })
        //             }
        //         })
    },
    //=============================================== Payment recieved =========================================================================





    "paymentReceived": (req, res) => {

        let sellerId, buyerId;
        trade.findOne({
            _id: req.body.tradeId, request_status: { $ne: ["Pending"] }
        }, (err, result) => {

            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error.", err
                })
            } else if (!result) {
                return res.send({
                    responseCode: 400,
                    responseMessage: "Buyer's didn't confirm any payment"
                })
            } else if (result) {
                User.findOne({
                    _id: result.buyerId
                }, (err1, result2) => {
                    if (err) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal servver error..", err1
                        })
                    } else {

                        function saving() {

                            buyerId = result.buyerId;
                            if (result.type_of_trade_original == "sell") {

                                escrow.findOne({
                                    trade_id: req.body.tradeId
                                }, (err11, result1) => {
                                    if (err) {
                                        res.send({
                                            responseCode: 500,
                                            responseMessage: "Internal server error...", err11
                                        })
                                    } else {

                                        var oldAmount = result2.btc.total
                                        var finalAmount = (new BigNumber(result1.total_coin).minus(new BigNumber(result1.trade_amount)));
                                        //var finalValue = result1.amount_coin * (1 / 100);
                                        trade.findOneAndUpdate({ _id: req.body.tradeId }, {
                                            $set: {
                                                transactionFee: finalAmount,

                                            }
                                        }, (err, res) => { })

                                        let newAmount = new BigNumber(oldAmount).plus(new BigNumber(result1.trade_amount))
                                        User.findOneAndUpdate({
                                            _id: result1.buyer_id
                                        }, {
                                                $set: {
                                                    "btc.total": newAmount
                                                }
                                            }, (err111, result3) => {

                                                if (err111) {
                                                    res.send({
                                                        responseCode: 500,
                                                        responseMessage: "Internal servver error....", err111
                                                    })
                                                } else {
                                                    let onlineUsers = require('../../server').onlineUsers;
                                                    let sockets = require('../../server').sockets
                                                    for (var i = 0; i < onlineUsers[buyerId].socketId.length; i++) {
                                                        try {

                                                            sockets[onlineUsers[buyerId].socketId[i]].socket.emit("getUserBalance", {
                                                                balance: result3.btc.total
                                                            });
                                                        }
                                                        catch (err) {
                                                            console.log("Error Occured", err);
                                                        }

                                                    }
                                                    escrow.findOneAndUpdate({
                                                        trade_id: req.body.tradeId
                                                    }, {
                                                            $set: {
                                                                amount_coin: 0
                                                            }
                                                        }, {
                                                            new: true
                                                        }, (err, result4) => {
                                                            console.log("Result4 is=========", result4);
                                                            if (err) {
                                                                res.send({
                                                                    responseCode: 500,
                                                                    responseMessage: "Internal server error"
                                                                })
                                                            } else {
                                                                trade.findOneAndUpdate({
                                                                    _id: req.body.tradeId
                                                                }, {
                                                                        $set: {
                                                                            dispute_status: false,
                                                                            received_status: req.body.received_status,
                                                                            request_status: req.body.request_status, status: req.body.status,
                                                                            remainingPaymentTime: 0
                                                                        }
                                                                    }, {
                                                                        new: true
                                                                    }, (err, result555) => {
                                                                        if (err) {
                                                                            return res.send({
                                                                                responseCode: 500,
                                                                                responseMessage: "Internal server error3060"
                                                                            })
                                                                        } else {

                                                                            console.log('result555result555result555', result555)
                                                                            User.findOne({
                                                                                "userType": "ADMIN"
                                                                            }, (err, result123) => {
                                                                                if (err) {
                                                                                    return res.send({
                                                                                        code: 500,
                                                                                        message: "Internal server error!!"
                                                                                    })
                                                                                } else {
                                                                                    var adminTotal = result123.btc.total;
                                                                                    var transactionFee = new BigNumber(adminTotal).plus(new BigNumber(finalAmount))

                                                                                    let obj1 = new TransactionModel({

                                                                                        recieve_amount: result1.trade_amount,
                                                                                        userId: result1.buyer_id,
                                                                                        toAddress: result2.btc.addresses[0].addr
                                                                                    })
                                                                                    obj1.save((err23, result23) => {
                                                                                        if (err23) {
                                                                                            return res.send({
                                                                                                code: 500,
                                                                                                message: "Internal server error!!"
                                                                                            })
                                                                                        }
                                                                                        else {

                                                                                        }
                                                                                    })


                                                                                    var Mobile = result2.country_code + result2.phone_number;
                                                                                    var message = "The Ongoing trade " + result555.uniqueId + " is successfully completed";

                                                                                    sender.sendSms(message, 'swiftpro', false, Mobile)
                                                                                        .then(function (response) {
                                                                                            console.log('Sucess in Message sent in Mobile------------------------------------', response);
                                                                                        })
                                                                                        .catch(function (err) {
                                                                                            console.log('Error in Message sent in Mobile------------------------------------', err123)
                                                                                        })
                                                                                    res.send({
                                                                                        responseCode: 200,
                                                                                        responseMessage: "BTC released successfully",
                                                                                        result: result555
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
                                configuration.find({}).lean().exec((err, resu) => {
                                    var arr = [];
                                    arr = resu.reverse();
                                    adminFee = arr[0].tradeFee;
                                    escrow.findOne({
                                        trade_id: req.body.tradeId
                                    }, (err, result1) => {
                                        if (err) {
                                            res.send({
                                                responseCode: 500,
                                                responseMessage: "Internal servver error2.", err
                                            })
                                        } else {

                                            var oldAmount = result2.btc.total
                                            let percentAdminFee = new BigNumber(adminFee).dividedBy(new BigNumber(100));
                                            var finalValue = (new BigNumber(result1.trade_amount).multipliedBy(new BigNumber(percentAdminFee)));
                                            trade.findOneAndUpdate({ _id: req.body.tradeId }, { $set: { transactionFee: finalValue } }, (err, res) => { })
                                            var finalAmount = result1.total_coin - finalValue;
                                            let newAmount = new BigNumber(oldAmount).plus(new BigNumber(finalAmount))
                                            User.findOneAndUpdate({
                                                _id: result1.buyer_id
                                            }, {
                                                    $set: {
                                                        "btc.total": newAmount
                                                    }
                                                }, (err1, result3) => {
                                                    if (err1) {
                                                        res.send({
                                                            responseCode: 500,
                                                            responseMessage: "Internal servver error22", err1
                                                        })
                                                    } else {
                                                        let onlineUsers = require('../../server').onlineUsers;
                                                        let sockets = require('../../server').sockets
                                                        for (var i = 0; i < onlineUsers[buyerId].socketId.length; i++) {
                                                            try {
                                                                console.log("Socket id are=======", onlineUsers[buyerId]);

                                                                sockets[onlineUsers[buyerId].socketId[i]].socket.emit("getUserBalance", {
                                                                    balance: result3.btc.total
                                                                });
                                                            }
                                                            catch (err) {
                                                                console.log("Error Occured", err);
                                                            }

                                                        }

                                                        escrow.findOneAndUpdate({
                                                            trade_id: req.body.tradeId
                                                        }, {
                                                                $set: {
                                                                    amount_coin: 0
                                                                }
                                                            }, {
                                                                new: true
                                                            }, (err, result4) => {
                                                                if (err) {
                                                                    res.send({
                                                                        responseCode: 500,
                                                                        responseMessage: "Internal server error 3146", err
                                                                    })
                                                                } else {
                                                                    trade.findOneAndUpdate({
                                                                        _id: req.body.tradeId
                                                                    }, {
                                                                            $set: {
                                                                                dispute_status: false,
                                                                                status: req.body.status,
                                                                                received_status: req.body.received_status,
                                                                                request_status: req.body.request_status,
                                                                                remainingPaymentTime: 0
                                                                            }
                                                                        }, {
                                                                            new: true
                                                                        }, (err, result555) => {
                                                                            if (err) {
                                                                                return res.send({
                                                                                    responseCode: 500,
                                                                                    responseMessage: "Internal server error3163", err
                                                                                })
                                                                            } else {
                                                                                User.findOne({
                                                                                    "userType": "ADMIN"
                                                                                }, (err, result123) => {
                                                                                    if (err) {
                                                                                        return res.send({
                                                                                            code: 500,
                                                                                            message: "Internal server error!!3116"
                                                                                        })
                                                                                    } else {
                                                                                        var adminTotal = result123.btc.total;
                                                                                        var transactionFee = (new BigNumber(adminTotal).plus(new BigNumber(finalValue)))

                                                                                        var sellerId = result.seller[0].seller_id;
                                                                                        User.findOne({
                                                                                            _id: sellerId
                                                                                        }, (err1, sellerDetails) => {
                                                                                            if (err) {
                                                                                                res.send({
                                                                                                    responseCode: 500,
                                                                                                    responseMessage: "Internal servver error..", err1
                                                                                                })
                                                                                            } else {
                                                                                                let obj1 = new TransactionModel({
                                                                                                    user_name: result2.user_name,
                                                                                                    user_email: result2.user_email,
                                                                                                    recieve_amount: finalAmount.toFixed(8),
                                                                                                    userId: result2._id,
                                                                                                    fromAddress: sellerDetails.btc.addresses[0].addr,
                                                                                                    toAddress: sellerDetails.btc.addresses[0].addr
                                                                                                })
                                                                                                obj1.save((err23, result23) => {
                                                                                                    if (err23) {
                                                                                                        return res.send({
                                                                                                            code: 500,
                                                                                                            message: "Internal server error!!"
                                                                                                        })
                                                                                                    }
                                                                                                    else {

                                                                                                    }
                                                                                                })

                                                                                            }
                                                                                        })

                                                                                        // save transation into database

                                                                                        var Mobile = result2.country_code + result2.phone_number;
                                                                                        var message = "The Ongoing trade " + result555.uniqueId + " is successfully completed"
                                                                                        var config = {
                                                                                            AWS: {
                                                                                                accessKeyId: 'AKIAIXZDX73MUUGCBGZQ',
                                                                                                secretAccessKey: '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',
                                                                                                region: 'us-east-1',
                                                                                            },
                                                                                            topicArn: aws_topic,
                                                                                        };
                                                                                        var sender = new Sender(config);
                                                                                        sender.sendSms(message, 'swiftpro', false, Mobile)
                                                                                            .then(function (response) {
                                                                                                console.log('Sucess in Message sent in Mobile------------------------------------', response);
                                                                                            })
                                                                                            .catch(function (err) {
                                                                                                console.log('Error in Message sent in Mobile------------------------------------', err123)
                                                                                            })
                                                                                        res.send({
                                                                                            responseCode: 200,
                                                                                            responseMessage: "BTC released successfully",
                                                                                            result: result4
                                                                                        })
                                                                                        //     }
                                                                                        // })
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
                                })
                            }
                        }
                        if (result.assignManager) {
                            var totalAssign = []
                            if (result.employeeId) {
                                totalAssign.push(
                                    result.assignManager)
                                totalAssign.push(
                                    result.employeeId)
                            }
                            else {

                                totalAssign.push(result.assignManager)
                            }

                            User.update({ "_id": { $in: totalAssign } }, { $pull: { disputeTrades: req.body.tradeId } }, { new: true, multi: true }, (err, result) => {
                                if (err) {
                                    console.log(er1)
                                } else {
                                    saving()
                                }
                            })
                        }
                        else {
                            saving()
                        }

                    }
                })
            }
        })
    },
    //=============================================== api for upload document =========================================================================
    "uploadDocument": (req, res) => {
        let form = new multiparty.Form();
        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Unsupported content type"
                })
            } else {
                trade.findOne({
                    _id: fields.tradeId
                }, (error, result) => {
                    if (error) {
                        return res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error"
                        })
                    } else if (!result) {
                        return res.send({
                            responseCode: 500,
                            responseMessage: "Trade Id is not correct"
                        })
                    } else {
                        cloudinary.v2.uploader.upload(files.file[0].path, {
                            resource_type: "auto"
                        }, (error2, result2) => {
                            if (error2) {
                                return res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal server error"
                                })
                            } else {
                                var value = {
                                    "document": result2.secure_url,
                                    "userId": fields.userId
                                }
                                trade.findByIdAndUpdate({
                                    "_id": fields.tradeId
                                }, {
                                        $push: {
                                            "uploadDocs": value
                                        }
                                    }, {
                                        new: true
                                    }, (error3, result3) => {
                                        if (error3) {
                                            return res.send({
                                                responseCode: 500,
                                                responseMessage: "Internal server error"
                                            })
                                        } else {
                                            res.send({
                                                responseCode: 200,
                                                responseMessage: "Document uploaded successfully",
                                                Data: result3.uploadDocs
                                            });
                                        }
                                    })
                            }
                        })
                    }
                })
            }
        })
    },
    //=============================================== api for get uploaded document =========================================================================
    "getUploadedDocuments": (req, res) => {
        var options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            },
        }
        trade.paginate({
            _id: req.body.tradeId
        }, options, (error, result) => {
            if (error) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (result.length == 0) {
                return res.send({
                    responseCode: 500,
                    responseMessage: "Trade Id is not correct"
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "Document list found successfully",
                    Data: result.docs[0].uploadDocs
                })
            }
        })
    },
    //=============================================== i have paid trade =========================================================================


    "iHavePaidTrade": (req, res) => {
        trade.findOneAndUpdate({
            _id: req.body.tradeId
        }, {
                $set: {
                    paid_status: req.body.paid_status,
                    status: req.body.status,
                    request_status: req.body.request_status
                }
            }, {
                new: true
            }, (err, result) => {
                if (err) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error"
                    })
                } else {
                    var subject = "Regarding payment confirmation by buyer"
                    var email = result.seller[0].seller_email;
                    var message = result.buyer[0].buyer_name + " has confirmed payment to buy BTC and trade id is " + result.uniqueId;

                    commonFunction.sendMailDynamic(email, subject, message, "Confirm Payment", (error, sent) => {
                        if (error) {
                            return res.send({
                                responseCode: 500,
                                responseMessage: "Error occured.", error
                            });
                        } else {

                            User.findOne({ _id: result.seller[0].seller_id }, (err123, result123) => {
                                if (err123) return res.send({ responseCode: 500, responseMessage: "Error in User." })
                                else {
                                    var Mobile = result123.country_code + result123.phone_number;
                                    sender.sendSms(message, 'swiftpro', false, Mobile)
                                        .then(function (response) {
                                            console.log('Sucess in Message sent in Mobile------------------------------------', response);
                                        })
                                        .catch(function (err) {
                                            console.log('Error in Message sent in Mobile------------------------------------', err123)
                                        })
                                    return res.send({
                                        responseCode: 200,
                                        responseMessage: "You paid successfully",
                                        result: result

                                    })
                                }
                            })

                        }
                    })
                }
            })
    },

    //...................................................finance management >> admin .............................................................//

    "financeHistory": (req, res) => {
        var query = {}
        var data = {}
        if (req.body.type) {
            query.type = req.body.type
        }
        if (req.body.user_name) {
            query.user_name = req.body.user_name
        }
        if (req.body.send_amount) {
            query.send_amount = req.body.send_amount
        }
        if (req.body.collection) {

            query.$and = [({ 'withdraw_fee': { $exists: true } }, { 'withdraw_fee': { $gt: 0 } })]
            data.$and = [({ 'withdraw_fee': { $exists: true } }, { 'withdraw_fee': { $gt: 0 } })]
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

        if (req.body.type) {
            data.type = req.body.type
        }
        if (req.body.address) {
            query.toAddress = req.body.address
        }


        options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            }
        }
        walletTransaction.find(data, (err, result1) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error",
                    err
                })
            }

            else {
                walletTransaction.paginate(query, options, (error, result) => {
                    if (error) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error",
                            error
                        })
                    } else if (result.length == 0) {
                        res.send({
                            responseCode: 404,
                            responseMessage: "Data not found"
                        })
                    } else {
                        res.send({
                            responseCode: 200,
                            responseMessage: "Data found successfully",
                            deposite: result,
                            allData: result1

                        })
                    }
                })
            }
        })

    },


    //=============================================== Trade Details =========================================================================
    "treadeDetails": (req, res) => {
        trade.findOne({
            _id: req.body.tradeId
        }, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "Trade details fectched successfully",
                    result: result
                })
            }
        })
    },
    "amountToBtc": (req, res) => {
        var cal = (req.body.amount / req.body.pricePerBtc).toFixed(8);
        res.send({
            responseCode: 200,
            responseMessage: "Trade details fectched successfully",
            result: cal
        })
    },
    //=============================================== user details with ad data =========================================================================
    "userDetails": (req, res) => {
        User.findOne({
            _id: req.body.userId,
            status: "ACTIVE"
        }, {
                password: 0
            }, (error, result) => {
                if (error)
                    return res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error"
                    })
                else if (!result) {
                    return res.send({
                        responseCode: 400,
                        responseMessage: "Data not found.."
                    })
                } else {
                    var finalData = [];
                    finalData.push(result);
                    adSchema.find({
                        user_id: req.body.userId,
                        status: "ACTIVE"
                    }, (error, result1) => {
                        if (error)
                            return res.send({
                                responseCode: 500,
                                responseMessage: "Internal server error"
                            })
                        for (let i of result1) {
                            finalData.push(i)
                        }
                        return res.send({
                            responseCode: 200,
                            responseMessage: "Data found successfully",
                            result: finalData
                        })
                    })
                }
            })
    },



    //..................................chatHistory......................................//
    'chatHistory': (req, res) => {
        chatHistorySchema.find({
            tradeId: req.body.tradeId,

        }).sort({
            time: 1
        }).exec((err, succ) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (succ.length) {
                res.send({
                    responseCode: 200,
                    responseMessage: "Trade details fectched successfully",
                    result: succ
                })
            } else {
                res.send({
                    responseCode: 200,
                    responseMessage: "Can't Find Details",
                    result: []

                })
            }
        })
        //     }
        // })

    },


    //.........................................create trust....................................................................//

    'trust_others': (req, res) => {
        var user_name = req.body.name; //oposite user 
        User.findOne({
            '_id': req.body.userId
        }).exec((err, succ) => {
            if (err)
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error",
                    err
                })
            else if (succ) {
                if (req.body.status == "trust") {
                    let obj = {}
                    obj.name = req.body.name;
                    // $elemMatch
                    User.findOneAndUpdate({ '_id': req.body.userId }, { $push: { 'trusted_by_me': obj } }, {
                        new: true
                    }).exec((err, succ) => {
                        if (err) {
                            res.send({
                                responseCode: 500,
                                responseMessage: "Internal server error",
                                err
                            })
                        } else if (succ) {
                            let obj1 = {}
                            obj1.name = succ.user_name;
                            User.findOneAndUpdate({
                                'user_name': req.body.name

                            }, {



                                    $push: {
                                        'trusted_by': obj1
                                    }

                                    ,
                                    $inc: {
                                        'trust_count': 1
                                    }

                                }, {
                                    new: true
                                }).exec((err3, succ3) => {


                                    if (err3) {
                                        res.send({
                                            responseCode: 500,
                                            responseMessage: "Internal server error",
                                            err3
                                        })
                                    } else
                                        res.send({
                                            responseCode: 200,
                                            responseMessage: "You trusted ",
                                            result: user_name
                                        })
                                })
                        }
                    })
                }
                else {
                    let obj = {}
                    obj.name = req.body.name;
                    User.findOneAndUpdate({ '_id': req.body.userId }, { $pull: { 'trusted_by_me': obj } }, {
                        new: true
                    }).exec((err, succ) => {
                        if (err) {
                            res.send({
                                responseCode: 500,
                                responseMessage: "Internal server error",
                                err
                            })
                        } else if (succ) {
                            let obj1 = {}
                            obj1.name = succ.user_name;
                            User.findOneAndUpdate({
                                'user_name': req.body.name
                            }, {


                                    $pull: {
                                        'trusted_by': obj1
                                    }

                                    ,
                                    $inc: {
                                        'trust_count': -1
                                    }

                                }, {
                                    new: true
                                }).exec((err3, succ3) => {


                                    if (err3) {
                                        res.send({
                                            responseCode: 500,
                                            responseMessage: "Internal server error",
                                            err3
                                        })
                                    } else
                                        res.send({
                                            responseCode: 200,
                                            responseMessage: "You untrusted",
                                            result: user_name
                                        })
                                })
                        }
                    })
                }
            }
        })
    },


    //.........................................create block....................................................................//


    'blocked_others': (req, res) => {
        var user_name = req.body.name; //other user
        let obj = {}
        obj.name = user_name;
        if (req.body.status == "block") {
            User.findOneAndUpdate({
                '_id': req.body.userId
            }, {
                    $push: {
                        'blocked_by_me': obj
                    }
                }, {
                    new: true
                }).exec((err, succ) => {
                    if (err) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error",
                            err
                        })
                    } else if (succ) {

                        let obj1 = {}
                        obj1.name = succ.user_name;



                        User.findOneAndUpdate({
                            'user_name': user_name
                        }, {

                                $push: {
                                    'blocked_by': obj1
                                },
                                $inc: {
                                    'block_count': 1
                                }


                            }, {
                                new: true
                            }).exec((err1, succ1) => {
                                if (err1) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error",
                                        err1
                                    })
                                } else if (succ1)

                                    res.send({
                                        responseCode: 200,
                                        responseMessage: "You blocked ",
                                        result: user_name
                                    })
                            })
                    }
                })
        }
        else {
            User.findOneAndUpdate({
                '_id': req.body.userId
            }, {
                    $pull: {
                        'blocked_by_me': obj
                    }
                }, {
                    new: true
                }).exec((err, succ) => {
                    if (err) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error",
                            err
                        })
                    } else if (succ) {

                        let obj1 = {}
                        obj1.name = succ.user_name;



                        User.findOneAndUpdate({
                            'user_name': user_name
                        }, {

                                $pull: {
                                    'blocked_by': obj1
                                },
                                $inc: {
                                    'block_count': -1
                                }


                            }, {
                                new: true
                            }).exec((err1, succ1) => {
                                if (err1) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error",
                                        err1
                                    })
                                } else if (succ1)

                                    res.send({
                                        responseCode: 200,
                                        responseMessage: "You unblocked ",
                                        result: user_name
                                    })
                            })
                    }
                })
        }

    },

    //........................................userManagement >> trustedBy.........................................................//

    trustByOther: (req, res) => {
        var value = new RegExp('^' + req.body.search, "i")
        var obj;
        let option = {
            limit: req.body.limit || 10,
            page: req.body.pageNumber || 1,
            sortBy: {
                "trusted_by.time": -1
            },
            // allowDiskUse: true
        }
        obj = {
            "_id": req.body.userId
        }
        var query = {
            status: {
                $ne: 'DELETE'
            }
        };
        let key = "trusted_by.status";
        let key1 = "trusted_by.time"
        let key2 = "trusted_by.name"


        if (req.body.status)
            query[key] = req.body.status;

        if (req.body.userName) {
            query[key2] = req.body.userName
        }

        if (req.body.fromDate && !req.body.toDate) {
            query[key1] = {
                $gte: new Date(req.body.fromDate)
            }
        }
        if (!req.body.fromDate && req.body.toDate) {
            query[key1] = {
                $lte: new Date(req.body.toDate)
            }

        }
        if (req.body.fromDate && req.body.toDate) {
            query[key1] = {
                $lte: new Date(req.body.toDate),
                $gte: new Date(req.body.fromDate)
            }
        }

        var aggregate = User.aggregate([{
            $match: {
                "_id": new mongoose.Types.ObjectId(req.body.userId)
            }
        },
        {
            $unwind: "$trusted_by"
        },
        {
            $project: {
                "user_name": 1,

                "status": 1,
                "userType": 1,
                "trusted_by": 1,
                "createdAt": 1

            }
        },


        {
            $match: query
        },
        {
            $sort: {
                key1: -1
            }
        }

        ])

        User.aggregatePaginate(aggregate, option, (err, success, pages, total) => {
            if (err)
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error ",
                    err
                })
            else if (success == false)
                return res.send({
                    responseCode: 404,
                    responseMessage: "Data not found"
                })
            else {

                var random = []
                for (var k = 0; k < success.length; k++) {
                    random.push(success[k].trusted_by.name)
                }



                const data = {
                    "total": total,
                    "limit": option.limit,
                    "currentPage": option.page,
                    "totalPage": pages
                }
                return res.send({
                    responseCode: 200,
                    responseMessage: "Data found successfully.",
                    success: success.reverse(),
                    paginationData: data,
                    userName: random.reverse()
                })
            }
        })
    },


    //........................................userManagement >> blockedBy.........................................................//



    blockByOther: (req, res) => {
        var obj;
        let option = {
            limit: req.body.limit || 10,
            page: req.body.pageNumber || 1,
            sortBy: {
                "trusted_by.time": -1
            },
        }
        obj = {
            "_id": req.body.userId
        }
        var query = {
            status: {
                $ne: 'DELETE'
            }
        };
        let key = "blocked_by.status";
        let key1 = "blocked_by.time"
        let key2 = "blocked_by.name"


        if (req.body.status)
            query[key] = req.body.status;

        if (req.body.userName) {
            query[key2] = req.body.userName
        }

        if (req.body.fromDate && !req.body.toDate) {
            query[key1] = {
                $gte: new Date(req.body.fromDate)
            }
        }
        if (!req.body.fromDate && req.body.toDate) {
            query[key1] = {
                $lte: new Date(req.body.toDate)
            }

        }
        if (req.body.fromDate && req.body.toDate) {
            query[key1] = {
                $lte: new Date(req.body.toDate),
                $gte: new Date(req.body.fromDate)
            }
        }

        var aggregate = User.aggregate([{
            $match: {
                "_id": new mongoose.Types.ObjectId(req.body.userId)
            }
        },
        {
            $unwind: "$blocked_by"
        },
        {
            $project: {
                "user_name": 1,
                'email': 1,
                "status": 1,
                "userType": 1,
                "blocked_by": 1,
                "createdAt": 1

            }
        },

        {
            $match: query
        },
        {
            $sort: {
                key1: -1
            }
        }

        ])

        User.aggregatePaginate(aggregate, option, (err, success, pages, total) => {
            if (err)
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error ",
                    err
                })
            else if (success == false)
                return res.send({
                    responseCode: 404,
                    responseMessage: "Data not found"
                })
            else {

                var random = []
                for (var k = 0; k < success.length; k++) {
                    random.push(success[k].blocked_by.name)
                }



                const data = {
                    "total": total,
                    "limit": option.limit,
                    "currentPage": option.page,
                    "totalPage": pages
                }
                console.log("success-->>", success)
                return res.send({
                    responseCode: 200,
                    responseMessage: "Data found successfully.",
                    success: success.reverse(),
                    paginationData: data,
                    userName: random.reverse()
                })
            }
        })
    },

    //...........................................delete trusted user......................................................................................//
    deleteTrustBy: (req, res) => {
        User.findOneAndUpdate({

            "_id": req.body.userId
        }, {
                $pull: {
                    "trusted_by": {
                        name: req.body.name
                    }
                }
            }, {
                new: true
            }, (err, result1) => {
                if (err) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server erroror",
                        err
                    });
                } else {
                    User.findOneAndUpdate({
                        "user_name": req.body.name
                    }, {
                            $pull: {
                                "trusted_by_me": {
                                    name: result1.user_name
                                }
                            }
                        }, {
                            new: true
                        }, async (err1, result11) => {

                            if (err1) {
                                res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal server erroror",
                                    err
                                });
                            } else {
                                var unique = commonFunction.getCode();
                                let saveData = await saveDataFun(req.headers.id);
                                let obj = {
                                    "uniqueId": "#" + unique,
                                    // "tagId": req.body.tagId,
                                    "staffName": saveData.name,
                                    "module": "Action Trust",
                                    "type": saveData.userType,
                                    "staffId": req.headers.id,
                                    "documentData": saveData,
                                    "userName": req.body.name,
                                    "action": "Trust deleted by " + saveData.name
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
                                    responseMessage: "Data deleted successfully",
                                    result: result1.trusted_by,
                                    result2: result11.trusted_by_me
                                });
                            }
                        })
                }
            })

    },


    //...........................................delete blocked user......................................................................................//
    deleteBlockedBy: (req, res) => {
        User.findOneAndUpdate({
            "_id": req.body.userId
        }, {
                $pull: {
                    "blocked_by": {
                        name: req.body.name
                    }
                }
            }, {
                new: true
            }, (err, result1) => {
                if (err) {
                    res.send({
                        responseCode: 500,
                        responseMessage: "Internal server erroror",
                        err
                    });
                } else {
                    User.findOneAndUpdate({
                        "user_name": req.body.name
                    }, {
                            $pull: {
                                "blocked_by_me": {
                                    name: result1.user_name
                                }
                            }
                        }, {
                            new: true
                        }, async (err1, result11) => {
                            if (err1) {
                                res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal server erroror",
                                    err
                                });
                            } else {
                                var unique = commonFunction.getCode();
                                let saveData = await saveDataFun(req.headers.id);
                                let obj = {
                                    "uniqueId": "#" + unique,
                                    // "tagId": req.body.tagId,
                                    "staffName": saveData.name,
                                    "module": "Action Trust",
                                    "type": saveData.userType,
                                    "staffId": req.headers.id,
                                    "documentData": saveData,
                                    "userName": req.body.name,
                                    "action": "Delete blocked by " + saveData.name
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
                                    responseMessage: "Data deleted successfully",
                                    result: result1.trusted_by,
                                    result2: result11.trusted_by_me
                                });
                            }
                        })
                }
            })



    },
    "checkbalanceAfterTrade": (req, res) => {
        trade.findOne({ _id: req.body.trade, type_of_trade_original: "sell" }, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else {
                return
                User.findOne({ _id: result.seller[0].seller_id }, (err, result1) => {
                    if (result1.btc.total <= 0.05) {
                        adSchema.findOneAndUpdate({ _id: result.advertisement_id, status: "ACTIVE" }, { $set: { status: "DISABLE" } }, (err, result3) => { })
                    }
                })
            }
        })
    },


    "checkbalanceAfterCancelTrade": (req, res) => {
        trade.findOne({ _id: req.body.trade, type_of_trade_original: "sell" }, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else {
                User.findOne({ _id: result.seller[0].seller_id }, (err, result1) => {
                    if (result1.btc.total > 0.05) {
                        adSchema.findOneAndUpdate({ _id: result.advertisement_id }, { $set: { status: "ACTIVE" } }, (err, result4) => { })
                    }
                })
            }
        })
    },



    "tranferBondAmountToEscrow": async (req, res) => {

        await User.findOne({ _id: req.body.userId, status: "ACTIVE" }, async (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (!result) {
                res.send({
                    responseCode: 400,
                    responseMessage: "You are not a active user"
                })
            }
            else {
                var arr = [];

                await configuration.find({}).lean().exec(async (err, result1) => {
                    arr = result1.reverse();

                    var amount = result.btc.total;
                    if (amount < arr[0].needWalletBalance) {
                        return res.send({
                            responseCode: 400,
                            responseMessage: "You don't have enough BTC to complete bond"
                        })
                    }
                    else {
                        var totalUserBalance = (new BigNumber(amount).minus(new BigNumber(arr[0].needWalletBalance)));
                        await User.findOneAndUpdate({ _id: req.body.userId, status: "ACTIVE" }, { $set: { "btc.total": totalUserBalance, userBond: true, bondActivationTime: Date.now() } }, async (err, result2) => {
                            if (err) {
                                return res.send({
                                    responseCode: 500,
                                    responseMessage: "Internal server error"
                                })
                            } else if (!result2) {
                                return res.send({
                                    responseCode: 400,
                                    responseMessage: "Error Occurred",
                                    err: err
                                })
                            } else {
                                let onlineUsers = require('../../server').onlineUsers;
                                let sockets = require('../../server').sockets

                                for (var i = 0; i < onlineUsers[result2._id].socketId.length; i++) {
                                    try {

                                        sockets[onlineUsers[result2._id].socketId[i]].socket.emit("getUserBalance", {
                                            balance: result2.btc.total
                                        });
                                    }
                                    catch (err) {
                                        console.log("Error Occured", err);
                                    }

                                }


                                var obj = new escrow({
                                    bondUserId: req.body.userId,
                                    bondAmount: arr[0].needWalletBalance
                                })

                                await obj.save(async (err, result211) => {
                                    if (err) {
                                        return res.send({
                                            code: 500,
                                            message: "Internal server error!!"
                                        })
                                    } else {

                                        return res.send({
                                            responseCode: 200,
                                            responseMessage: "Bond fee transferred successfully"
                                        })


                                        // var transactionData = new TransactionModel({
                                        //     userId: req.body.userId,
                                        //     user_name:result.user_name,
                                        //     type:'bond',
                                        //     withdraw_fee: arr[0].needWalletBalance,
                                        //     created_At: Date.now()
                                        //   })



                                        //   // Transaction save

                                        //   transactionData.save((err, succ) => {
                                        //     if(err){
                                        //         return  res.send({
                                        //             responseCode: 500,
                                        //             responseMessage: "Internal server error"
                                        //         })
                                        //     }else{
                                        //         return res.send({
                                        //             responseCode: 200,
                                        //             responseMessage: "Bond fee transferred successfully"
                                        //         })
                                        //     }
                                        //   })
                                    }
                                })


                            }
                        })
                    }

                    //     }
                    // })



                })


            }
        })
    },

    "returnBondAmountFromEscrow": (req, res) => {
        User.findOne({ _id: req.body.userId, status: "ACTIVE" }, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (!result) {
                res.send({
                    responseCode: 400,
                    responseMessage: "You are not a active user"
                })
            }
            else {
                if (result.retrieveBondMoney == true) {
                    res.send({
                        responseCode: 400,
                        responseMessage: "Already retrived your bond"
                    })
                } else {
                    configuration.find({}).lean().exec((err, result1) => {
                        arr = result1.reverse();
                        escrow.findOne({ bondUserId: req.body.userId, status: "ACTIVE" }, (err, result211) => {

                            if (err) {
                                return res.send({
                                    code: 500,
                                    message: "Internal server error!!"
                                })
                            }
                            else if (!result211) {
                                return res.send({ responseCode: 404, responseMessage: "Escrow data not found" })
                            }
                            else {
                                var amount = result.btc.total;
                                var totalUserBalance = (new BigNumber(amount).plus(new BigNumber(result211.bondAmount)));
                                User.findOneAndUpdate({ _id: req.body.userId, status: "ACTIVE" }, { $set: { "btc.total": totalUserBalance, retrieveBondMoney: true } }, (err, result2) => {
                                    if (err) {
                                        res.send({
                                            responseCode: 500,
                                            responseMessage: "Internal server error"
                                        })
                                    } else if (!result2) {
                                        res.send({
                                            responseCode: 400,
                                            responseMessage: "Error Occurred",
                                            err
                                        })
                                    } else {
                                        let onlineUsers = require('../../server').onlineUsers;
                                        let sockets = require('../../server').sockets
                                        for (var i = 0; i < onlineUsers[result2._id].socketId.length; i++) {
                                            try {

                                                sockets[onlineUsers[result2._id].socketId[i]].socket.emit("getUserBalance", {
                                                    balance: result2.btc.total
                                                });
                                            }
                                            catch (err) {
                                                console.log("Error Occured", err);
                                            }

                                        }
                                        console.log('bondUserIdbondUserIdbondUserId', req.body.userId)
                                        escrow.findOneAndUpdate({ _id: result211._id }, { $set: { bondAmount: "0", "status": "COMPLETE" } }, { new: true }, (err, result21) => {
                                            if (err) {
                                                console.log('errerr', err)
                                            } else {
                                                console.log('FeeFeeFee', result21)
                                                res.send({
                                                    responseCode: 200,
                                                    responseMessage: "Fee successfully recieved"
                                                })
                                            }

                                        })
                                    }
                                })
                            }
                        })
                    })
                }

            }
        })
    },



    changeAdStatus: (req, res) => {
        adSchema.findOne({ _id: req.body.adId }, (err, result) => {
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
                    adSchema.findOneAndUpdate({ _id: req.body.adId }, { $set: { status: "DISABLE" } }, { new: true }, (err, result1) => {
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
                    User.findOne({ _id: req.body.userId }, (err, result2) => {

                        if (result2.userBond == true) {
                            adSchema.findOneAndUpdate({ _id: req.body.adId }, { $set: { status: "ACTIVE" } }, { new: true }, (err, result2) => {
                                if (err) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error"
                                    })
                                } else {
                                    res.send({
                                        result: result2,
                                        responseCode: 200,
                                        responseMessage: "Advertisement enabled successfully."
                                    })
                                }
                            })
                        } else {
                            res.send({
                                responseCode: 400,
                                responseMessage: "Please tranfer bond money to escrow"
                            })
                        }
                    })
                }
            }
        })
    },


    "completedTradeOfUser": (req, res) => {

        trade.find({ $and: [{ $or: [{ buyerId: req.body.userId }, { "seller.seller_id": req.body.userId }], request_status: "Complete" }] }, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else {
                let totalTrade = result.length;
                let data;
                if (result.length)
                    data = result[0];
                else
                    data = {};
                res.send({
                    responseCode: 200,
                    responseMessage: "Trade Count of a user",
                    result1: totalTrade,
                    firstCompleteTrade: data
                })
            }
        })
    },

    "totalEscrowAmount": (req, res) => {
        escrow.find({}, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error", err
                })
            }
            else {
                var totalEscrowAmount = 0;
                async.forEach(result, (key1, callback) => {
                    totalEscrowAmount = totalEscrowAmount + parseFloat(key1.amount_coin)

                })
                res.send({
                    responseCode: 200,
                    responseMessage: "Total Escrow Amount",
                    result: totalEscrowAmount
                })
            }

        })
    },


    //=================================New Addition==============================================================//

    "totalAdminAmount": (req, res) => {

        escrow.find({}, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error", err
                })
            }
            else {
                var totalEscrowAmount = 0;

                trade.find({}, (err, tradeValue) => {
                    if (err) {
                        res.send({
                            responseCode: 500,
                            responseMessage: "Internal server error", err
                        })
                    }
                    else {
                        var totalAmount = 0;
                        async.forEach(tradeValue, (key1, callback) => {
                            totalAmount = totalAmount + parseFloat(key1.transactionFee)
                        })
                        User.findOne({
                            "userType": "ADMIN"
                        }, (err, adminDetails) => {
                            if (err) {
                                return res.send({
                                    code: 500,
                                    message: "Internal server error!!3116"
                                })
                            } else {
                                TransactionModel.aggregate(
                                    [
                                        { $match: { type: { $ne: 'bond' } } },
                                        {
                                            $group: {
                                                _id: null,
                                                withdrawFeeSum: {
                                                    $sum: "$withdraw_fee",
                                                }
                                            }
                                        }
                                    ]
                                ).exec((err, resultCount) => {
                                    if (err) throw err;

                                    if (resultCount.length > 0) {
                                        var totalSum = (new BigNumber(totalAmount)).plus(new BigNumber(resultCount[0].withdrawFeeSum))
                                    } else {
                                        var totalSum = totalAmount
                                    }

                                    var finalVaule = totalSum.toFixed(8)
                                    res.send({
                                        responseCode: 200,
                                        responseMessage: "Count fetched successfully",
                                        result: finalVaule
                                    })
                                })
                            }
                        })
                    }
                })


            }
        })
    },

    "totalBondAmount": (req, res) => {

        escrow.find({}, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error", err
                })
            }
            else {
                var totalEscrowAmount = 0;
                async.forEach(result, (key1, callback) => {

                    if (key1.bondAmount) {
                        console.log('lllllllllll', key1.bondAmount)
                        totalEscrowAmount = totalEscrowAmount + parseFloat(key1.bondAmount)
                    }
                })

                res.send({
                    responseCode: 200,
                    responseMessage: "Count fetched successfully",
                    result: totalEscrowAmount
                })



            }
        })
    },
    "totalUserAmount": (req, res) => {

        User.aggregate(
            [
                { '$match': { 'userType': "USER" } },
                {

                    $group: {
                        _id: null,
                        totalBtc: {
                            $sum: "$btc.total",
                        }
                    }
                }
            ]
        ).exec((err, result) => {
            if (err) throw err;
            console.log('result', result);
            res.send({
                responseCode: 200,
                responseMessage: "Count fetched successfully",
                result: result
            })
        })
    },

    //============================================New Addition End=============================================//

    "tradeBond": (req, res) => {
        systemConfiguration.find({}, (err, result) => {

            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            }
            else if (!result) {
                res.send({
                    responseCode: 400,
                    responseMessage: "no data found"
                })
            }

            else {
                res.send({
                    result: result.reverse(),
                    responseCode: 200,
                    responseMessage: "Total tradebond data",
                    result: result[0].needWalletBalance
                })
            }

        })
    },



}







function updateBtc(advertisementId, tradeId) {
    console.log('tradeId4661->>>', tradeId)
    return new Promise((resolve, reject) => {
        trade.findOne({
            _id: tradeId
        }, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal servver error"
                })
            } else if (!result) {
                res.send({
                    responseCode: 404,
                    responseMessage: "Trade is either disabled or completed"
                })
            } else {
                console.log('result4677', result)
                if (result.request_status == "Paid") {
                    console.log('4679')
                    trade.findOneAndUpdate({
                        _id: tradeId, request_status: "Paid"
                    }, {
                            $set: {
                                paymentTime: true
                            }
                        }, {
                            new: true
                        }, (err, ress1) => {
                            if (ress1) {
                                console.log("Payment time fininsh");
                                resolve(true);
                            }
                        })
                    return;
                }
                else {
                    console.log('4696')
                    escrow.findOne({
                        trade_id: tradeId
                    }, (err, result1) => {
                        if (err) {
                            res.send({
                                responseCode: 500,
                                responseMessage: "Internal servver error"
                            })
                        } else if (!result1) {
                            res.send({
                                responseCode: 404,
                                responseMessage: "No escrow wallet created with this trade id "
                            })
                        } else {
                            console.log('result14709', result1)
                            User.findOne({
                                _id: result1.seller_id
                            }, (err, result2) => {
                                console.log("4", result2);
                                if (err) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal servver error"
                                    })
                                } else if (!result) {
                                    res.send({
                                        responseCode: 404,
                                        responseMessage: "No seller found"
                                    })
                                } else {
                                    var oldAmount = result2.btc.total
                                    let newAmount = new BigNumber(oldAmount).plus(new BigNumber(result1.amount_coin))
                                    User.findOneAndUpdate({
                                        _id: result1.seller_id
                                    }, {
                                            $set: {
                                                "btc.total": newAmount
                                            }
                                        }, {
                                            new: true
                                        }, (err, result3) => {
                                            if (err) {
                                                res.send({
                                                    responseCode: 500,
                                                    responseMessage: "Internal servver error"
                                                })
                                            } else {
                                                console.log("6");
                                                escrow.findOneAndUpdate({
                                                    trade_id: tradeId
                                                }, {
                                                        $set: {
                                                            amount_coin: 0
                                                        }
                                                    }, {
                                                        new: true
                                                    }, (err, result4) => {
                                                        if (err) {
                                                            res.send({
                                                                responseCode: 500,
                                                                responseMessage: "Internal servver error"
                                                            })
                                                        } else {
                                                            trade.findOneAndUpdate({
                                                                _id: tradeId, request_status: "Pending"
                                                            }, {
                                                                    $set: {
                                                                        status: "CANCEL",
                                                                        request_status: "Cancel",

                                                                    }
                                                                }, {
                                                                    new: true
                                                                }, (err, ress) => {
                                                                    if (ress) {
                                                                        console.log("Trade cancelled successfully");
                                                                        resolve(true);
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
        })
    })


}

async function saveDataFun(userId) {
    return new Promise((resolve, reject) => {
        User.findOne({
            _id: userId,
            userType: { $in: ["SUBADMIN", "MANAGER"] },
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



async function saveDataFun(userId) {
    return new Promise((resolve, reject) => {
        User.findOne({
            _id: userId,
            userType: { $in: ["SUBADMIN", "MANAGER", "ADMIN"] },
            status: "ACTIVE"
        }, (err1, result12) => {
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


// function createCron(job, newPeriod) {

//     cron.schedule('*/5 * * * * *', () => {

//     })

// })
const mongoose = require('mongoose');
var User = require('../../models/userModel.js');
var FeedbackModel = require('../../models/feedbackModel.js');
var TradeModel = require('../../models/tradeModel.js');
module.exports = {
    //=======================================================Add Feedback============================================//
    addFeedback: (req, res) => {
        console.log("Request for add feedback============>", req.body);
        if (!req.body || !req.body.feedbackTo || !req.body.feedbackType || !req.body.feedbackFrom) {
            return res.send({
                response_code: 501,
                response_message: "All fields are required"
            })
        } else {
            var query = {
                $and: [{
                    _id: req.body.feedbackTo
                }, {
                    status: 'ACTIVE'
                }]
            }
            User.findOne(query, (error, result) => {
                if (error) {
                    console.log("Error is========>", error);
                    return res.send({
                        responseCode: 500,
                        responseMessage: "Internal server error",
                        error
                    })
                } else if (!result) {
                    console.log("FeedbackTo id is not correct");
                    return res.send({
                        responseCode: 404,
                        responseMessage: "User not found"
                    })
                } else {
                    var query1 = {
                        $and: [{
                            _id: req.body.feedbackFrom
                        }, {
                            status: 'ACTIVE'
                        }]
                    }
                    User.findOne(query1, (error, result) => {
                        if (error) {
                            console.log("Error is========>", error);
                            return res.send({
                                responseCode: 500,
                                responseMessage: "Internal server error",
                                error
                            })
                        } else if (!result) {
                            console.log("FeedbackFrom id is not correct");
                            return res.send({
                                responseCode: 404,
                                responseMessage: "User not found"
                            })
                        } else {
                            var value = {
                                "feedbackFrom": req.body.feedbackFrom,
                                "feedbackTo": req.body.feedbackTo,
                                "feedbackType": req.body.feedbackType,
                                "feedbackMessage": req.body.feedbackMessage,
                                "tradeId": req.body.tradeId
                            }

                            FeedbackModel.findOne({
                                "feedbackFrom": req.body.feedbackFrom,
                                "feedbackTo": req.body.feedbackTo
                            }, (err, result1) => {
                                if (err) {
                                    res.send({
                                        responseCode: 500,
                                        responseMessage: "Internal server error"
                                    })
                                } else {
                                    new FeedbackModel(value).save((error1, result1) => {
                                        if (error1) {
                                            console.log("Error1 is========>", error1);
                                            return res.send({
                                                responseCode: 500,
                                                responseMessage: "Internal server error"
                                            })
                                        } else {
                                            console.log("Feedback added successfully", result1)
                                            TradeModel.findOne({
                                                _id: req.body.tradeId
                                            }).exec((err, succ) => {
                                                if (err)
                                                    res.send({
                                                        responseCode: 400,
                                                        responseMessage: err
                                                    })
                                                else if (succ) {
                                                    //console.log('succ',succ)
                                                    if (succ.hasOwnProperty('sellerFeedback') == false) {
                                                        TradeModel.findOneAndUpdate({
                                                            _id: req.body.tradeId
                                                        }, {
                                                                $set: {
                                                                    sellerFeedback: req.body.feedbackFrom
                                                                }
                                                            }, {
                                                                new: true
                                                            }).exec((err1, succ1) => {
                                                                if (err1)
                                                                    return res.send({
                                                                        responseCode: 500,
                                                                        responseMessage: "Internal server error"
                                                                    })
                                                                else if (succ1) {
                                                                    res.send({
                                                                        responseCode: 200,
                                                                        responseMessage: "Feedback Saved successfully"
                                                                    })
                                                                }
                                                            })
                                                    }
                                                    else if (succ.hasOwnProperty('buyerFeedback') == false) {
                                                        TradeModel.findOneAndUpdate({
                                                            _id: req.body.tradeId
                                                        }, {
                                                                $set: {
                                                                    buyerFeedback: req.body.feedbackFrom
                                                                }
                                                            }, {
                                                                new: true
                                                            }).exec((err1, succ11) => {
                                                                if (err1)
                                                                    return res.send({
                                                                        responseCode: 500,
                                                                        responseMessage: "Internal server error"
                                                                    })
                                                                else if (succ11) {
                                                                    res.send({
                                                                        responseCode: 200,
                                                                        responseMessage: "Feedback Saved successfully"
                                                                    })
                                                                }
                                                            })
                                                    }
                                                    else if (succ.hasOwnProperty('buyerFeedback') != false && succ.hasOwnProperty('sellerFeedback') != false) {
                                                        res.send({
                                                            responseCode: 201,
                                                            responseMessage: "Can't Add more Feedback",
                                                        })
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
    },
    //===========================================Get Feedback list with pagination===========================================//
    getFeedbackList: (req, res) => {
        var options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: {
                createdAt: -1
            },
            populate: [{
                path: "feedbackFrom",
                select: "email user_name profilePic  phone_number name country country_code"
            },
            {
                path: "feedbackTo",
                select: "email user_name phone_number profilePic name country country_code"
            }, {
                path: "tradeId",
                select: "uniqueId"
            }
            ]
        }

        var query = { $and: [{ feedbackTo: req.body.feedbackTo }, { feedbackFrom: { $ne: [req.body.feedbackTo] } }] }
        FeedbackModel.paginate(query, options, (error, result) => {
            if (error) {
                console.log("Error is==========>", error)
                return res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (result.length == 0) {
                console.log("Data not found");
                return res.send({
                    responseCode: 404,
                    responseMessage: "Data not found"
                })
            } else {
                console.log("Feedback list found successfully", result)
                res.send({
                    responseCode: 200,
                    response_message: "Feedback list found successfully",
                    Data: result
                });
            }
        })
    },
    "feedbackScore": (req, res) => {
        console.log('sfgsdfgsdf',req.body)
       

        FeedbackModel.find({
            feedbackTo: req.body.userId
        }, (err, result) => {
            if (err) {
                res.send({
                    responseCode: 500,
                    responseMessage: "Internal server error"
                })
            } else if (result.length == 0) {
                res.send({
                    responseCode: 200,
                    responseMessage: "No feedback found",
                    result: "Neutral"
                })
            } else {
                let positive = 0;
                let negative = 0;
                let count = 0;
                for (let i of result) {
                    console.log('result', i);
                    count = count + 1;
                    if (i.feedbackType == "positive") {
                        positive++;
                    }
                    if (i.feedbackType == "negative") {
                        negative++;
                    }
                    if (count == result.length) {
                      
                        var feedbackScore = { 'positive': positive, 'negative': negative }
                        console.log('feedbackScore',feedbackScore)
                        return res.send({
                            responseCode: 200,
                            responseMessage: "Data found successfully",
                            // result: finalData,
                            feedbackScore: feedbackScore
                        })
                    }

                }


            }
        })
    }


}
const staticModel = require("../../models/staticModel");
//======================================Get Static Content===============================//
const staticContentGet = (req, res) => {
    staticModel.find({}, (error, result) => {
        if (error) {
            console.log("Error is============>", error);
            res.send({ responseCode: 500, responseMessage: "Internal server error" });
        }
        else if (!result) {
            res.send({ responseCode: 501, responseMessage: "Data  not found" });
        }
        else {
            res.send({ responseCode: 200, responseMessage: "Data found successfully", Data: result });
            console.log("Result is================>", result)
        }
    })
}
//========================================Particular content get=========================================//
const staticContentById = (req, res) => {
    staticModel.findOne({ "_id": req.body.id }, (error, result) => {
        if (error) {
            console.log("Error is============>", error);
            res.send({ responseCode: 500, responseMessage: "Internal server error" });
        }
        else if (!result) {
            res.send({ responseCode: 501, responseMessage: "Data  not found" });
        }
        else {
            res.send({ responseCode: 200, responseMessage: "Data found successfully", Data: result });
            console.log("Result is================>", result)
        }
    })
}
//=====================Static Content Update============================================//
const StaticContentUpdate = (req, res) => {
    if (!req.body || !req.body.type || !req.body.title || !req.body.description || !req.body._id) {
        res.send({ response_code: 500, responseMessage: "Something went wrong" })
    }
    if (req.body.type == 'PRIVACY') {
        var obj = { $set: { "title": req.body.title, "description": req.body.description } }
    }
    if (req.body.type == 'TRADES') {
        var obj = { $set: { "title": req.body.title, "description": req.body.description } }
    }
    if (req.body.type == 'TERMS') {
        var obj = { $set: { "title": req.body.title, "description": req.body.description } }
    }
    if (req.body.type == 'ABOUT_US') {
        var obj = { $set: { "title": req.body.title, "description": req.body.description } }
    }
    if (req.body.type == 'AddCondition') {
        var obj = { $set: { "title": req.body.title, "description": req.body.description } }
    }
    staticModel.findByIdAndUpdate({ "_id": req.body._id }, obj, { new: true },
        (error, result) => {
            if (error) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error." })
            }
            else if (!result) {
                return res.send({ responseCode: 501, responseMessage: "No data found" })
            }
            else {
                res.send({ responseCode: 200, responseMessage: "Content data upload successfully.", Data: result })
                console.log("Result is=======>", result)
            }
        })
}


const staticContent = (req, res) => {
    console.log('Request for static content is ', req.body);
    if (req.body.type != "FAQ") {
        staticModel.findOne({
            Type: req.body.type
        }).exec((err, succ) => {
            if (err)
                return res.send({ responseCode: 500, responseMessage: "Internal server error.", err })
            else if (!succ)
                return res.send({ responseCode: 404, responseMessage: "Data not found" })
            else
                return res.send({ responseCode: 200, responseMessage: "Data found successfully", succ })

        })
    }
    else {
        staticModel.find({ Type: "FAQ", "FAQ.category": "trade" }, { "FAQ.category.$": 1 }, (err, success) => {
            if (err)
                return res.send({ responseCode: 500, responseMessage: "Internal server error.", err })
            else if (success == false)
                return res.send({ responseCode: 404, responseMessage: "Data not found" })
            else {
                staticModel.find({ Type: "FAQ", "FAQ.category": "security" }, { "FAQ.category.$": 1 }, (err1, success1) => {
                    if (err1)
                        return res.send({ responseCode: 500, responseMessage: "Internal server error.", err1 })
                    else if (success1 == false)
                        return res.send({ responseCode: 404, responseMessage: "Data not found" })
                    else {
                        staticModel.find({ Type: "FAQ", "FAQ.category": "feedback" }, { "FAQ.category.$": 1 }, (err2, success2) => {
                            if (err2)
                                return res.send({ responseCode: 500, responseMessage: "Internal server error.", err2 })
                            else if (success2 == false)
                                return res.send({ responseCode: 404, responseMessage: "Data not found" })
                            else {
                                staticModel.find({ Type: "FAQ", "FAQ.category": "transfer" }, { "FAQ.category.$": 1 }, (err3, success3) => {
                                    if (err3)
                                        return res.send({ responseCode: 500, responseMessage: "Internal server error.", err3 })
                                    else if (success3 == false)
                                        return res.send({ responseCode: 404, responseMessage: "Data not found" })
                                    else {

                                        let obj = {
                                            trade: success[0].FAQ,
                                            security: success1[0].FAQ,
                                            feedback: success2[0].FAQ,
                                            transfer: success3[0].FAQ
                                        }

                                        return res.send({ responseCode: 200, responseMessage: "Data found successfully", obj })

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
//================================================================ Add FAQ ==================================================
const AddFaq = (req, res) => {
    let obj = {};
    staticModel.findOne({
            'Type': 'FAQ'
    }).exec((err, succ) => {
        if (err)
        return res.send({ responseCode: 500, responseMessage: "Internal server error.", err })
        else if (!succ) {
            return res.send({ responseCode: 404, responseMessage: "Data not found" })
        } else {

            staticModel.findOneAndUpdate({
                "_id": req.body._id
            }, {
                    $push: {
                        "FAQ": {
                            "question": req.body.question,
                            "answer": req.body.answer,
                            "category": req.body.category
                        }
                    }
                }, {
                    new: true
                },
                (error, result) => {
                    if (error)
                        return res.send({ responseCode: 500, responseMessage: "Internal server error.", error })
                    else if (!result)
                        return res.send({ responseCode: 404, responseMessage: "Data not found" })
                    else
                        return res.send({ responseCode: 200, responseMessage: "Faq content added Successfully", result });
                })
        }
    })
}

// //================================================================ view individual FAQ ==================================================

const viewFaq = (req, res) => {
    staticModel.findOne({
        "FAQ._id": req.body._id,
        'status': "ACTIVE",
        "Type": "FAQ"
    }, {
            "FAQ.$._id": 1
        },
        (err1, success) => {
            if (err1)
                return res.send({ responseCode: 500, responseMessage: "Internal server error.", err1 })
            else if (!success)
                return res.send({ responseCode: 404, responseMessage: "Data not found" })
            else
                return res.send({ responseCode: 200, responseMessage: "Data found successfully", success })
        })
}










//================================================================ Update FAQ ==================================================
const updateFaq= (req, res) => {
    staticModel.findOne({
        'Type': 'FAQ'
    }).exec((err, succ) => {
        if (err)
            return global_fn.responseHandler(res, 400, err);
        else {
            console.log("QQQQQQQQQ>>>>>>>>>>", succ);
            staticModel.findOneAndUpdate({
                "FAQ._id": req.body._id
            }, {
                    $set: {
                        "FAQ.$": {
                            "_id": req.body._id,
                            "question": req.body.question,
                            "answer": req.body.answer,
                            "category": req.body.category
                        }
                    }
                }, {
                    new: true
                },
                (error, result) => {
                    console.log("@@@@@@@@@", error, result)
                    if (error)
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", error })
                    else if (!result)
                    return res.send({ responseCode: 404, responseMessage: "Data not found" })
                    else
                    return res.send({ responseCode: 200, responseMessage: "Faq content updated successfully", result });

                })
        }
    })

}

    //================================================================ delete individual FAQ ==================================================
  const deletedFaq= (req, res) => {
        staticModel.findOneAndUpdate({
            "FAQ._id": req.body._id,
            status: "ACTIVE",
            "Type" : "FAQ"
        }, {
                $pull: {
                    FAQ: {
                        _id: req.body._id
                    }
                }
            }, {
                new: true
            }, (err1, success) => {
                if (err1)
                return res.send({ responseCode: 500, responseMessage: "Internal server error.", err1 })
                else if (!success)
                return res.send({ responseCode: 404, responseMessage: "Data not found" })
                else
                return res.send({ responseCode: 200, responseMessage: "Faq Content deleted successfully" });

            })
    }







    module.exports = {

        staticContentGet: staticContentGet,
        StaticContentUpdate: StaticContentUpdate,
        staticContentById: staticContentById,
        staticContent: staticContent,
        AddFaq,
        viewFaq,
        updateFaq,
        deletedFaq

    }


var Job = require('../models/Job');
var Company = require('../models/Company');
var verified = require('../config/verified');
var Handlebars = require('handlebars');
var fs = require('fs');
var config = require('../config/database');
var getToken = require('../config/token');
var jwt = require('jwt-simple');
module.exports = function (app, io) {

    app.post('/api/qwertyuiop/jobs/:id', verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            if (user.isAdmin && req.body.status) {
                Job.updateOne({_id:req.params.id},{status:req.body.status,rejectedReason:req.body.rejectedReason}).exec(function (err, r) {
                    return res.json({
                        success: true,
                        msg: 'Đã cập nhật trạng thái.'
                    });
                });
            }else {
                return res.json({
                    success: false,
                    msg: 'No permission.'
                });
            }
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });

    app.get('/api/qwertyuiop/jobs/:id', verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            if (user.isAdmin) {
                Job.findOne({status:'PENDING',_id:req.params.id}).populate('company').exec(function (err, r) {
                    res.json(r || {});
                });
            }else {
                return res.json({
                    success: false,
                    msg: 'No permission.'
                });
            }
            
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });

    app.get('/api/qwertyuiop/jobs/', verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            if (user.isAdmin) {
                Job.find({status:'PENDING'}).populate('company').exec(function (err, r) {
                    res.json(r || []);
                });
            }else {
                return res.json({
                    success: false,
                    msg: 'No permission.'
                });
            }
            
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });


    app.post('/api/qwertyuiop/companies/:id', verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            if (user.isAdmin && req.body.status) {
                Company.updateOne({_id:req.params.id},{status:req.body.status,rejectedReason:req.body.rejectedReason}).exec(function (err, r) {
                    return res.json({
                        success: true,
                        msg: 'Đã cập nhật trạng thái.'
                    });
                });
            }else {
                return res.json({
                    success: false,
                    msg: 'No permission.'
                });
            }
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });

    app.get('/api/qwertyuiop/companies/:id', verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            if (user.isAdmin) {
                Company.findOne({status:'PENDING',_id:req.params.id}).populate('company').exec(function (err, r) {
                    res.json(r || {});
                });
            }else {
                return res.json({
                    success: false,
                    msg: 'No permission.'
                });
            }
            
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });

    app.get('/api/qwertyuiop/companies/', verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            if (user.isAdmin) {
                Company.find({status:'PENDING'}, function (err, r) {
                    res.json(r || []);
                });
            }else {
                return res.json({
                    success: false,
                    msg: 'No permission.'
                });
            }
            
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });
}
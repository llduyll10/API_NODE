var Pdf = require('../models/Pdf');
var config = require('../config/database');
var verified = require('../config/verified');
var getToken = require('../config/token');
var jwt = require('jwt-simple');

module.exports = function (app, io) {
    app.post('/api/cv/',verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            if (req.body.url) {
                    var user = jwt.decode(token, config.secret);
                var c = new Pdf(req.body);
                c.user = user._id;
                c.status = "ACTIVE";
                c.createdDate = new Date();
                c.save(function (err, r) {
                    if (err) {
                        res.json({ success: false, msg: err.message });
                    } else {
                        res.json({ success: true });
                    }
                });
            }else {
                res.json({ success: false, msg:'url key is required'});
            }
            
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });

    app.get('/api/cv/',verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            Pdf.find({ user: user._id,status:'ACTIVE'}, function (err, r) {
                res.json(r || []);
            });
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });

    app.delete('/api/cv/:id',verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            Pdf.update({ user: user._id,_id:req.params.id}, {status:"DELETED"}, function (err, r) {
                return res.json({
                    success: true,
                    msg: 'CV Deleted Successful.'
                });
            });
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });
}



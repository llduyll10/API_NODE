var Company = require('../models/Company');
var Job = require('../models/Job');
var User = require('../models/User');
var config = require('../config/database');
var verified = require('../config/verified');
var getToken = require('../config/token');
var jwt = require('jwt-simple');
module.exports = function (app, io) {
    app.get('/api/companies', function (req, res) {
        Company.find({status:'ACTIVE'}).sort({_id: 'desc'}).exec(function (err, r) {
            res.json(r || []);
        });
    });

    app.get('/api/companies/:slug', function (req, res) {
        Company.findOne({slug:req.params.slug,status:'ACTIVE'}, function (err, r) {
            res.json(r || {});
        });
    });

    app.get('/api/companies/:id/jobs', function (req, res) {
        Job.find({company:req.params.id,status:'ACTIVE'}).populate('company').sort({_id: -1}).limit(5).exec(function (err, r) {
            res.json(r || []);
        });
    });

    app.post('/api/company/request',verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);

            Company.findOne({ user: user._id}, function (err, r) {
                if (r && r._id) {
                    return res.json({
                        success: false,
                        msg: 'You have already a company.'
                    });
                }else {
                    var c = new Company(req.body);
                    c.status = 'PENDING';
                    c.user = user._id;
                    c.createdDate = new Date();
                    c.save(function (err, r) {
                        if (err) {
                            res.json({ success: false, msg: err.message });
                        } else {
                            res.json({ success: true});
                        }
                    });
                }
            });
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });

    app.get('/api/user/detail',verified, function (req, res) {
        var token = getToken(req.headers);
        var co,ur;
        if (token) {
            var user = jwt.decode(token, config.secret);
            var c = 0;
            Company.findOne({ user: user._id}, function (err, r) {
                co = r;
                cb();
            });

            User.findOne({ _id: user._id}).select(['-password']).exec((function(err, r) {
                ur = JSON.parse(JSON.stringify(r));
                if (user && user.isAdmin) {
                    ur.isAdmin = user.isAdmin; 
                }
                cb();
            }));

            
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }

        function cb() {
            if (++c===2) {
                return res.json({
                    success: true,
                    user: ur,
                    company:co
                });
            }
        }
    });


    app.post('/api/user/detail',verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            var c = 0;
            var body = req.body;
            if (body.company) {
                var co = body.company;
                delete co.status;
                delete co.createdDate;
                delete co.modifiedDate;
                delete co.modifiedDate;
                delete co.user;
                delete co.slug;
                delete co._id;
                Company.findOne({ user: user._id}).exec((function(err,resCo) {
                    resCo.modifiedDate = new Date();
                    resCo.name = co.name;
                    if (resCo.status === 'REJECTED') {
                        resCo.status = "PENDING";
                    }
                    resCo.save(function (err1, r1) {
                        Company.updateOne({ user: user._id},co).exec((function(err, rs) {
                            cb();
                        }));
                    });
                }));
            }else {
                cb();
            }
            
            if (body.user) {
                var u = {};
                if (body.user.name) {
                    u.name = body.user.name;
                }
                if (body.user.avatar) {
                    u.avatar = body.user.avatar;
                }
                if (body.user.phone) {
                    u.phone = body.user.phone;
                }

                if (body.user.video) {
                    u.video = body.user.video;
                }

                if (body.user.banner) {
                    u.banner = body.user.banner;
                }
                User.updateOne({ _id: user._id}, u).exec((function(err, courseBook) {
                    cb();
                }));
            }else {
                cb();
            }
            
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }

        function cb() {
            if (++c===2) {
                return res.json({
                    success: true,
                    msg: 'Updated Successful'
                });
            }
        }
    });


    app.get('/api/company/jobs',verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            Company.findOne({ user: user._id}, function (err, r) {
                if (r && r._id) {
                    Job.find({ user: user._id,company:r._id}, function (err, r) {
                        res.json(r || []);
                    });
                }else {
                    res.json([]);
                }
            });
        }else {
            return res.json({
                success: false,
                msg: 'No token provided.'
            });
        }
    });

    app.get('/api/top/companies/', function (req, res) {
        Company.find({ position: 'top' }, function (err, r) {
            res.json(r || []);
        });
    });
    
}


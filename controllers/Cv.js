var Cv = require('../models/Cv');
var Job = require('../models/Job');
var Company = require('../models/Company');
var verified = require('../config/verified');
var Handlebars = require('handlebars');
var fs = require('fs');
var config = require('../config/database');
var getToken = require('../config/token');
var jwt = require('jwt-simple');
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport({
    host: "mail.name.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: "jobs@viladev.com",
      pass: "@Viladev2020"
    }
  });

module.exports = function (app, io) {
    app.post('/api/apply/job', function (req, res) {
        if (req.body.job && req.body.email && req.body.company && req.body.name) {
            var c = new Cv(req.body);
            c.createdDate = new Date();
            if (req.body.jobName) {
                Company.findOne({ _id: req.body.company, status: 'ACTIVE' }).populate('user').exec(function (err, r) {
                    var mailOptions = {
                        to: r.user.email,
                        from: '"Job VilaDev Team" <jobs@viladev.com>',
                        subject: 'VilaDEV - '+req.body.name+' applies for '+req.body.jobName,
                        html: 'Hi '+ r.user.name +' , <br> <br>' +
                        'Congratulations! <br> <br>'+
                        'You got the CV which applied to <b>'+req.body.jobName+'</b> position. <br>' +
                        'We have sent it to your account on <a href="https://viladev.com/">https://viladev.com/</a>, please check! <br> <br>' +
                        'Best, <br>' +
                        'The vilaDev Team'
                    };
                    smtpTransport.sendMail(mailOptions, function (err) {
                        console.log(err);
                    });
                });
            }
            

            c.save(function (err, r) {
                if (err) {
                    res.json({ success: false, msg: err.message });
                } else {
                    res.json({ success: true });
                }
            });

        }else {
            res.json({ success: false, msg:'job, email, company, name key is required'});
        }
        
    });

    app.get('/api/view-job-cv', verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            if (req.query.job) {
                var user = jwt.decode(token, config.secret);
                var d = 0;
                var data = {
                    cvs:[],
                    job:{}
                };
                Company.findOne({ user: user._id }, function (err, r) {
                    if (r && r._id) {

                        Cv.find({job:req.query.job,company:r._id}).populate('user','phone').exec(function (err, cr) {
                            data.cvs = cr || [];
                            cb();
                        });

                        Job.findOne({_id:req.query.job,company:r._id}).select('name').exec(function (err, job) {
                            data.job = job;
                            cb();
                        });

                    }else {
                        res.json({ success: false, msg: "Company not found" });
                    }
                });
            }else {
                res.json({ success: false, msg:'job key is required'});
            }
        }else {
            res.json({ success: false,msg: 'No token provided.'});
        }

        function cb() {
            if (++d===2) {
                res.json(data);
            }
        }
    });

    app.get('/api/check-job-applied', verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            if (req.query.job) {
                var user = jwt.decode(token, config.secret);
                Cv.findOne({job:req.query.job,user:user._id}).exec(function (err, cr) {
                    res.json(cr || { success: false, msg: "CV not found" });
                });
            }else {
                res.json({ success: false, msg:'job key is required'});
            }
        }else {
            res.json({ success: false,msg: 'No token provided.'});
        }
    });

    app.get('/api/all-cv-applied', verified, function (req, res) {
        var token = getToken(req.headers);
        if (token) {
            var user = jwt.decode(token, config.secret);
            Cv.find({user:user._id}).populate('job').exec(function (err, cr) {
                res.json(cr || []);
            });
        }else {
            res.json({ success: false,msg: 'No token provided.'});
        }
    });
}



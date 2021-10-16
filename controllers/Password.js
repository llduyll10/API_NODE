var env = process.env.NODE_ENV;
var User = require('../models/User');
var jwt = require('jwt-simple');
var config = require('../config/database');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var async = require('async');
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport('smtps://phamyenbk%40gmail.com:kcqxcxeassgfqdts@smtp.gmail.com');
module.exports = function (app, io) {

  app.post('/api/reset/:token', function (req, res) {
    if (!req.body.password) {
      return res.json({
        success: false
      });
    }
    async.waterfall([
      function (done) {
        User.findOne({
          resetPasswordToken: req.params.token,
          resetPasswordExpires: {
            $gt: Date.now()
          }
        }, function (err, user) {
          if (!user) {
            return res.json({
              success: false,
              msg: 'Mã code hết hạn hoặc không tồn tại.'
            });
          }

          bcrypt.genSalt(10, function (err, salt) {
            if (err) {
              return res.json({
                success: false,
                msg: err.message
              });
            }
            bcrypt.hash(req.body.password, salt, function (err, hash) {
              if (err) {
                return res.json({
                  success: false,
                  msg: err.message
                });
              } else {
                user.password = hash;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save(function (err) {
                  done(err, user);
                });
              }
            });
          });


        });
      },
      function (user, done) {
        var mailOptions = {
          to: user.email,
          from: 'job@lakejob.io',
          subject: 'VilaDEV - Password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          done(err);
        });
      }
    ], function (err) {
      if (err) {
        res.json({
          success: false,
          msg: err.message
        });
      } else {
        res.json({
          success: true,
          msg: 'Mật khẩu thay đổi thành công '
        });
      }
    });
  });


  app.get('/api/reset/:token', function (req, res) {
    User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    }, function (err, user) {
      if (!user) {
        return res.json({
          success: false,
          msg: 'Mã code hết hạn hoặc không tồn tại.'
        });
      }
      return res.json({
        success: true,
        msg: 'Mã code có hiệu lực.'
      });
    });
  });

  app.post('/api/forgot', function (req, res, next) {

    User.findOne({
      email: req.body.email
    }, function (err, user) {
      if (!user) {
        return res.json({
          success: false,
          msg: "Tài khoản không tồn tại"
        });
      }

      crypto.randomBytes(20, function(err, buf) {
        if (err) {
          return res.json({
            success: false,
            msg: err.message
          });
        }
        var token = buf.toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(function (err,rs) {
          if (err) {
            res.json({
              success: false,
              msg: err.message
            });
          } else {
            email(token, user)
          }
        });
      });

      
    });

    function email(token, user) {
      var mailOptions = {
        to: user.email,
        from: 'job@lakejob.io',
        subject: 'VilaDEV - Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://viladev.com/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        if (err) {
          res.json({
            success: false,
            msg: err.message
          });
        } else {
          res.json({
            success: true,
            msg: 'Đã gửi hướng dẫn đến ' + req.body.email
          });
        }
      });
    }
  });
}



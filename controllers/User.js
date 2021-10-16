var env = process.env.NODE_ENV;
var User = require('../models/User');
var jwt = require('jwt-simple');
var config = require('../config/database');
var FB = require('fb');
var bcrypt = require('bcrypt');

module.exports = function (app, io) {


  app.post('/api/signup', makeSignup);

  function makeSignup(req, res) {
    if (!req.body.email || !req.body.password) {
      res.status(200).send({
        success: false,
        msg: 'Email, Password bắt buộc.'
      });
    } else {



      bcrypt.genSalt(10, function (err, salt) {
        if (err) {
          return res.json({ success: false, msg: err.message });
        }
        bcrypt.hash(req.body.password, salt, function (err, hash) {
          if (err) {
            return res.json({ success: false, msg: err.message });
          } else {
            createUser(hash)
          }
        });
      });


      function createUser(pass) {
        User.findOne({
          email: req.body.email,
          status: 'ACTIVE'
        }).exec((function (err, user) {
          if (user && user._id) {
            res.json({
              success: false,
              msg: 'Email đã tồn tại'
            });
          } else {
            var o = {
              email: req.body.email,
              password: pass,
              name: req.body.name || '',
              type: 'USER',
              status: 'ACTIVE',
              createdDate: new Date()
            };

            var newUser = new User(o);
            newUser.save(function (err, user) {
              if (err) {
                return res.json({
                  success: false,
                  msg: err.message
                });
              } else {
                res.json({
                  success: true
                });
              }
            });
          }

        }));
      }


    }
  }


  // authenticate
  app.post('/api/login/', function (req, res) {
    if (!req.body.email) {
      res.status(200).send({
        success: false,
        msg: 'Email bắt buộc.'
      });
    } else {
      if (req.body.access_token) {
        FB.setAccessToken(req.body.access_token);
        FB.api('/me', {
          fields: 'email'
        }, function (response) {
          if (response.email === req.body.email) {

            User.findOne({
              email: req.body.email,
              status: 'ACTIVE'
            }).select(['-password']).exec((function (err, user) {
              if (user) {
                res.status(200).send({
                  success: true,
                  token: jwt.encode(user, config.secret),
                  name: user.name
                });
              } else if (err === null && user === null) {
                var o = {
                  email: req.body.email,
                  name: req.body.name || '',
                  type: 'USER',
                  status: 'ACTIVE',
                  createdDate: new Date()
                };
                var newUser = new User(o);
                newUser.save(function (err, userNew) {
                  if (userNew) {
                    res.status(200).send({
                      success: true,
                      token: jwt.encode(userNew, config.secret),
                      name: userNew.name
                    });
                  } else {
                    res.json({
                      success: false,
                      msg: err.message
                    });
                  }
                });
              } else {
                return res.json({
                  success: false,
                  msg: err.message
                });
              }
            }));


          } else {
            res.status(200).send({
              success: false,
              msg: 'Tài khoản không tồn tại.'
            });
          }
        });
      } else {
        User.findOne({
          email: req.body.email,
          status: 'ACTIVE'
        }).exec((function (err, user) {
          if (user) {
            user.comparePassword(req.body.password, function (err, isMatch) {r
			        if (isMatch && !err) {
                var d = JSON.parse(JSON.stringify(user));
                delete d.password;
                if (config.admin.includes(req.body.email)) {
                    d.isAdmin = true;
                }
                res.status(200).send({
                  success: true,
                  token: jwt.encode(d, config.secret),
                  name: d.name
                });
			        } else {
			          res.status(200).send({success: false, msg: 'Sai mật khẩu.'});
			        }
			      });
          } else {
            res.status(200).send({
              success: false,
              msg: 'Tài khoản không tồn tại.'
            });
          }
        }));
      }
    }
  });

}
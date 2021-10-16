var S3Sign = require('../config/S3Sign');
const url = require('url');
module.exports = function(app,io){
	app.post('/api/s3/signed',function (req, res) {
        var fileName = req.body.fileName;
        var acl = req.body.acl;
        if (fileName) {
          var url = S3Sign.signer(acl,fileName);
		      res.status(200).send({success: true,url:url});
        }else {
            res.status(200).send({success: false,msg:'fileName key is required'});
        }
  });
  
  app.post('/api/s3/read',function (req, res) {
      var urlS3 = req.body.url;
      var acl = req.body.acl;
      if (urlS3) {
        var loc = url.parse(urlS3);
        var fileName = loc.pathname.substr(1);
        var urlSigned = S3Sign.signer(acl,fileName,'getObject');
        res.status(200).send({success: true,url:urlSigned});
      }else {
          res.status(200).send({success: false,msg:'url key is required'});
      }
  });

}

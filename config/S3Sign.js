const AWS = require('aws-sdk')
module.exports = {
    signer:function(acl,fileName,method) {
        const s3 = new AWS.S3({
            accessKeyId: 'AKIAZGWCOWCEONTW4XHD',
            secretAccessKey: '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',
            signatureVersion: 'v2'
        });
        var expireSeconds = 60
        var opt = {
            Bucket: 'blog_duynnd',
            Expires: expireSeconds,
            Key: fileName
        }
        if (acl) {
            opt['ACL'] = acl;
        }
        return s3.getSignedUrl(method || 'putObject',opt);
    }
};


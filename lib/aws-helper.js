var AWS = require('aws-sdk');
var s3 = new AWS.S3();

var KEY_ERROR = "NoSuchKey"

function AWSHelper(options){
    if(options && options.credsPath){
        s3.config.loadFromPath(options.credsPath);
    }
}

AWSHelper.prototype.init = function(options){
    if(options && options.credsPath){
        s3.config.loadFromPath(options.credsPath);
    } else{
        throw 'You must initialize AWS with some credentials'
    }
}

AWSHelper.prototype.updateObject = function(bucket,key,body,callback){
    var _this = this;
    var params = {
        Bucket: bucket, 
        Key: key
    };
    _this.getObject(bucket,key,function(data){

    })
}

AWSHelper.prototype.getObject = function(bucket,key,callback){
    var _this = this;
    var params = {
        Bucket: bucket, 
        Key: key
    };
    s3.getObject(params, function(err, data) {        
        if (err){
            if(err.code == KEY_ERROR){
                _this.setObject(bucket,key,'{}',function(){
                    s3.getObject(params, function(err, data) {callback(data)});
                })
            } else{
                throw err.stack;
            }
        } else{
            callback(data)
        }
    });
}

AWSHelper.prototype.setObject = function(bucket,key,body,callback){
    var params = {
        Body: body, 
        Bucket: bucket, 
        Key: key
    };
    s3.putObject(params, function(err, data) {
        if (err) throw err.stack // an error occurred
        else     callback(data);        // successful response
        
    });
}

module.exports = AWSHelper;
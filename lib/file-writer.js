var fs = require('fs');
var pathRoot = './tweet-storage/';

function FileWriter(){
    
}

FileWriter.prototype.getTweetFile = function(fileName,callback){
    var _this = this;
    var fileLocation = pathRoot + fileName + '.json';    
    fs.readFile(fileLocation, function(err, data) {
        if (err) {
            console.log(err)
            if(err.code == 'ENOENT'){
                _this.createTweetFile(fileName,function(val){
                    callback((val));
                });
            }
        } else{
            console.log(typeof data)
            callback(JSON.parse(data))
        }
    });
}

FileWriter.prototype.putTweetFile = function(fileName,tweetArray,callback){
    var fileLocation = pathRoot + fileName + '.json';
    this.getTweetFile(fileName, function(data) {
        var tweets = {tweets:[]};
        console.log('before',data.tweets.length)
        console.log('tweetArrayLength',tweetArray.length)
        if(data && data.tweets){
            data.tweets = tweetArray;//data.tweets.concat(tweetArray);
        }
        console.log('after',data.tweets.length)
        fs.writeFile(fileLocation, JSON.stringify(data), function (err) {
            console.log(err)
            callback()
        });
    });
}

FileWriter.prototype.createTweetFile = function(fileName,callback){
    var fileLocation = pathRoot + fileName + '.json';    
    fs.writeFile(fileLocation, JSON.stringify({ tweets : []}), function (err) {
        callback(({ tweets : []}));
    });
}
var fileWriter = new FileWriter();
module.exports = fileWriter;
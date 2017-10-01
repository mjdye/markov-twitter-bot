var twitter = require('twitter');



function TwitterHelper(options){
    this.init(options);
}

TwitterHelper.prototype.init = function(options){
    if(options && (!options.consumer_key || !options.consumer_secret || !options.access_token_key || !options.access_token_secret)){
        throw "You must instantiate the twitter client with valid credentials"
    } else{
        this.client = new twitter({
            consumer_key: options.consumer_key,
            consumer_secret: options.consumer_secret,
            access_token_key: options.access_token_key,
            access_token_secret: options.access_token_secret
        });
    }
} 



TwitterHelper.prototype.getStreamTweets = function(options,callback){
    options.searchKey = typeof options.searchKey !== 'undefined' ? options.searchKey : 'Hello World!'; 
    options.getRetweets = typeof options.getRetweets !== 'undefined' ? options.getRetweets : false; 
    this.client.stream('statuses/filter', {track: options.searchKey}, function(stream) {
        stream.on('data', function(event) {
            callback(event);
        });
       
        stream.on('error', function(error) {
          throw error;
        });
    });
}

TwitterHelper.prototype.postTweet = function(tweet,callback){
    this.client.post('statuses/update', {status: tweet},  function(error, tweet, response) {
        if(error){
            console.log(JSON.stringify(error));
        };
        console.log(tweet.text);  // Tweet body. 
    });
}


TwitterHelper.prototype.searchTweets = function(options,callback){
    //searchParam,tweetCount
    var rawSearchParam = options.search_string;
    var _this = this;
    var tweetCount = options.numTweetsToFetch;
    var count;
    var allTweets = [];
    var tweetText = '';
    var allTweetText = [];

    if(tweetCount > 100){
        count = 100; 
    } else{
        count =  tweetCount; 
    }

    function recursiveTweets(max_id){
        var searchObject = {
            q: rawSearchParam,
            count:count
        }
        if(max_id){
            searchObject.max_id = max_id;
        }
        _this.client.get('search/tweets', searchObject, function(error, tweets, response) {
            if(error){
                console.log(error)
                throw(error)
            }
            allTweets = allTweets.concat(tweets.statuses);
            if(tweets.statuses.length == 0){
                callback(tweetText,allTweetText)
            } else {
                if(allTweets.length >= tweetCount || tweets.statuses.length < count){
                    for(var i = 0; i < allTweets.length; i++){
                        tweetText = tweetText + '\n' + textParser.clean(allTweets[i].text);
                        allTweetText.push(textParser.clean(allTweets[i].text));
                    }
                    _this.writeTweetsToJson(tweetText,function(){
                        callback(tweetText,allTweetText)
                    });  
                } else{
                    var thisMaxId = tweets.statuses[tweets.statuses.length-1].id; 
                    recursiveTweets(thisMaxId);
                }
            }
            
        });
    }
    recursiveTweets();
}

module.exports = TwitterHelper;
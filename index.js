var awsHelper = require('./lib/aws-helper.js');
var markovTwitterHelper = require('./lib/markov-twitter-helper.js');
var twitterHelper = require('./lib/twitter-helper.js');
var fileWriter = require('./lib/file-writer.js');
var markovTwitter = new markovTwitterHelper();
var frequencyInMinutes = 10;
var minTweetCount = 100;

var twitterConfig = require('./config/matt-twitter-apps.json');
var filters = [
    'boycott',
    'takeaknee',
    'trump',
    'anthem'
]

function getStreamTweets(config,searchKey,callback){
    var fileName = config.hashtag;
    var search = config.hashtag;
    var thisTwitterHelper = new twitterHelper({
        consumer_key : config.consumer_key,
        consumer_secret : config.consumer_secret,
        access_token_key : config.access_token_key,
        access_token_secret : config.access_token_secret
    })

    var newTweets = [];
    var newTweetText = [];
    var search = {
        searchKey: search
    }
    thisTwitterHelper.getStreamTweets(search,function(newTweet){
        if(newTweet && newTweet.text){            
            if(!newTweet.retweeted_status){
                var pushTweet = true;
                for(var i = 0; i < filters.length; i++){
                    var filter = filters[i];
                    if(newTweet.text.toLowerCase().indexOf(filter) > -1){
                        pushTweet = false;
                    }
                }
                if(pushTweet){
                    newTweets.push(newTweet.text.replace(/\n/g,' '));                    
                }
            }
            if(newTweets.length >= 100){
                var tempTweets = newTweets.slice(0);
                newTweets = [];
                console.log('pushing tweets to',fileName)
                fileWriter.putTweetFile(fileName,tempTweets,function(response){
                    
                })
            }
        }
    });
}


function createMarkovTweets(config,callback){
    getTweetFile(config,function(tweetArray){
        var options = {};
        if(tweetArray.length > minTweetCount){
            config.tweetText = tweetArray.join('\n');
            config.tweets = tweetArray;
            config.numTweetsToPredict = 1;
            config.state_size = 2;
            markovTwitter.generateMarkovTweets(config,function(tweets){
                for(var i = 0; i < tweets.length; i++){
                    if(tweets[i].toLowerCase().indexOf(config.hashtag.toLowerCase()) == -1){
                        tweets[i] = tweets[i] + ' #' + config.hashtag;
                    }
                }
                callback(tweets[0]);
            })
        } else{
            callback(false);
        }
        
    })
}

function getTweetFile(twitterApp,callback){
    fileWriter.getTweetFile(twitterApp.hashtag,function(tweets){
        callback(tweets.tweets);
    })
}

function postTweet(twitterPostHelper,twitterApp){
    createMarkovTweets(twitterApp,function(tweet){
        if(tweet){
            twitterPostHelper.postTweet(tweet,function(){
                console.log('posted',tweet)
            })
        }
    });
}

function execute(){
    var config = twitterConfig;
    var twitterApps = twitterConfig.apps;
    var thisTwitterApp;

    var twitterPostHelper = new twitterHelper({
        consumer_key : config.postApp.consumer_key,
        consumer_secret : config.postApp.consumer_secret,
        access_token_key : config.postApp.access_token_key,
        access_token_secret : config.postApp.access_token_secret
    })

    for(var i = 0; i < twitterApps.length; i++){
        thisTwitterApp = JSON.parse(JSON.stringify(twitterApps[i]));        
        (function(thisTwitterApp){
            if(thisTwitterApp.hashtag != false && thisTwitterApp.access_token_key.length > 0 && thisTwitterApp.access_token_secret.length > 0){
                postTweet(twitterPostHelper,thisTwitterApp)
                getStreamTweets(thisTwitterApp);
                setTimeout(function(){
                    console.log(thisTwitterApp.hashtag)
                    postTweet(twitterPostHelper,thisTwitterApp)
                }, frequencyInMinutes*60*1000);
            }
        })(thisTwitterApp)
        
    }    
}

execute()

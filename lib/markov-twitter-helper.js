var nodeMarkovifyTwitter = require('node-markovify').markovTwitter;
var useLocalTweets = false;
var filters = ' -filter:retweets -filter:media';
var state_size = 1;


var options = {
    getLocalTweets:useLocalTweets,
    state_size:state_size,
    search_string: '#nodejs',
    numTweetsToFetch: 100,
    numTweetsToPredict: 1
}
var thisMarkovTwitter = new nodeMarkovifyTwitter();

function MarkovTwitterHelper(search_string){

}

MarkovTwitterHelper.prototype.generateMarkovTweets = function(options,callback){
    options.state_size = typeof options.state_size !== 'undefined' ? options.state_size : state_size;
    options.tweets = typeof options.tweets !== 'undefined' ? options.tweets : ['Hello World!'];

    thisMarkovTwitter.generateMarkovTweets(options,function(tweets){
        callback(tweets);
    });
}


module.exports = MarkovTwitterHelper;



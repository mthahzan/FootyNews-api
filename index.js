var _ = require('underscore');
var log = require('debug')('FootyNews');
var MongoClient = require('mongodb').MongoClient;
var RSSReader = require('./lib/rss-reader');
var FeedSites = require('./sites/');

var MONGO_URL = 'mongodb://127.0.0.1:27017/footy';
var FETCH_INTERVAL = 1000*60*3;

MongoClient.connect(MONGO_URL, function(err, db) {
  if(err) throw err;
  var Articles = db.collection('articles');
  Articles.remove({}, function (err) {
    _(FeedSites).each(function (site, name) {
      var reader = new RSSReader(Articles, site);
      reader.init(function (err) {
        reader.run(afterRun);
        setInterval(function() {
          reader.run(afterRun);
        }, FETCH_INTERVAL);

        function afterRun (err) {
          // TODO Handle Errors
          log('Successfully Updated', name);
        }
      });
    });
  });
});
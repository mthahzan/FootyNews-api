var _ = require('underscore');
var Hapi = require('hapi');
var log = require('debug')('FootyNews');
var MongoClient = require('mongodb').MongoClient;
var RSSReader = require('./lib/rss-reader');
var FeedSites = require('./sites/');

var MONGO_URL = process.env.MONGO_URL;
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
          if(err) {
            console.error(err);
          } else {
            log('Successfully Updated', name);
          }
        }
      });
    });
  });

  var server = new Hapi.Server('localhost', 8000);

  server.route({
    method: 'POST',
    path: '/api/v1/getHeadlines',
    handler: function (request, reply) {
      Articles.find({}, {fields: {html: 0}}).toArray(function (err, articles) {
        reply(articles.map(function (article) {
          return {
            news_id: article._id,
            headline: article.title,
            league: article.category
          };
        }));
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/api/v1/getArticle',
    handler: function (request, reply) {
      Articles.findOne({_id: request.payload.news_id}, function (err, article) {
        if(article) {
          reply({
            news_id: article._id,
            headline: article.title,
            league: article.category,
            body: article.html,
            source: article.link,
            img_url: article.image
          });
        } else {
          reply({
            status: 'No such article'
          });
        }
      });
    }
  });

  server.start();

});
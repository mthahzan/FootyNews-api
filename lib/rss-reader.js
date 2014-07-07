var yql = require('yql');
var async = require('async');
var request = require('request');
var log = require('debug')('RSSReader');

module.exports = RSSReader;

 /**
  * Reads feeds and saves them to MongoDB
  * @param    {Collection} coll MongoDB collection to store articles
  * @param    {Object}     site Site information
  * @property {Number}     last Last updated timestamp
  */
function RSSReader (coll, site) {
  this.coll = coll;
  this.site = site;
  this.last = 0;
};

/**
 * Initialize RSSReader.
 * @param  {Function} callback (error)
 */
RSSReader.prototype.init = function(callback) {
  callback(null);
};

/**
 * Fetches feed, fetches articles and store them in MongoDB
 * @param  {Function} callback (error)
 */
RSSReader.prototype.run = function(callback) {
  var self = this;
  this._readURL(this.site.feedUrl, function (err, feed) {
    if(err) {
      callback(err);
    } else if(feed.updated > self.last) {
      var articles = feed.articles.filter(isNewArticle, self);
      async.each(articles, self._fetchArticle.bind(self), function (err) {
        // TODO Handle errors
        log('Fetched feed articles', articles);
        self.last = Date.now();
        self.coll.insert(articles, function (err) {
          // TODO Handle errors
          callback();
        });
      });
    } else {
      callback();
    }
  });

  function isNewArticle (article) {
    return article.updated > this.last;
  }
};

/**
 * Reads feeds from given URL using yql
 * @param  {String}   feedUrl
 * @param  {Function} callback (error, results)
 *   updated: Number
 *   articles: Array
 *     _id: String
 *     updated: Number
 *     title: String
 *     link: String
 */
RSSReader.prototype._readURL = function(feedUrl, callback) {
  var self = this;
  try {
    var query = 'select * from feednormalizer'
    + ' where url=\''+feedUrl+'\' and output=\'atom_1.0\'';
    log('Reading feeds', query);
    yql.exec(query, function (res) {
      if(!self._validResults(res)) {
        callback(new Error('Error reading feeds from url '+feedUrl));
      } else {
        var results = self.site.formatFeed(res.query.results.feed);
        log('Fetched feeds', results);
        callback(null, results);
      }
    });
  } catch(e) {
    callback(e);
  }
};

RSSReader.prototype._validResults = function(res) {
  return res
      && res.query
      && res.query.results
      && res.query.results.feed;
};

RSSReader.prototype._fetchArticle = function(article, callback) {
  var self = this;
  request(article.link, function (err, response) {
    // TODO handle error
    self.site.parser(article, response.body, callback);
  })
};

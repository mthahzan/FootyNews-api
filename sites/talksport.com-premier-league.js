var uuid = require('uuid');
var cheerio = require('cheerio');

var site = {
  name: 'talksport.com-premier-league',
  category: 'Premier League',
  feedUrl: 'http://talksport.com/rss/football/premier-league/feed',
  baseUrl: 'http://talksport.com/'
};

site.formatFeed = function (feed) {
  var results = {};

  results.articles = feed.entry.map(function (article) {
    return {
      _id: uuid.v4(),
      title: article.title,
      link: article.link.href,
      category: site.category,
      sitename: site.name,
      updated: new Date(article.updated).getTime()
    };
  });

  results.updated = results.articles.reduce(function (latest, article) {
    return article.updated > latest ? article.updated : latest;
  }, 0);

  return results;
}

site.parser = function (article, html, callback) {
  try {
    var $ = cheerio.load(html);
    $('div.field-name-body').filter(function () {
      article.html = $(this).first().text();
      $('div.field-name-field-image img').filter(function () {
        article.image = $(this).first().attr('src');
      });
    });
    callback(null);
  } catch(e) {
    article.html = 'ERROR PARSING ARTICLE';
    callback(e);
  }
}

module.exports = site;

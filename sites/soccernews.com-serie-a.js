var uuid = require('uuid');
var cheerio = require('cheerio');

var site = {
  name: 'soccernews.com-serie-a',
  category: 'Seria A',
  feedUrl: 'http://www.soccernews.com/category/serie-a/feed/',
  baseUrl: 'http://www.soccernews.com/'
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
    $('div.entry').filter(function () {
      article.html = $(this).first().text();
      callback(null);
    });
  } catch(e) {
    article.html = 'ERROR PARSING ARTICLE';
    callback(e);
  }
}

module.exports = site;

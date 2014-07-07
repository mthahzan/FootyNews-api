var cheerio = require('cheerio');

var site = {
  name: 'blog.thanish.me',
  category: 'test-site',
  feedUrl: 'http://blog.thanish.me/rss/',
  baseUrl: 'http://blog.thanish.me/'
};

site.parser = function (article, html, callback) {
  try {
    var $ = cheerio.load(html);
    $('section.post-content').filter(function () {
      article.html = $(this).first().text();
      callback(null);
    });
  } catch(e) {
    article.html = 'ERROR PARSING ARTICLE';
    callback(e);
  }
}

module.exports = site;

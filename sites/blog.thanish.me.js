var cheerio = require('cheerio');

var site = {
  name: 'blog.thanish.me',
  category: 'test-site',
  feedUrl: 'http://blog.thanish.me/rss/',
  baseUrl: 'http://blog.thanish.me/'
};

site.parser = function (html, callback) {
  var $ = cheerio.load(html);
  $('section.post-content').filter(function () {
    var data = $(this);
    var html = data.first().html();
    callback(null, html);
  });
}

module.exports = site;

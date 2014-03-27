var http = require('http');
var qiniu = require('node-qiniu');
var fs = require('fs');
var util = require('util');

qiniu.config({
  access_key: '5UyUq-l6jsWqZMU6tuQ85Msehrs3Dr58G-mCZ9rE',
  secret_key: 'YaRsPKiYm4nGUt8mdz2QxeV5Q_yaUzVxagRuWTfM'
});

var uploadPage = fs.readFileSync(__dirname + '/index.html').toString();
var viewPage = fs.readFileSync(__dirname + '/view.html').toString();
var qiniuJs = fs.readFileSync(__dirname + '/../qiniu.js');

var bucket = qiniu.bucket('qiniu-sdk-test');

var server = http.createServer(function(req, res) {
  switch (req.url) {
    case '/':
      var putToken = bucket.token();

      res.end(util.format(uploadPage, putToken));
      break;

    case '/view':
      var getToken = bucket.key('2.jpg').token().token;

      res.end(util.format(viewPage, getToken));
      break;

    case '/qiniu.js':
      res.end(qiniuJs);
      break;
  }
});

server.listen(process.argv[2] || 8080);
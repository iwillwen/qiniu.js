var web = require('webjs');
var qiniu = require('node-qiniu');
var fs = require('fs');
var util = require('util');

qiniu.config({
  access_key: '5UyUq-l6jsWqZMU6tuQ85Msehrs3Dr58G-mCZ9rE',
  secret_key: 'YaRsPKiYm4nGUt8mdz2QxeV5Q_yaUzVxagRuWTfM'
});

var uploadPage = fs.readFileSync(__dirname + '/index.html').toString();
var viewPage = fs.readFileSync(__dirname + '/view.html').toString();
var qiniuJs = fs.readFileSync(__dirname + '/qiniu.min.js');

web.run(process.argv[2] || 8080)
  .get({
    '/': function(req, res) {
      var putToken = (new qiniu.Token.PutPolicy({
        scope: 'qiniu-sdk-test'
      })).token();

      res.send(util.format(uploadPage, putToken));
    },
    '/view': function(req, res) {
      var getToken = (new qiniu.Token.GetPolicy())
        .token('http://qiniu-sdk-test.qiniudn.com/', '2.jpg');

      res.send(util.format(viewPage, getToken));
    },
    '/qiniu.js': function(req, res) {
      res.send(qiniuJs);
    }
  });
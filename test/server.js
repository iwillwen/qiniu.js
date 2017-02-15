var http = require('http');
var qiniu = require('node-qiniu');
var fs = require('fs');
var util = require('util');

qiniu.config({
  access_key: 'T0lz0dQPnAeANGo3jaIAa4hx8pIS5D7uxxNx_Jr5',
  secret_key: '1GhmeedXAtJ7r9A6Cg_Vc2VpcppIczvytKgOjrrC'
});

var uploadPage = fs.readFileSync(__dirname + '/index.html').toString();
var viewPage = fs.readFileSync(__dirname + '/view.html').toString();
var qiniuJs = fs.readFileSync(__dirname + '/../dist/qiniu.js');

var bucket = qiniu.bucket('iwillwen');

var server = http.createServer(function(req, res) {
  switch (req.url) {
    case '/':
      var putToken = bucket.token();

      res.end(util.format(uploadPage, putToken));
      break;

    case '/token':
      var putToken = bucket.token()

      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      res.end(JSON.stringify({
        token: putToken
      }))
      break

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
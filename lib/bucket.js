def('qiniu.Bucket', [ 'qiniu.Asset', 'qiniu.Image', 'qiniu.utils', 'qiniu.deps.file', 'qiniu.deps.Events', 'qiniu.deps.Ajax' ], function(require, exports, module) {
  
  if ('undefined' !== typeof define && define.amd) {
    var Asset  = arguments[0];
    var _Image = arguments[1];
    var utils  = arguments[2];
    var file   = arguments[3];
    var events = arguments[4];
    var ajax   = arguments[5];
  } else {
    var Asset  = require('qiniu.Asset');
    var _Image = require('qiniu.Image');
    var utils  = require('qiniu.utils');
    var file   = require('qiniu.deps.file');
    var events = require('qiniu.deps.Events');
    var ajax   = require('qiniu.deps.Ajax');
  }

  var globalConfig = null;

  window.BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder || false;

  /**
   * Bucket
   * Example:
   * ```
   * var imagesBucket = new qiniu.Bucket('images', {
   *   // special option
   * });
   * ```
   * @param {String} bucketName bucket's name
   * @param {Object} config     config
   */
  function Bucket(bucketName, config) {
    config = config || {};

    this.name = bucketName;
    this.queue = [];
    this.config = utils.objExtend(globalConfig, config, {
      scope: bucketName
    });
  }

  /**
   * Upload a file
   * Example:
   * ```
   * imagesBucket.putFile('example.jpg', __dirname + '/assert/example.jpg', function(err, reply) {
   *   if (err) {
   *     return console.error(err);
   *   }
   *  
   *   console.dir(reply);
   * });
   * ```
   * @param  {String}   key      key
   * @param  {File}     file     file
   * @param  {Object}   options  upload option
   * @param  {Function} callback Callback
   * @return {Promise}           Promise object
   */
  Bucket.prototype.putFile = function(key, _file, options, callback) {
    var promise = new events.Promise();
    var self = this;
    
    switch (arguments.length) {
      case 3:
        if (utils.isFunction(options)) {
          callback = options;
          options = {};
        } else {
          callback = noop;
        }
        break;
      case 2:
        options = {};
        callback = noop;
        break;
    }

    var config = utils.objExtend(utils.objClone(this.config), options);

    var putToken = this.config.putToken;

    // upload API
    var uploadUrl = 'http://' + globalConfig.uploadUrl;

    // isIE
    var isIE = window.ActiveXObject ? true : false;

    var data = {
      token: putToken,
      key: key,
    };

    if (isIE) {
      data.accept = 'text/plain; charset=utf-8';
    }

    // uploading
    var xhr = file.upload({
      url: uploadUrl,
      data: data,
      files: {
        file: _file
      },
      upload: function(xhr, _options) {
        (options.before && utils.isFunction(options.before) ? options.before : noop)
          .call(null, xhr, key, _file);

        promise.emit('before', xhr, key, file);
      },
      progress: function(evt) {
        var totalPercent = evt.loaded / evt.total * 100;
        (options.progress && utils.isFunction(options.progress) ? options.progress : noop)
          .call(null, totalPercent, evt.loaded, evt.total);

        promise.emit('progress', totalPercent, evt.loaded, evt.total);
      },
      complete: function(err, evt) {
        if (err) {
          callback(err);
          return promise.reject(err);
        }

        if (window.JSON) {
          var reply = JSON.parse(xhr.responseText);
        } else {
          var reply = xhr.responseText;
        }

        var asset = self.key(key);

        callback(null, reply, asset, xhr, evt);
        promise.resolve(reply, asset, xhr, evt);
        promise.emit('complete', reply, asset, xhr, evt);
      }
    });

    return promise;
  };

  Bucket.prototype.putChunkedFile = function(key, _file, options, callback) {
    var promise = new events.Promise();
    var self = this;

    var config = utils.objExtend(utils.objClone(this.config), options);

    var putToken = this.config.putToken;

    options.blockSize = options.blockSize || file.MB.form(5);

    // upload API
    var uploadUrl = 'http://' + globalConfig.uploadUrl + '/mkblk/' + options.blockSize;

    // ctx
    var blockCtxes = [];

    if (utils.isFunction(_file.slice)) {
      (function loop(url, start, _callback, host) {
        var end = start + options.blockSize;

        if (start < _file.size) {
          var blob = _file.slice(start, end);

          ajax.postBlob(url, blob, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'Authorization': utils.format('UpToken %s', putToken)
            }
          }, function(err, reply) {
            if (err) {
              callback(err);
              return promise.reject(err);
            }

            var replyData = eval(reply);

            blockCtxes.push(replyData.ctx);

            var host = replyData.host;

            loop(utils.format('%s/bput/%s/%s', host, replyData.ctx, end), end, _callback, host);
          });
        } else {
          return _callback(host);
        }
      })(uploadUrl, 0, function(host) {
        var asset = self.key(key);

        var url = utils.format('%s/rs-mkfile/%s/fsize/%s/mimeType/%s', host, asset.entryUrl(), _file.size, _file.type);

        if (options.params) {
          url ,utils.format('/params/%s')
        }

        if (options.meta) {
          url += utils.format('/meta/%s', utils.safeEncode(options.meta));
        }

        if (options.customer) {
          url += utils.format('/customer/%s', options.customer);
        }

        if (options.rotate) {
          url += utils.format('/rotate/%s', options.rotate);
        }

        ajax.post()
      });
    } else {
      var err = 'no support chunk';

      promise.reject(err);
      callback(err);
    }

    return promise;
  };

  /**
   * Get a key
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  Bucket.prototype.getFile = function(key, callback) {
    // token
    var getToken = this.config.getToken;
    var deferred = new events.Promise();
    callback = callback || noop;

    // key url
    var url = utils.format('http://%s.qiniudn.com/%s?e=3600&token=%s', this.name, key, getToken);

    ajax.get(url, function(err, body) {
      if (err) {
        callback(err);
        return deferred.reject(err);
      }

      callback(null, body);
      deferred.resolve(body);
    });

    return deferred.promise;
  };

  /**
   * return a asset object
   * @param  {String} key key
   * @return {Asset}      asset object
   */
  Bucket.prototype.key = function(key) {
    return new Asset(key, this);
  };
  Bucket.Asset = Asset;

  Bucket.prototype.image = function(key) {
    return new _Image(key, this);
  };
  Bucket.Image = _Image;

  function noop() {
    return false;
  }

  return module.exports = exports = function(config) {
    globalConfig = config;
    Asset = Asset(config);
    return Bucket;
  };
});
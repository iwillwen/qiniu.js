def('qiniu.Asset', [ 'qiniu.utils', 'qiniu.Fop' ], function(require, exports, module) {

  var configData = {};

  if ('undefined' !== typeof define && define.amd) {
    var utils  = arguments[0];
    var Fop    = arguments[1];
  } else {
    var utils  = require('qiniu.utils');
    var Fop    = require('qiniu.Fop');
  }

  /**
   * Asset Class
   * @param {String} key    Asset's key
   * @param {Bucket} parent Bucket object
   */
  function Asset(key, parent, config) {
    this.key = key;
    this.parent = parent;

    this.config = config || {};
  }

  /**
   * return the asset url
   * @return {String} url
   */
  Asset.prototype.url = function() {
    return utils.parent.url() + '/' + this.key;
  };

  /**
   * return the encoded entry url of the asset
   * @return {String} entry url
   */
  Asset.prototype.entryUrl = function() {
    return utils.safeEncode(utils.format(
      '%s:%s',
      this.parent.name, this.key
    ));
  };

  /**
   * return the qrcode image of the asset
   * @param  {Object}   opts     options
   * @return {String}            url
   */
  Asset.prototype.qrcode = function(opts, callback) {
    switch (true) {
      case utils.isFunction(opts):
        callback = opts;
        opts = { mode: 0, level: 'L' };
        break;
      case utils.isObject(opts) && utils.isUndefined(callback):
        callback = noop;
        break;
      case utils.isUndefined(opts):
        opts = { mode: 0, level: 'L' };
        callback = noop;
        break;
    }

    var url = utils.format('%s?qrcode/%d/level/%s', this.url(), opts.mode, opts.level);

    var img = new Image();
    img.src = img.url = url;

    return img;
  };

  Asset.prototype.fop = function(config) {
    return new Fop(this, config);
  };

  /**
   * return a image with a established format
   * @param  {String}   alias    alias name
   * @return {String}            url
   */
  Asset.prototype.alias = function(alias) {
    var url = this.url();

    url += utils.format('%s%s', this.config.separate, alias);

    return url;
  };

  /**
   * Markdown to HTML
   * @param  {Object}   opts     options
   * @return {Promise}           promise object
   */
  Asset.prototype.md2html = function(opts) {

    if (utils.isFunction(opts)) {
      callback = opts;
      opts = {
        mode: false,
        css: false
      };
    } else if (utils.isObject(opts)) {
      callback = callback || noop;
    } else {
      callback = callback || noop;
      opts = {
        mode: false,
        css: false
      };
    }

    var url = this.url() + '?md2html';

    if (opts.mode) {
      url += utils.format('/%s', opts.mode);
    }

    if (opts.css) {
      url += utils.format('/css/%s', utils.safeEncode(opts.css));
    }

    var image = new Image();
    image.src = url;

    return image;
  };

  function noop() { return false; }

  return function(config) {
    configData = config;
    return Asset;
  };
});
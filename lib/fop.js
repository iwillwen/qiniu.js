def('qiniu.Fop', [ 'qiniu.utils' ], function(require, exports, module) {

  if ('undefined' !== typeof define && define.amd) {
    var utils = arguments[0];
  } else if (require instanceof Function) {
    var utils = require('qiniu.utils');
  }

  /**
   * Fop Class
   * @param {Asset} asset    asset
   * @param {Object} _config config
   */
  function Fop(asset, _config) {
    this.parent = asset;
    this.config = utils.objExtend(utils.objClone(config), _config);

    this.query = '';
  }

  /**
   * custom fop
   * @param  {String} str fop string
   * @return {Fop}     fop
   */
  Fop.prototype.fop = function(str) {
    this.query += '|' + str;

    return this;
  };

  /**
   * Add imageInfo to the fop
   * @return {Fop} fop
   */
  Fop.prototype.imageInfo = function() {
    this.query += '|imageInfo';

    return this;
  };

  /**
   * Add exif to the fop
   * @return {Fop} fop
   */
  Fop.prototype.exif = function() {
    this.query += '|exif';

    return this;
  };


  var imageViewTranslations = {
    weight: 'w',
    height: 'h',
    quality: 'q'
  };

  /**
   * Add imageView to the fop
   * @param  {Object} opts options
   * @return {Fop}      fop
   */
  Fop.prototype.imageView = function(opts) {
    var mode = opts.mode;
    delete opts.mode;

    var url = this.url();
    var params = {};

    utils.each(opts, function(value, key) {
      if (imageViewTranslations.hasOwnProperty(key)) {
        key = imageViewTranslations[key];
      }

      params[key] = value;
    });

    this.query += utils.format('|imageView/%d%s', mode, genOptUrl(params));

    return this;
  };

  /**
   * Add imageMogr to the fop
   * @param  {Object} opts options
   * @return {Fop}      fop
   */
  Fop.prototype.imageMogr = function(opts) {
    var params = {};

    utils.objExtend(params, opts);

    this.query += utils.format('|imageMogr/v2/auto-orient%s', genOptUrl(params));

    return this;
  };

  /**
   * Add watermark to the fop
   * @param  {Object} opts options
   * @return {Fop}      fop
   */
  Fop.prototype.watermark = function(opts) {
    var params = {};
    var mode = opts.mode;
    delete opts.mode;

    utils.objExtend(params, opts);

    params.image = utils.safeEncode(params.image);

    this.query += utils.format('|watermark/%d%s', mode, genOptUrl(params));

    return this;
  };

  /**
   * Add qrcode to the fop
   * @param  {Object} opts options
   * @return {Fop}      fop
   */
  Fop.prototype.qrcode = function(opts) {
    opts = opts || {
      mode: 0,
      level: 'L'
    };

    this.query += utils.format('|qrcode/%d/level/%s', this.url(), opts.mode, opts.level);

    return this;
  };

  /**
   * Markdown to HTML
   * @param  {Object}   opts     options
   * @return {Fop}           fop
   */
  Fop.prototype.md2html = function(opts) {
    opts = opts || {
      mode: false,
      css: false
    };

    var url = '|md2html'

    if (opts.css) {
      url += utils.format('/%s', opts.mode);
    }

    if (opts.css) {
      url += utils.format('/css/%s', utils.safeEncode(opts.css));
    }

    this.query += url;

    return this;
  };

  /**
   * get the url of the fop
   * @return {String} url
   */
  Fop.prototype.url = function() {
    return utils.format('%s?%s', this.parent.url(), this.query.substr(1));
  };

  /**
   * return the image of the fop
   * @return {Image} image
   */
  Fop.prototype.image = function() {
    var image = new Image();
    image.src = this.url();

    return image;
  };

  module.exports = exports = Fop;
  return Fop;
});

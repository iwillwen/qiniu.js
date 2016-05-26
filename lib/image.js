import _Asset from './asset'
import utils from './utils'
import file from './deps/file'
import ajax from './deps/ajax'
const Asset = _Asset({})

const imageViewTranslations = {
  weight: 'w',
  height: 'h',
  quality: 'q'
}

class _Image extends Asset {

  /**
   * Image Asset
   * @param {String} key    key
   * @param {Bucket} parent bucket object
   */
  constructor(key, parent, _config) {
    super()

    const config = utils.objExtend(utils.objClone(parent.config), {
      separate: '-'
    }, _config)

    this.key = key
    this.parent = parent
    this.config = config
  }

  /**
   * get the image's infomations
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  imageInfo(callback = noop) {
    return new Promise((resolve, reject) => {
      const infoUrl = this.url() + '?imageInfo'

      ajax.get(infoUrl, function(err, body) {
        if (err) {
          reject(err)
          return callback(err)
        }

        const info = JSON.parse(body)

        resolve(info)
        callback(null, info)
      })
    })
  }

  /**
   * get the exif infomation of the picture
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  exif(callback = noop) {
    return new Promise((resolve, reject) => {
      const infoUrl = this.url() + '?exif'

      ajax.get(infoUrl, function(err, body) {
        if (err) {
          reject(err)
          return callback(err)
        }

        const info = JSON.parse(body)

        resolve(info)
        callback(null, info)
      })
    })
  }

  /**
   * return a thumbnail image
   * @param  {Object}   opts     options
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  imageView(opts, callback = noop) {
    const promise = new Promise((resolve, reject) => {

      const mode = opts.mode
      delete opts.mode

      let url = this.url()
      const params = {}

      utils.each(opts, function(value, key) {
        if (imageViewTranslations.hasOwnProperty(key)) {
          key = imageViewTranslations[key]
        }

        params[key] = value
      })

      url += utils.format('?imageView/%d%s', mode, genOptUrl(params))

      const image = new Image()
      image.src = url

      promise.image = image

      resolve(image)
      callback(null, image)
    })

    return promise
  }

  /**
   * return a processed image
   * @param  {Object}   opts     options
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  imageMogr(opts, callback = noop) {
    const promise = new Promise((resolve, reject) => {
      let url = this.url()
      const params = {}

      utils.objExtend(params, opts)
      
      url += utils.format('?imageMogr/v2/auto-orient%s', genOptUrl(params))

      const image = new Image()
      image.src = url

      promise.image = image

      resolve(image)
      callback(null, image)
    })

    return promise
  }

  /**
   * return a image with a watermark
   * @param  {Object}   opts     options
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  watermark(opts, callback = noop) {
    const promise = new Promise(resolve => {
      let url = this.url()
      const params = {}
      const mode = opts.mode
      delete opts.mode

      utils.objExtend(params, opts)

      params.image = utils.safeEncode(params.image)

      url += utils.format('?watermark/%d%s', mode, genOptUrl(params))

      const image = new Image()
      image.src = url

      promise.image = image

      resolve(image)
      callback(null, image)
    })

    return promise
  }
}

_Image.extend = function(_file) {
  _file.imageView = function(opts, callback) {
    callback = callback || noop;
    return new Promise(resolve => {

      var img = file.Image(this);
      
      img._load(this, function(err, _img) {
        if (err) {
          callback(err);
          return promise.reject(err);
        }

        var view = {};

        opts.mode = opts.mode || 1;

        switch (opts.mode) {
          case 1:
            utils.objExtend(view, {
              // 缩放
              dw: opts.width || opts.height,
              dh: opts.height || opts.width,
              resize: 'preview'
            });
            break;
          case 2:
            var scale = _img.width / _img.height;

            var hasWidth = opts.hasOwnProperty('width');
            var hasHeight = opts.hasOwnProperty('height');

            switch (true) {
              case hasWidth && hasHeight:
                utils.objExtend(view, {
                  dw: opts.width,
                  dh: opts.height,
                  resize: 'max'
                });
                break;
              case hasWidth && !hasHeight:
                utils.objExtend(view, {
                  dw: opts.width,
                  dh: opts.width / scale,
                  resize: 'max'
                });
                break;
              case !hasWidth && hasHeight:
                utils.objExtend(view, {
                  dw: opts.height * scale,
                  dh: opts.height,
                  resize: 'max'
                });
                break;
            }
        }

        img
          .set(view)
          .get(function(err, image) {
            if (err) {
              callback(err);
              return reject(err);
            }

            callback(null, image);
            resolve(image);
          });

      });
    })
  }

  _file.imageMogr = function(opts, callback) {
    callback = callback || noop;

    return new Promise((resolve, reject) => {

      var img = file.Image(this);

      img._load(this, function(err, _img) {
        if (err) {
          callback(null);
          return promise.reject(err);
        }

        var view = {};
        var scale = _img.width / _img.height;

        // Thumbnails
        var thumbnail = opts.thumbnail;
        switch (thumbnail.mode) {
          case 1:
            utils.objExtend(view, {
              // 缩放
              dw: thumbnail.width || thumbnail.height,
              dh: thumbnail.height || thumbnail.width,
              resize: 'preview',

              // 中央裁剪
              sx: (_img.width - thumbnail.width) / 2,   // x
              sy: (_img.height - thumbnail.height) / 2, // y
              sw: thumbnail.width || thumbnail.height,
              sh: thumbnail.height || thumbnail.width
            });
            break;
          case 2:
            var thumbHasWidth = thumbnail.hasOwnProperty('width');
            var thumbHasHeight = thumbnail.hasOwnProperty('height');

            switch (true) {
              case thumbHasWidth && thumbHasHeight:
                utils.objExtend(view, {
                  dw: thumbnail.width,
                  dh: thumbnail.height,
                  resize: 'max'
                });
                break;
              case thumbHasWidth && !thumbHasHeight:
                utils.objExtend(view, {
                  dw: thumbnail.width,
                  dh: thumbnail.width / scale,
                  resize: 'max'
                });
                break;
              case !thumbHasWidth && thumbHasHeight:
                utils.objExtend(view, {
                  dw: thumbnail.height * scale,
                  dh: thumbnail.height,
                  resize: 'max'
                });
                break;
            }
        }

        // Crop
        var crop = opts.crop;
        var cropHasWidth = crop.hasOwnProperty('width');
        var cropHasHeight = crop.hasOwnProperty('height');

        crop.x = crop.x || 0;
        crop.y = crop.y || 0;

        if (crop.gravity) {
          // TODOS
        }

        switch (true) {
          case cropHasWidth && !cropHasHeight:
            crop.height = crop.width / scale;
            break;
          case !cropHasWidth && cropHasHeight:
            crop.width = crop.height * scale;
            break;
        }

        crop.rotate = crop.rotate || 0;

        utils.objExtend(view, {
          sx: crop.x,
          sy: crop.y,
          sw: crop.width,
          sh: crop.height,

          deg: crop.rotate
        });

        img
          .set(view)
          .get(function(err, image) {
            if (err) {
              callback(err);
              return reject(err);
            }

            callback(null, image);
            resolve(image);
          });
      });
    })
  }
  
  _file.imageInfo = function(callback) {
    callback = callback || noop;

    return new Promise((resolve, reject) => {
      var img = file.Image(this)

      img._load(this, function(err, img) {
        if (err) {
          callback(err)
          return reject(err);
        }

        var info = {
          width: img.width,
          height: img.height
        };
        callback(null, info);
        resolve(info);
      });
    })
  };

  _file.getImage = function() {
    return file.Image(this);
  };

  return _file;
};

function genOptUrl(params) {
  var url = "";

  utils.each(params, function(value, key) {
    url += utils.format('/%s/%s', key, value);
  });

  return url;
}

function noop() {
  return false;
}

export default _Image
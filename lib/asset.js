import utils from './utils'
import Fop from './fop'

let configData = {}
function noop() { return false; }

class Asset {

  /**
   * Asset Class
   * @param {String} key    Asset's key
   * @param {Bucket} parent Bucket object
   */
  constructor(key, parent, config = {}) {
    this.key = key
    this.parent = parent

    this.config = config
  }

  /**
   * return the asset url
   * @return {String} url
   */
  url() {
    return this.parent.url() + '/' + this.key
  }


  /**
   * return the encoded entry url of the asset
   * @return {String} entry url
   */
  entryUrl() {
    return utils.safeEncode(utils.format(
      '%s:%s',
      this.parent.name, this.key
    ))
  }

  /**
   * return the qrcode image of the asset
   * @param  {Object}   opts     options
   * @return {String}            url
   */
  qrcode(opts, callback) {
    switch (true) {
      case utils.isFunction(opts):
        callback = opts
        opts = { mode: 0, level: 'L' }
        break
      case utils.isObject(opts) && utils.isUndefined(callback):
        callback = noop
        break
      case utils.isUndefined(opts):
        opts = { mode: 0, level: 'L' }
        callback = noop
        break
    }

    const url = utils.format('%s?qrcode/%d/level/%s', this.url(), opts.mode, opts.level)

    const img = new Image()
    img.src = img.url = url

    return img
  }

  fop(config) {
    return new Fop(this, config)
  }

  /**
   * return a image with a established format
   * @param  {String}   alias    alias name
   * @return {String}            url
   */
  alias(alias) {
    let url = this.url()

    url += utils.format('%s%s', this.config.separate, alias)

    return url
  }

  /**
   * Markdown to HTML
   * @param  {Object}   opts     options
   * @return {Promise}           promise object
   */
  md2html(opts) {
    if (utils.isFunction(opts)) {
      callback = opts;
      opts = {
        mode: false,
        css: false
      }
    } else if (utils.isObject(opts)) {
      callback = callback || noop
    } else {
      callback = callback || noop
      opts = {
        mode: false,
        css: false
      }
    }

    let url = this.url() + '?md2html'

    if (opts.mode) {
      url += utils.format('/%s', opts.mode)
    }

    if (opts.css) {
      url += utils.format('/css/%s', utils.safeEncode(opts.css))
    }

    return url
  }


}

export default function(config) {
  configData = config
  return Asset
}
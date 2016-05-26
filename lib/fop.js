import utils from './utils'

const imageViewTranslations = {
  weight: 'w',
  height: 'h',
  quality: 'q'
}

class Fop {
  /**
   * Fop Class
   * @param {Asset} asset    asset
   * @param {Object} _config config
   */
  constructor(asset, config = {}) {
    this.parent = asset
    this.config = config

    this.query = ''
  }


  /**
   * custom fop
   * @param  {String} str fop string
   * @return {Fop}     fop
   */
  fop(str) {
    this.query += '|' + str

    return this
  }


  /**
   * Add imageInfo to the fop
   * @return {Fop} fop
   */
  imageInfo() {
    this.query += '|imageInfo'

    return this
  }

  /**
   * Add exif to the fop
   * @return {Fop} fop
   */
  exif() {
    this.query += '|exif'

    return this
  }

  /**
   * Add imageView to the fop
   * @param  {Object} opts options
   * @return {Fop}      fop
   */
  imageView(opts) {
    const mode = opts.mode
    delete opts.mode

    const url = this.url()
    const params = {}

    utils.each(opts, function(value, key) {
      if (imageViewTranslations.hasOwnProperty(key)) {
        key = imageViewTranslations[key]
      }

      params[key] = value
    })

    this.query += utils.format('|imageView/%d%s', mode, genOptUrl(params))

    return this
  }

  /**
   * Add imageMogr to the fop
   * @param  {Object} opts options
   * @return {Fop}      fop
   */
  imageMogr(opts) {
    const params = {}

    utils.objExtend(params, opts)

    this.query += utils.format('|imageMogr/v2/auto-orient%s', genOptUrl(params))

    return this
  }

  /**
   * Add watermark to the fop
   * @param  {Object} opts options
   * @return {Fop}      fop
   */
  watermark(opts) {
    const params = {}
    const mode = opts.mode
    delete opts.mode

    utils.objExtend(params, opts)

    params.image = utils.safeEncode(params.image)

    this.query += utils.format('|watermark/%d%s', mode, genOptUrl(params))

    return this
  }

  /**
   * Add qrcode to the fop
   * @param  {Object} opts options
   * @return {Fop}      fop
   */
  qrcode(opts) {
    opts = opts || {
      mode: 0,
      level: 'L'
    }

    this.query += utils.format('|qrcode/%d/level/%s', this.url(), opts.mode, opts.level)

    return this
  }

  /**
   * Markdown to HTML
   * @param  {Object}   opts     options
   * @return {Fop}           fop
   */
  md2html(opts) {
    opts = opts || {
      mode: false,
      css: false
    }

    let url = '|md2html'

    if (opts.css) {
      url += utils.format('/%s', opts.mode)
    }

    if (opts.css) {
      url += utils.format('/css/%s', utils.safeEncode(opts.css))
    }

    this.query += url

    return this
  }

  /**
   * get the url of the fop
   * @return {String} url
   */
  url() {
    return utils.format('%s?%s', this.parent.url(), this.query.substr(1))
  }

  /**
   * return the image of the fop
   * @return {Image} image
   */
  image() {
    const image = new Image()
    image.src = this.url()

    return image
  }
}


function genOptUrl(params) {
  let url = ""

  utils.each(params, function(value, key) {
    url += utils.format('/%s/%s', key, value)
  })

  return url
}

export default Fop
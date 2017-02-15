import _Asset from './asset'
import _Image from './image'
import utils from './utils'
import file from './deps/file'
import ajax from './deps/ajax'
let Asset = null

let globalConfig = null

function noop() { return false }

class Bucket {
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
  constructor(name, config = {}) {
    this.name = name
    this.queue = []
    this.config = utils.objExtend(globalConfig, config, {
      scope: name
    })

    if (this.config.url) {
      if (/\/$/.test(this.config.url)) {
        this.config.url = this.config.url.substr(0, this.config.url.length - 1);
      }
    } else {
      throw new ReferenceError('You should set the url of the bucket.')
    }
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
  putFile(key, _file, options, callback) {
    return new Promise((resolve, reject) => {

      switch (arguments.length) {
        case 3:
          if (utils.isFunction(options)) {
            callback = options
            options = {}
          } else {
            callback = noop
          }
          break
        case 2:
          options = {}
          callback = noop
          break
      }

      const config = utils.objExtend(utils.objClone(this.config), options)

      const putToken = config.putToken

      // upload API
      const uploadUrl = 'http://' + globalConfig.uploadUrl

      // isIE
      const isIE = window.ActiveXObject ? true : false

      const data = {
        token: putToken,
        key: key,
      }

      if (isIE) {
        data.accept = 'text/plain; charset=utf-8'
      }

      // uploading
      const xhr = file.upload({
        url: uploadUrl,
        data: data,
        files: {
          file: _file
        },
        upload: (xhr, _options) => {
          (options.before && utils.isFunction(options.before) ? options.before : noop)
            .call(null, xhr, key, _file)
        },
        progress: evt => {
          const totalPercent = evt.loaded / evt.total * 100
          ;(options.progress && utils.isFunction(options.progress) ? options.progress : noop)
            .call(null, totalPercent, evt.loaded, evt.total)
        },
        complete: (err, evt) => {
          if (err) {
            callback(err)
            return reject(err)
          }

          let reply = null

          if (window.JSON) {
            reply = JSON.parse(xhr.responseText)
          } else {
            reply = xhr.responseText
          }

          const asset = this.key(key)

          callback(null, reply, asset, xhr, evt)
          resolve(reply, asset, xhr, evt)
        }
      })
    })
    
  }

  putChunkedFile(key, _file, options, callback) {
    return new Promise((resolve, reject) => {
      const config = utils.objExtend(utils.objClone(this.config), options)

      const putToken = this.config.putToken

      options.blockSize = options.blockSize || file.MB.form(5)

      // upload API
      const uploadUrl = 'http://' + globalConfig.uploadUrl + '/mkblk/' + options.blockSize

      // ctx
      const blockCtxes = []

      if (utils.isFunction(_file.slice)) {
        (function loop(url, start, _callback, host) {
          const end = start + options.blockSize

          if (start < _file.size) {
            var blob = _file.slice(start, end)

            ajax.postBlob(url, blob, {
              headers: {
                'Content-Type': 'application/octet-stream',
                'Authorization': utils.format('UpToken %s', putToken)
              }
            }, (err, reply) => {
              if (err) {
                callback(err)
                return reject(err)
              }

              const replyData = eval(reply)

              blockCtxes.push(replyData.ctx)

              const host = replyData.host

              loop(utils.format('%s/bput/%s/%s', host, replyData.ctx, end), end, _callback, host)
            })
          } else {
            return _callback(host)
          }
        })(uploadUrl, 0, function(host) {
          const asset = self.key(key)

          let url = utils.format('%s/rs-mkfile/%s/fsize/%s/mimeType/%s', host, asset.entryUrl(), _file.size, _file.type)

          if (options.params) {
            url ,utils.format('/params/%s')
          }

          if (options.meta) {
            url += utils.format('/meta/%s', utils.safeEncode(options.meta))
          }

          if (options.customer) {
            url += utils.format('/customer/%s', options.customer)
          }

          if (options.rotate) {
            url += utils.format('/rotate/%s', options.rotate)
          }

          ajax.post()
        })
      } else {
        const err = 'no support chunk'

        reject(err)
        callback(err)
      }
    })
  }


  /**
   * Get a key
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  getFile(key, callback = noop) {
    return new Promise((resolve, reject) => {
      // token
      const getToken = this.config.getToken || ''

      // key url
      let url = null
      if (this.config.url) {
        url = utils.format('%s/%s?e=3600&token=%s', this.url(), key, getToken)
      } else {
        url = utils.format('http://%s.qiniudn.com/%s?e=3600&token=%s', this.name, key, getToken)
      }

      ajax.get(url, (err, body) => {
        if (err) {
          callback(err)
          return reject(err)
        }

        callback(null, body)
        resolve(body)
      })
    })
  }

  url() {
    return this.config.url
  }

  /**
   * return a asset object
   * @param  {String} key key
   * @return {Asset}      asset object
   */
  key(key) {
    return new Asset(key, this)
  } 

  image(key) {
    return new _Image(key, this)
  }
}

Bucket.Image = _Image;

export default function(config) {
  globalConfig = config
  Asset = _Asset(config)
  return Bucket
}
const _configData = {
  uploadUrl : 'up.qiniu.com',
  rsUrl     : 'rs.qbox.me',
  rsfUrl    : 'rsf.qbox.me'
}

import _Asset from './asset'
const Asset = _Asset(_configData)
import _Bucket from './bucket'
const Bucket = _Bucket(_configData)
import _Image from './image'
import utils from './utils'
import { EventEmitter } from 'events'
import file from './deps/file'
import ajax from './deps/ajax'

const qiniu = {}

/**
 * Global Config
 * Example:
 * ```
 * qiniu.config({
 *   foo: '-----'
 * })
 *
 * qiniu.config('foo', 'bar')
 * qiniu.config('foo')
 * ``` 
 * @param  {String/Object} key   key of config
 * @param  {Mix}           value value
 */
qiniu.config = function(key, value) {
  if (arguments.length > 1 && key instanceof String) {
    // set config data normally
    qiniu.set(key, value)
  } else {
    switch (true) {
      case utils.isString(key):
        // Get config data
        return qiniu.get(key)
        break
      case utils.isObject(key):
        // Set config data with a object
        for (const ii in key) {
          (function(_key) {
            qiniu.set(_key, key[_key])
          })(ii)
        }
        break
    }
  }

  return this
}

/**
 * Set config data
 * @param  {String} key   key
 * @param  {Mix}    value value
 * @return {Object}       qiniu object
 */
qiniu.set = function(key, value) {
  _configData[key] = value

  return this
}

/**
 * Get config data
 * @param  {String} key   key
 * @return {Mix}          config value
 */
qiniu.get = function(key) {
  return _configData[key]
}

/**
 * Binding the select button
 * @param  {HTMLElement} el      select button
 * @param  {Object} options options
 * @return {Object}         qiniu
 */
qiniu.bind = function(el, options = {}, chain) {

  const eventHandler = createEventHandler()

  if (chain) {
    const events = [ 'file', 'over', 'out', 'dnd.success', 'dnd.error' ]
    events.forEach((event) => chain.on(event, (...args) => eventHandler.emit(event, ...args)))
  }

  const css = ".qiniu-transparent { \
    z-index: 1000; \
    zoom: 1; \
    opacity: 0; \
    -moz-opacity: 0; \
    -khtml-opacity: 0; \
    filter: 'alpha(opacity=0)'; \
    *filter: alpha(opacity=0); \
  }"
  const head = document.getElementsByTagName('head')[0]
  const style = document.createElement('style')

  style.type = 'text/css'
  if (style.styleSheet) {
    style.styleSheet.cssText = css
  } else {
    style.appendChild(document.createTextNode(css))
  }

  head.appendChild(style)

  const tmp = document.createElement('div')
  const html = '<div class="js-fileapi-wrapper qiniu-transparent"></div>'
  tmp.innerHTML = html
  const wrapper = tmp.firstChild

  if (el.jquery) {
    el
      .before(wrapper)
      .addClass('select-btn')
  } else {
    const parentNode = el.parentNode
    parentNode.insertBefore(wrapper, el)
  }

  const input       = document.createElement('input')
  input.type      = 'file'
  input.className = 'qiniu-transparent'
  input.multiple  = true

  wrapper.appendChild(input)

  el = el.jquery ? el.get(0) : el

  utils.css(wrapper, {
    top      : el.style.top,
    right    : el.style.right,
    position : "absolute",
    width    : el.offsetWidth + 5,
    height   : el.offsetHeight + 5,
    margin   : el.style.margin
  })
  utils.css(input, {
    width    : el.offsetWidth + 5,
    height   : el.offsetHeight + 5,
    position : 'relative'
  })

  file.event.on(input, 'change', function(evt) {
    let files = file.getFiles(evt)
    const filter = options.filter || false

    const filters = {
      'image': /image/,
      'audio': /audio/,
      'video': /video/,
      'media': /audio|video/
    }

    switch (true) {
      case utils.isString(filter):
        if (filters[filter]) {
          files = file.filter(files, function(_file) {
            return filters[filter].test(_file.type)
          })
        }
        break;
      case utils.isArray(filter):
        for (let i = 0; i < filter.length; i++) {
          (function(index) {
            files = file.filter(files, function(_file) {
              return filters[filter[index]].test(_file.type)
            })
          })(i)
        }
        break
      case (filter instanceof RegExp):
        files = file.filter(files, function(_file) {
          return filter.test(_file.type)
        })
        break
    }

    for (let i = 0; i < files.length; i++) {
      (function(index) {
        eventHandler.emit('file', _Image.extend(files[index]))
      })(i)
    }
  })

  return eventHandler
}

/**
 * Binding the drag and drop aera
 * @param  {HTMLElement} el      aera
 * @param  {Object} options options
 * @return {Object}         qiniu
 */
qiniu.bind.dnd = function(el, options = {}, chain) {

  const eventHandler = createEventHandler()

  if (chain) {
    const events = [ 'file', 'over', 'out', 'dnd.success', 'dnd.error' ]
    events.forEach((event) => chain.on(event, (...args) => eventHandler.emit(event, ...args)))
  }

  if (file.support.dnd) {
    file.event.dnd(
      (el.jquery ? el.get(0) : el),
      function(files) {
        const filter = options.filter || false

        const filters = {
          'image': /image/,
          'audio': /audio/,
          'video': /video/,
          'media': /audio|video/
        }

        switch (true) {
          case utils.isString(filter):
            if (filters[filter]) {
              files = file.filter(files, function(_file) {
                return filters[filter].test(_file.type)
              })
            }
            break
          case utils.isArray(filter):
            for (let i = 0; i < filter.length; i++) {
              (function(index) {
                files = file.filter(files, function(_file) {
                  return filters[filter[index]].test(_file.type)
                })
              })(i)
            }
            break
          case (filter instanceof RegExp):
            files = file.filter(files, function(_file) {
              return filter.test(_file.type)
            })
            break
        }

        for (let i = 0; i < files.length; i++) {
          (function(index) {
            eventHandler.emit('file', _Image.extend(files[index]))
          })(i)
        }
      }
    )

    file.event.on(
      (el.jquery ? el.get(0) : el),
      'dragover dragleave',
      function(evt) {
        switch (evt.type) {
          case 'dragover':
            (options.over && utils.isFunction(options.over) ? options.over : noop)
              .call(null)

            eventHandler.emit('over')
            break
          case 'dragleave':
            (options.out && utils.isFunction(options.out) ? options.out : noop)
              .call(null)

            eventHandler.emit('out')
        }
      }
    );

    (options.success && utils.isFunction(options.success) ? options.success : noop).call(null)
    eventHandler.emit('dnd.success')
  } else {
    eventHandler.emit('dnd.error', 'no support');
    (options.error && utils.isFunction(options.error) ? options.error : noop).call(null, 'no support')
  }

  return eventHandler
}

qiniu.supportDnd = file.support.dnd

qiniu.bucket = function(bucket, config) {
  return new Bucket(bucket, config)
}

qiniu.Asset = Asset
qiniu.Bucket = Bucket
qiniu.Image = _Image

utils.objExtend(qiniu, EventEmitter.prototype)
EventEmitter.call(qiniu)

function noop() {
  return false
}

function createEventHandler() {
  const eventHandler = new EventEmitter()

  eventHandler.bind = (...args) => {
    const restArgs = args.length === 1 ? [ {}, eventHandler ] : [ eventHandler ]

    args.push(...restArgs) // Chaining
    return qiniu.bind.apply(qiniu, args)
  }
  eventHandler.bind.dnd = (...args) => {
    const restArgs = args.length === 1 ? [ {}, eventHandler ] : [ eventHandler ]

    args.push(...restArgs) // Chaining
    return qiniu.bind.dnd.apply(qiniu, args)
  }

  return eventHandler
}

export default qiniu
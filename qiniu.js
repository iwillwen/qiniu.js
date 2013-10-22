function def(name, deps, factory) {
  var hasDefine  = 'undefined' !== typeof define;
  var hasExports = 'undefined' !== typeof exports;

  if (!factory && deps instanceof Function) {
    factory = deps;
    deps = [];
  }

  if (hasDefine) {
    // CommonJS: SeaJS, RequireJS etc.
    define(name, deps, factory);
  } else if (hasExports) {
    // Node.js Module
    exports = factory(require, exports, module);
  } else {
    // Normal
    var module = {
      exports: {}
    };
    def.cache[name] = this[name] = module.exports = factory(function(name) {
      if (def.cache.hasOwnProperty(name)) {
        return def.cache[name];
      } else {
        return null;
      }
    }, module.exports, module);
  }
}
def.cache = {};;def('qiniu.utils', function() {
  var slice = [].slice;

  var nativeForEach = [].forEach || false;

  var utils = {
    slice: slice,
    noop: function() {
      return false;
    },

    // Class Inherits
    inherits: function(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype =
        utils.objCreate(
          utils.objExtend(
            utils.objClone(superCtor.prototype), {
              constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
              }
            }));
    },

    isString: function(val) {
      return (typeof val == 'string');
    },

    isObject: function(val) {
      return (val instanceof Object);
    },

    isArray: function(val) {
      return (val instanceof Array);
    },

    isFunction: function(val) {
      return (val instanceof Function);
    },

    isUndefine: function (val) {
      return val === void(0);
    },

    objClone: function (obj) {
      if (!utils.isObject(obj)) return obj;
      return utils.isArray(obj) ? obj.slice() : utils.objExtend({}, obj);
    },

    objExtend: function(obj) {
      var sources = slice.call(arguments, 1);

      for (var i = 0; i < sources.length; i++) {
        (function(index) {
          var source = sources[index];

          if (source) {
            for (var prop in source) {
              if (source.hasOwnProperty(prop)) {
                obj[prop] = source[prop];
              }
            }
          }
        })(i);
      }

      return obj;
    },

    objCreate: function(o) {
      if (arguments.length > 1) {
        throw new Error('Object.create implementation only accepts the first parameter.');
      }
      function F() {}
      F.prototype = o;
      return new F();
    },

    objKeys: function(obj) {
      if (utils.isFunction(obj.key)) {
        return obj.keys();
      } else {
        var keys = [];

        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            keys.push(key);
          }
        }

        return keys;
      }
    },

    each: function (obj, iterator, context) {
      if (obj == null) return;
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
        for (var i = 0, length = obj.length; i < length; i++) {
          if (iterator.call(context, obj[i], i, obj) === false) return;
        }
      } else {
        var keys = utils.objKeys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
          if (iterator.call(context, obj[keys[i]], keys[i], obj) === false) return;
        }
      }
    },

    format: function(str) {
      if (!utils.isString(str)) {
        var objects = [];
        for (var i = 0; i < arguments.length; i++) {
          objects.push(arguments[i]);
        }
        return objects.join(' ');
      }

      var values = slice.call(arguments, 1);
      var i = 0;
      var len = arguments.length;
      var formatRegExp = /%[sd%]/g;

      var rtn = String(str).replace(formatRegExp, function(x) {

        if (x === '%%') {
          return '%';
        }

        if (i >= len) {
          return x;
        }
        switch (x) {
          case '%s': return String(values[i++]);
          case '%d': return Number(values[i++]);
          default:
            return x;
        }
      });
/*      for (var x = arguments[i]; i < len; x = arguments[++i]) {
        if (x === null || !utils.isObject(x)) {
          rtn += ' ' + x;
        }
      }*/

      return rtn;
    },

    safeEncode: function(str) {
      var encoded = btoa('base64');
      var rtn = encoded.replace(/\//g, '_').replace(/\+/g, '-');

      return rtn;
    },

    css: function(el, css) {
      if( el && el.style ) {
        var key, val;
        for( key in css ) {
          val = css[key];
          if( typeof val == 'number' ) val += 'px';
          try { el.style[key] = val; } catch (e) {}
        }
      }
    }

  };

  return utils;
});;def('qiniu.deps.Ajax', [ 'qiniu.utils' ], function(require, exports) {

  if ('undefined' !== typeof define && define.amd) {
    var utils = arguments[0];
  } else {
    var utils = require('qiniu.utils');
  }

  function createXHR() {
    if (window.ActiveXObject) {
      var xhr = new ActiveXObject("Microsoft.XMLHTTP");
    } else if(window.XMLHttpRequest) {
      var xhr = new XMLHttpRequest();
    }

    return xhr;
  }

  var ajax = exports; 

  ajax.get = function(url, callback) {
    var xhr = createXHR();

    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        callback(null, xhr.responseText);
      } else {
        callback(true);
      }
    };
    xhr.send(null);

    return xhr;
  };

  ajax.post = function(url, data, callback) {
    var xhr = createXHR();

    var query = '?';
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        query += key + '=' + data[key];
      }
    }

    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        callback(null, xhr.responseText);
      } else {
        callback(true);
      }
    };
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send(query);

    return xhr;
  };

  ajax.postBlob = function(url, blob, options, callback) {
    var xhr = createXHR();

    if (utils.isFunction(options)) {
      callback = options;
      options = {};
    }

    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        callback(null. xhr.responseText);
      } else {
        callback(true);
      }
    };
    if (options.headers) {
      utils.each(options.headers, function(val, header) {
        xhr.setRequestHeader(header, val);
      });
    }
    xhr.send(blob);

    return xhr;
  };

  return ajax;
});;def('qiniu.deps.Events', [ 'qiniu.utils' ], function(require, exports) {
  var slice = [].slice;

  if ('undefined' !== typeof define && define.amd) {
    var utils = arguments[0];
  } else {
    var utils = require('qiniu.utils');
  }

  var events = exports;

  // EventEmitter(without `domain` module) From Node.js
  function EventEmitter() {
    this._events = this._events || {};
    this._maxListeners = this._maxListeners || defaultMaxListeners;
  }
  var defaultMaxListeners = 10;
  EventEmitter.prototype.setMaxListeners = function(n) {
    if (typeof n !== 'number' || n < 0)
      throw TypeError('n must be a positive number');
    this._maxListeners = n;
  };
  EventEmitter.prototype.emit = function(type) {
    var er, handler, len, args, i, listeners;

    if (!this._events)
      this._events = {};

    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      if (!this._events.error ||
          (typeof this._events.error === 'object' &&
           !this._events.error.length)) {
        er = arguments[1];
        if (this.domain) {
          if (!er) er = new TypeError('Uncaught, unspecified "error" event.');
        } else if (er instanceof Error) {
          throw er; // Unhandled 'error' event
        } else {
          throw TypeError('Uncaught, unspecified "error" event.');
        }
        return false;
      }
    }

    handler = this._events[type];

    if (typeof handler === 'undefined')
      return false;

    if (typeof handler === 'function') {
      switch (arguments.length) {
        // fast cases
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        // slower
        default:
          len = arguments.length;
          args = new Array(len - 1);
          for (i = 1; i < len; i++)
            args[i - 1] = arguments[i];
          handler.apply(this, args);
      }
    } else if (typeof handler === 'object') {
      len = arguments.length;
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];

      listeners = handler.slice();
      len = listeners.length;
      for (i = 0; i < len; i++)
        listeners[i].apply(this, args);
    }

    return true;
  };
  EventEmitter.prototype.addListener = function(type, listener) {
    var m;

    if (typeof listener !== 'function')
      throw TypeError('listener must be a function');

    if (!this._events)
      this._events = {};

    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (this._events.newListener)
      this.emit('newListener', type, typeof listener.listener === 'function' ?
                listener.listener : listener);

    if (!this._events[type])
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    else if (typeof this._events[type] === 'object')
      // If we've already got an array, just append.
      this._events[type].push(listener);
    else
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];

    // Check for listener leak
    if (typeof this._events[type] === 'object' && !this._events[type].warned) {
      m = this._maxListeners;
      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    return this;
  };
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  EventEmitter.prototype.once = function(type, listener) {
    if (typeof listener !== 'function')
      throw TypeError('listener must be a function');

    function g() {
      this.removeListener(type, g);
      listener.apply(this, arguments);
    }

    g.listener = listener;
    this.on(type, g);

    return this;
  };
  // emits a 'removeListener' event iff the listener was removed
  EventEmitter.prototype.removeListener = function(type, listener) {
    var list, position, length, i;

    if (typeof listener !== 'function')
      throw TypeError('listener must be a function');

    if (!this._events || !this._events[type])
      return this;

    list = this._events[type];
    length = list.length;
    position = -1;

    if (list === listener ||
        (typeof list.listener === 'function' && list.listener === listener)) {
      this._events[type] = undefined;
      if (this._events.removeListener)
        this.emit('removeListener', type, listener);

    } else if (typeof list === 'object') {
      for (i = length; i-- > 0;) {
        if (list[i] === listener ||
            (list[i].listener && list[i].listener === listener)) {
          position = i;
          break;
        }
      }

      if (position < 0)
        return this;

      if (list.length === 1) {
        list.length = 0;
        this._events[type] = undefined;
      } else {
        list.splice(position, 1);
      }

      if (this._events.removeListener)
        this.emit('removeListener', type, listener);
    }

    return this;
  };
  EventEmitter.prototype.removeAllListeners = function(type) {
    var key, listeners;

    if (!this._events)
      return this;

    // not listening for removeListener, no need to emit
    if (!this._events.removeListener) {
      if (arguments.length === 0)
        this._events = {};
      else if (this._events[type])
        this._events[type] = undefined;
      return this;
    }

    // emit removeListener for all listeners on all events
    if (arguments.length === 0) {
      for (key in this._events) {
        if (key === 'removeListener') continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners('removeListener');
      this._events = {};
      return this;
    }

    listeners = this._events[type];

    if (typeof listeners === 'function') {
      this.removeListener(type, listeners);
    } else {
      // LIFO order
      while (listeners.length)
        this.removeListener(type, listeners[listeners.length - 1]);
    }
    this._events[type] = undefined;

    return this;
  };
  EventEmitter.prototype.listeners = function(type) {
    var ret;
    if (!this._events || !this._events[type])
      ret = [];
    else if (typeof this._events[type] === 'function')
      ret = [this._events[type]];
    else
      ret = this._events[type].slice();
    return ret;
  };
  EventEmitter.listenerCount = function(emitter, type) {
    var ret;
    if (!emitter._events || !emitter._events[type])
      ret = 0;
    else if (typeof emitter._events[type] === 'function')
      ret = 1;
    else
      ret = emitter._events[type].length;
    return ret;
  };
  events.EventEmitter = EventEmitter;

  function Promise(done) {
    this.results = null;
    this.errors  = null;
    this.ended   = false;

    // Done Callback
    if ('function' === typeof done) {
      this.done(done);
    }
  }
  utils.inherits(Promise, EventEmitter);
  Promise.prototype.resolve = function() {
    // Arguments processing
    var args = slice.call(arguments);

    // Done
    this.emit('resolve', args);
    this.ended   = true;
    this.results = args;

    return this;
  };
  Promise.prototype.reject = function() {
    // Arguments processing
    var args = slice.call(arguments);

    // Error!
    this.emit('reject', args);
    this.ended  = true;
    this.errors = args;

    return this;
  };
  Promise.prototype.then = function(onResolve, onReject) {
    var promise = new Promise();
    var self = this;

    onResolve = onResolve || utils.noop;
    onReject  = onReject  || utils.noop;

    self
      .done(function() {
        var ret = onResolve.apply(self, arguments);

        if (ret instanceof Promise) {
          ret.then(
            function() {
              promise.resolve.apply(promise, arguments);
            },
            function(err) {
              promise.reject(err);
            }
          );
        } else if (ret instanceof Error) {
          promise.reject(ret);
        }
      })
      .fail(function(err) {
        onReject.call(self, err);

        promise.reject(err);
      });

    return promise;
  };
  Promise.prototype.done = function(callback) {
    var self = this;

    if (self.ended) {
      // Done before
      if (self.results !== null) {
        callback.apply(self, self.results);
      }
    } else {
      // Event listening
      self.on('resolve', function(args) {
        var ret = callback.apply(self, args);

        if (ret instanceof Promise) {
          ret.fail(self.reject.bind(self));
        }
      });
    }

    return self;
  };
  Promise.prototype.fail = function(callback) {
    var self = this;

    if (self.ended) {
      // Reject Before
      if (self.errors !== null) {
        callback.apply(self, self.errors);
      }
    } else {
      // Event listening
      self.on('reject', function(args) {
        callback.apply(self, args);
      });
    }

    return self;
  };
  events.Promise = Promise;

  return events;
});;/**!
 * FileAPI — a set of tools for working with files
 *
 * @author  RubaXa  <trash@rubaxa.org>
 * @build lib/canvas-to-blob lib/FileAPI.core lib/FileAPI.Image lib/FileAPI.Form lib/FileAPI.XHR lib/FileAPI.Flash
 */
def('qiniu.deps.file', function() {
  (function(a){var j=a.HTMLCanvasElement&&a.HTMLCanvasElement.prototype,g;if(g=a.Blob)try{g=Boolean(new Blob)}catch(r){g=!1}var n=g;if(g=n)if(g=a.Uint8Array)try{g=100===(new Blob([new Uint8Array(100)])).size}catch(f){g=!1}var c=g,e=a.BlobBuilder||a.WebKitBlobBuilder||a.MozBlobBuilder||a.MSBlobBuilder,q=(n||e)&&a.atob&&a.ArrayBuffer&&a.Uint8Array&&function(a){var p,f,u,g;p=0<=a.split(",")[0].indexOf("base64")?atob(a.split(",")[1]):decodeURIComponent(a.split(",")[1]);f=new ArrayBuffer(p.length);u=new Uint8Array(f);
  for(g=0;g<p.length;g+=1)u[g]=p.charCodeAt(g);a=a.split(",")[0].split(":")[1].split(";")[0];if(n)return new Blob([c?u:f],{type:a});u=new e;u.append(f);return u.getBlob(a)};a.HTMLCanvasElement&&!j.toBlob&&(j.mozGetAsFile?j.toBlob=function(a,c){a(this.mozGetAsFile("blob",c))}:j.toDataURL&&q&&(j.toBlob=function(a,c){a(q(this.toDataURL(c)))}));"function"===typeof define&&define.amd?define(function(){return q}):a.dataURLtoBlob=q})(this);
  (function(a,j){function g(b,E,a){if(b)if(p(b))for(var d=0,c=b.length;d<c;d++)d in b&&E.call(a,b[d],d,b);else for(d in b)b.hasOwnProperty(d)&&E.call(a,b[d],d,b)}function r(b,d,a){if(b){var c=h.uid(b);D[c]||(D[c]={});g(d.split(/\s+/),function(d){m?m.event.add(b,d,a):(D[c][d]||(D[c][d]=[]),D[c][d].push(a),b.addEventListener?b.addEventListener(d,a,!1):b.attachEvent?b.attachEvent("on"+d,a):b["on"+d]=a)})}}function n(b,d,a){if(b){var c=h.uid(b),e=D[c]||{};g(d.split(/\s+/),function(d){if(m)m.event.remove(b,
  d,a);else{for(var E=e[d]||[],c=E.length;c--;)if(E[c]===a){E.splice(c,1);break}b.addEventListener?b.removeEventListener(d,a,!1):b.detachEvent?b.detachEvent("on"+d,a):b["on"+d]=null}})}}function f(b,d,a){r(b,d,function Q(c){n(b,d,Q);a(c)})}function c(b,d,a,c,e){b={type:a.type||a,target:b,result:c};h.extend(b,e);d(b)}function e(b,d,a,e){if(h.isFile(b)&&l&&l.prototype["readAs"+a]){var m=new l;r(m,K,function R(a){var e=a.type;"progress"==e?c(b,d,a,a.target.result,{loaded:a.loaded,total:a.total}):"loadend"==
  e?(n(m,K,R),m=null):c(b,d,a,a.target.result)});try{if(e)m["readAs"+a](e,b);else m["readAs"+a](b)}catch(p){c(b,d,"error",j,{error:p.toString()})}}else c(b,d,"error",j,{error:"filreader_not_support_"+a})}function q(b){var d;b.getAsEntry?d=b.getAsEntry():b.webkitGetAsEntry&&(d=b.webkitGetAsEntry());return d}function k(b,d){if(b)if(b.isFile)b.file(function(b){d(!1,[b])},function(){d("entry_file")});else if(b.isDirectory){var a=[];b.createReader().readEntries(function(b){h.afor(b,function(b,c){k(c,function(c,
  e){c||(a=a.concat(e));b?b():d(!1,a)})})},function(){d("directory_reader")})}else k(q(b),d);else d("empty_entry")}function p(b){return"object"==typeof b&&b&&"length"in b}function y(b){b.target||(b.target=a.event&&a.event.srcElement||N);3===b.target.nodeType&&(b.target=event.target.parentNode);return b}var u=1,C=function(){},t=navigator.userAgent,z=a.createObjectURL&&a||a.URL&&URL.revokeObjectURL&&URL||a.webkitURL&&webkitURL,s=a.Blob,w=a.File,l=a.FileReader,x=a.FormData,d=a.XMLHttpRequest,m=a.jQuery,
  v=!(!w||!l||!a.Uint8Array&&!x&&!d.prototype.sendAsBinary)&&!(/safari\//i.test(t)&&/windows/i.test(t)),t=v&&"withCredentials"in new d,s=v&&!!s&&!(!s.prototype.webkitSlice&&!s.prototype.mozSlice&&!s.prototype.slice),N=a.document,F=a.dataURLtoBlob,T=/img/i,U=/canvas/i,V=/img|canvas/,L=/input/i,I=/^data:[^,]+,/,G=Math.pow,W=Math.round,A=Number,x=function(b){return W(b*this)},H=new A(1024),O=new A(G(H,2)),J=new A(G(H,3)),G=new A(G(H,4)),D={},P=[],K="abort progress error load loadend",X="status statusText readyState response responseXML responseText responseBody".split(" "),
  h={version:"1.2.5",cors:!1,html5:!0,debug:!1,pingUrl:!1,staticPath:"http://phist.qiniudn.com/",flashUrl:0,flashImageUrl:0,accept:{"image/*":"art bm bmp dwg dxf cbr cbz fif fpx gif ico iefs jfif jpe jpeg jpg jps jut mcf nap nif pbm pcx pgm pict pm png pnm qif qtif ras rast rf rp svf tga tif tiff xbm xbm xpm xwd","audio/*":"m4a flac aac rm mpa wav wma ogg mp3 mp2 m3u mod amf dmf dsm far gdm imf it m15 med okt s3m stm sfx ult uni xm sid ac3 dts cue aif aiff wpl ape mac mpc mpp shn wv nsf spc gym adplug adx dsp adp ymf ast afc hps xs",
  "video/*":"m4v 3gp nsv ts ty strm rm rmvb m3u ifo mov qt divx xvid bivx vob nrg img iso pva wmv asf asx ogm m2v avi bin dat dvr-ms mpg mpeg mp4 mkv avc vp3 svq3 nuv viv dv fli flv wpl"},chunkSize:0,chunkUploadRetry:0,chunkNetworkDownRetryTimeout:2E3,KB:(H.from=x,H),MB:(O.from=x,O),GB:(J.from=x,J),TB:(G.from=x,G),expando:"fileapi"+(new Date).getTime(),uid:function(b){return b?b[h.expando]=b[h.expando]||h.uid():(++u,h.expando+u)},log:function(){h.debug&&(a.console&&console.log)&&(console.log.apply?
  console.log.apply(console,arguments):console.log([].join.call(arguments," ")))},getXHR:function(){var b;if(d)b=new d;else if(a.ActiveXObject)try{b=new ActiveXObject("MSXML2.XMLHttp.3.0")}catch(c){b=new ActiveXObject("Microsoft.XMLHTTP")}return b},isArray:p,support:{dnd:t&&"ondrop"in N.createElement("div"),cors:t,html5:v,chunked:s,dataURI:!0},event:{on:r,off:n,one:f,fix:y},throttle:function(b,d){var c,e;return function(){e=arguments;c||(b.apply(a,e),c=setTimeout(function(){c=0;b.apply(a,e)},d))}},
  F:function(){},parseJSON:function(b){return a.JSON&&JSON.parse?JSON.parse(b):(new Function("return ("+b.replace(/([\r\n])/g,"\\$1")+");"))()},trim:function(b){b=String(b);return b.trim?b.trim():b.replace(/^\s+|\s+$/g,"")},defer:function(){var b=[],d,a,c={resolve:function(e,m){c.resolve=C;a=e||!1;for(d=m;m=b.shift();)m(a,d)},then:function(c){a!==j?c(a,d):b.push(c)}};return c},queue:function(b){var d=0,a=0,c=!1,e=!1,m={inc:function(){a++},next:function(){d++;setTimeout(m.check,0)},check:function(){d>=
  a&&!c&&m.end()},isFail:function(){return c},fail:function(){!c&&b(c=!0)},end:function(){e||(e=!0,b())}};return m},each:g,afor:function(b,d){var a=0,c=b.length;p(b)&&c--?function B(){d(c!=a&&B,b[a],a++)}():d(!1)},extend:function(b){g(arguments,function(d){g(d,function(d,a){b[a]=d})});return b},isFile:function(b){return v&&b&&b instanceof w},isCanvas:function(b){return b&&U.test(b.nodeName)},getFilesFilter:function(b){return(b="string"==typeof b?b:b.getAttribute&&b.getAttribute("accept")||"")?RegExp("("+
  b.replace(/\./g,"\\.").replace(/,/g,"|")+")$","i"):/./},readAsDataURL:function(b,d){h.isCanvas(b)?c(b,d,"load",h.toDataURL(b)):e(b,d,"DataURL")},readAsBinaryString:function(b,d){l&&l.prototype.readAsBinaryString?e(b,d,"BinaryString"):e(b,function(b){if("load"==b.type)try{b.result=h.toBinaryString(b.result)}catch(a){b.type="error",b.message=a.toString()}d(b)},"DataURL")},readAsArrayBuffer:function(b,d){e(b,d,"ArrayBuffer")},readAsText:function(b,d,a){a||(a=d,d="utf-8");e(b,a,"Text",d)},toDataURL:function(b){if("string"==
  typeof b)return b;if(b.toDataURL)return b.toDataURL("image/png")},toBinaryString:function(b){return a.atob(h.toDataURL(b).replace(I,""))},readAsImage:function(b,d,a){if(h.isFile(b))if(z){var e=z.createObjectURL(b);e===j?c(b,d,"error"):h.readAsImage(e,d,a)}else h.readAsDataURL(b,function(e){"load"==e.type?h.readAsImage(e.result,d,a):(a||"error"==e.type)&&c(b,d,e,null,{loaded:e.loaded,total:e.total})});else h.isCanvas(b)?c(b,d,"load",b):T.test(b.nodeName)?b.complete?c(b,d,"load",b):f(b,"error abort load",
  function B(a){"load"==a.type&&z&&z.revokeObjectURL(b.src);n(b,"error abort load",B);c(b,d,a,b)}):b.iframe?c(b,d,{type:"error"}):(e=new Image,e.src=b.dataURL||b,h.readAsImage(e,d,a))},checkFileObj:function(b){var d={},a=h.accept;"object"==typeof b?d=b:d.name=(b+"").split(/\\|\//g).pop();null==d.type&&(d.type=d.name.split(".").pop());g(a,function(b,a){b=RegExp(b.replace(/\s/g,"|"),"i");b.test(d.type)&&(d.type=a.split("/")[0]+"/"+d.type)});return d},getDropFiles:function(b,d){var a=[],c=(b.originalEvent||
  b||"").dataTransfer||{},e=p(c.items)&&c.items[0]&&q(c.items[0]),m=h.queue(function(){d(a)});g((e?c.items:c.files)||[],function(b){m.inc();if(e)k(b,function(b,d){!b&&a.push.apply(a,d);m.next()});else{var d=function(d){d&&a.push(b);m.next()};if(!b.type&&0==b.size%4096&&102400>=b.size)if(l)try{var c=new l;f(c,K,function(b){b="error"!=b.type;d(b);b&&c.abort()});c.readAsDataURL(b)}catch(p){d(!1)}else d(null);else d(!0)}});m.check()},getFiles:function(b,d,a){var c=[];if(a)return h.filterFiles(h.getFiles(b),
  d,a),null;b.jquery&&(b.each(function(){c=c.concat(h.getFiles(this))}),b=c,c=[]);"string"==typeof d&&(d=h.getFilesFilter(d));b.originalEvent?b=y(b.originalEvent):b.srcElement&&(b=y(b));b.dataTransfer?b=b.dataTransfer:b.target&&(b=b.target);b.files?c=b.files:!v&&L.test(b&&b.tagName)?h.trim(b.value)&&(c=[h.checkFileObj(b.value)],c[0].blob=b,c[0].iframe=!0):p(b)&&(c=b);return h.filter(c,function(b){return!d||d.test(b.name)})},getInfo:function(b,d){var a={},c=P.concat();h.isFile(b)?function B(){var e=
  c.shift();e?e.test(b.type)?e(b,function(b,c){b?d(b):(h.extend(a,c),B())}):B():d(!1,a)}():d("not_support",a)},addInfoReader:function(b,d){d.test=function(d){return b.test(d)};P.push(d)},filter:function(b,d){for(var a=[],c=0,e=b.length,m;c<e;c++)c in b&&(m=b[c],d.call(m,m,c,b)&&a.push(m));return a},filterFiles:function(b,d,a){if(b.length){var c=b.concat(),e,m=[],p=[];(function S(){c.length?(e=c.shift(),h.getInfo(e,function(b,a){(d(e,b?!1:a)?m:p).push(e);S()})):a(m,p)})()}else a([],b)},upload:function(b){b=
  h.extend({prepare:h.F,beforeupload:h.F,upload:h.F,fileupload:h.F,fileprogress:h.F,filecomplete:h.F,progress:h.F,complete:h.F,pause:h.F,chunkSize:h.chunkSize,chunkUpoloadRetry:h.chunkUploadRetry},b);b.imageAutoOrientation&&!b.imageTransform&&(b.imageTransform={rotate:"auto"});var d=new h.XHR(b),a=this._getFilesDataArray(b.files),c=0,e=0,m=0,p=1,f=this,k,v=!1;g(a,function(b){c+=b.size});d.files=[];g(a,function(b){d.files.push(b.file)});d.total=c;d.loaded=0;b.beforeupload(d,b);(k=function M(){var k=
  a.shift(),u=k&&k.file,y=!1,l={};g(b,function(b,d){b&&"object"===typeof b&&(b=h.extend({},b));l[d]=b});u&&u.name===h.expando&&(u=null,h.log("[warn] FileAPI.upload() \u2014 called without files"));("abort"!=d.statusText||d.current)&&k?(v=!1,(d.currentFile=u)&&b.prepare(u,l),this._getFormData(l,k,function(a){e||b.upload(d,b);var v=new h.XHR(h.extend({},l,{upload:u?function(){b.fileupload(u,v,l)}:C,progress:u?function(a){y||(m=e+=c*p*(a.loaded/a.total)-m+0.5|0,k.total=a.total,k.loaded=a.loaded,b.fileprogress(a,
  u,v,l),b.progress({type:a.type,total:c,loaded:d.loaded=e,lengthComputable:!0},u,v,l))}:C,complete:function(a){g(X,function(b){d[b]=v[b]});y=!0;u&&(k.loaded=k.total,d.loaded=e+=e-m+(c*p+0.5)|0,b.filecomplete(a,v,u,l));M.call(f)}}));p=k.size/c;d.abort=function(b){this.current=b;v.abort()};v.send(a)})):(b.complete(200==d.status||201==d.status?!1:d.statusText||"error",d,b),v=!0)}).call(this);d.append=function(b,e){b=h._getFilesDataArray([].concat(b));g(b,function(b){c+=b.size;d.files.push(b.file);e?a.unshift(b):
  a.push(b)});v&&k.call(f)};d.remove=function(b){var d=-1;g(a,function(c){d++;if(c.file==b)return a.splice(d,1)})};return d},_getFilesDataArray:function(b){var d=[],a={};if(L.test(b&&b.tagName)){var c=h.getFiles(b);a[b.name||"file"]=null!==b.getAttribute("multiple")?c:c[0]}else p(b)&&L.test(b[0]&&b[0].tagName)?g(b,function(b){a[b.name||"file"]=h.getFiles(b)}):a=b;g(a,function B(b,a){p(b)?g(b,function(b){B(b,a)}):b&&b.name&&d.push({name:a,file:b,size:b.size,total:b.size,loaded:0})});d.length||d.push({file:{name:h.expando}});
  return d},_getFormData:function(b,d,a){var c=d.file,e=d.name,m=c.name,p=c.type;d=h.support.transform&&b.imageTransform;var k=new h.Form,f=h.queue(function(){a(k)}),v=d&&(0<parseInt(d.maxWidth||d.minWidth||d.width,10)||d.rotate);h.Image&&d&&(/image/.test(c.type)||V.test(c.nodeType))?(f.inc(),v&&(d=[d]),h.Image.transform(c,d,b.imageAutoOrientation,function(d,a){v&&!d?(!F&&!h.flashEngine&&(a[0]=h.toBinaryString(a[0]),k.multipart=!0),k.append(e,a[0],m,p)):(d||(g(a,function(b,d){!F&&!h.flashEngine&&(b=
  h.toBinaryString(b),k.multipart=!0);k.append(e+"["+d+"]",b,m,p)}),e+="[original]"),(d||b.imageOriginal)&&k.append(e,c,m,p));f.next()})):m!==h.expando&&k.append(e,c,m);g(b.data,function M(b,d){"object"==typeof b?g(b,function(b,a){M(b,d+"["+a+"]")}):k.append(d,b)});f.check()},reset:function(b){var d,a;m?(a=m(b).clone(!0).insertBefore(b).val("")[0],m(b).remove()):(d=b.parentNode,a=d.insertBefore(b.cloneNode(!0),b),a.value="",d.removeChild(b),g(D[h.uid(b)],function(d,c){g(d,function(d){n(b,c,d);r(a,c,
  d)})}));return a},load:function(b,d){var a=h.getXHR();a?(a.open("GET",b,!0),a.overrideMimeType&&a.overrideMimeType("text/plain; charset=x-user-defined"),r(a,"progress",function(b){b.lengthComputable&&d({type:b.type,loaded:b.loaded,total:b.total},a)}),a.onreadystatechange=function(){if(4==a.readyState)if(a.onreadystatechange=null,200==a.status){b=b.split("/");var c={name:b[b.length-1],size:a.getResponseHeader("Content-Length"),type:a.getResponseHeader("Content-Type")};c.dataURL="data:"+c.type+";base64,"+
  h.encode64(a.responseBody||a.responseText);d({type:"load",result:c})}else d({type:"error"})},a.send(null)):d({type:"error"});return a},encode64:function(b){var d="",a=0;for("string"!==typeof b&&(b=String(b));a<b.length;){var c=b.charCodeAt(a++)&255,e=b.charCodeAt(a++)&255,m=b.charCodeAt(a++)&255,k=c>>2,c=(c&3)<<4|e>>4;isNaN(e)?e=m=64:(e=(e&15)<<2|m>>6,m=isNaN(m)?64:m&63);d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(k)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(c)+
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(e)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(m)}return d}};h.addInfoReader(/^image/,function(b,d){if(!b.__dimensions){var a=b.__dimensions=h.defer();h.readAsImage(b,function(b){var d=b.target;a.resolve("load"==b.type?!1:"error",{width:d.width,height:d.height})})}b.__dimensions.then(d)});h.event.dnd=function(b,d,a){var c,e;a||(a=d,d=h.F);l?(r(b,"dragenter dragleave dragover",function(b){for(var a=
  ((b.originalEvent||b||"").dataTransfer||{}).types,m=a&&a.length;m--;)~a[m].indexOf("File")&&(b.preventDefault(),e!==b.type&&(e=b.type,"dragleave"!=e&&d.call(b.currentTarget,!0,b),clearTimeout(c),c=setTimeout(function(){d.call(b.currentTarget,"dragleave"!=e,b)},50)))}),r(b,"drop",function(b){b.preventDefault();e=0;d.call(b.currentTarget,!1,b);h.getDropFiles(b,function(d){a.call(b.currentTarget,d,b)})})):h.log("Drag'n'Drop -- not supported")};m&&!m.fn.dnd&&(m.fn.dnd=function(b,d){return this.each(function(){h.event.dnd(this,
  b,d)})});a.FileAPI=h.extend(h,a.FileAPI);h.flashUrl||(h.flashUrl=h.staticPath+"qiniu.js.flash.swf");h.flashImageUrl||(h.flashImageUrl=h.staticPath+"qiniu.js.flash.image.swf")})(window);
  (function(a,j,g){function r(a,c){if(!(this instanceof r))return new r(a);this.file=a;this.better=!c;this.matrix={sx:0,sy:0,sw:0,sh:0,dx:0,dy:0,dw:0,dh:0,resize:0,deg:0}}var n=Math.min,f=Math.round,c=!1,e={8:270,3:180,6:90};try{c=-1<j.createElement("canvas").toDataURL("image/png").indexOf("data:image/png")}catch(q){}r.prototype={constructor:r,set:function(c){a.extend(this.matrix,c);return this},crop:function(a,c,e,f){e===g&&(e=a,f=c,a=c=0);return this.set({sx:a,sy:c,sw:e,sh:f||e})},resize:function(a,
  c,e){"string"==typeof c&&(e=c,c=a);return this.set({dw:a,dh:c,resize:e})},preview:function(a,c){return this.set({dw:a,dh:c||a,resize:"preview"})},rotate:function(a){return this.set({deg:a})},_load:function(c,e){var f=this;a.readAsImage(c,function(a){e.call(f,"load"!=a.type,a.result)})},_apply:function(a,c){var e=j.createElement("canvas"),f=this.getMatrix(a),g=e.getContext("2d"),n=f.deg,q=f.dw,s=f.dh,w=a.width,l=a.height,r,d=a;if(this.better)for(;2<Math.min(w/q,l/s);)w=~~(w/2+0.5),l=~~(l/2+0.5),r=
  j.createElement("canvas"),r.width=w,r.height=l,d!==a?(r.getContext("2d").drawImage(d,0,0,d.width,d.height,0,0,w,l),d=r):(d=r,d.getContext("2d").drawImage(a,f.sx,f.sy,f.sw,f.sh,0,0,w,l),f.sx=f.sy=f.sw=f.sh=0);e.width=!(n%180)?q:s;e.height=n%180?q:s;g.rotate(n*Math.PI/180);g.drawImage(d,f.sx,f.sy,f.sw||d.width,f.sh||d.height,180==n||270==n?-q:0,90==n||180==n?-s:0,q,s);c.call(this,!1,e)},getMatrix:function(c){var e=a.extend({},this.matrix),g=e.sw=e.sw||c.width;c=e.sh=e.sh||c.height;var q=e.dw=e.dw||
  e.sw,j=e.dh=e.dh||e.sh,t=g/c,r=q/j,s=e.resize;if("preview"==s){if(q!=g||j!=c)if(r>=t?(t=g,s=t/r):(s=c,t=s*r),t!=g||s!=c)e.sx=~~((g-t)/2),e.sy=~~((c-s)/2),g=t,c=s}else s&&("min"==s?(q=f(t<r?n(g,q):j*t),j=f(t<r?q/t:n(c,j))):(q=f(t>=r?n(g,q):j*t),j=f(t>=r?q/t:n(c,j))));e.sw=g;e.sh=c;e.dw=q;e.dh=j;return e},_trans:function(a){this._load(this.file,function(c,e){c?a(c):this._apply(e,a)})},get:function(c){if(a.support.transform){var f=this;"auto"==f.matrix.deg?a.getInfo(this.file,function(a,g){f.matrix.deg=
  e[g&&g.exif&&g.exif.Orientation]||0;f._trans(c)}):f._trans(c)}else c("not_support")},toData:function(a){this.get(a)}};r.exifOrientation=e;r.transform=function(c,e,f,q){a.getInfo(c,function(n,j){var z={},s=a.queue(function(a){q(a,z)});n?s.fail():a.each(e,function(a,e){if(!s.isFail()){var p=r(j.nodeType?j:c);if("function"==typeof a)a(j,p);else if(a.width)p[a.preview?"preview":"resize"](a.width,a.height,a.type);else a.maxWidth&&(j.width>a.maxWidth||j.height>a.maxHeight)&&p.resize(a.maxWidth,a.maxHeight,
  "max");a.rotate===g&&f&&(a.rotate="auto");p.rotate(a.rotate);s.inc();p.toData(function(d,a){d?s.fail():(z[e]=a,s.next())})}})})};a.support.canvas=a.support.transform=c;a.Image=r})(FileAPI,document);
  (function(a,j,g){var r=j.encodeURIComponent,n=j.FormData;j=function(){this.items=[]};j.prototype={append:function(a,c,e,g){this.items.push({name:a,blob:c&&c.blob||(void 0==c?"":c),file:c&&(e||c.name),type:c&&(g||c.type)})},each:function(a){for(var c=0,e=this.items.length;c<e;c++)a.call(this,this.items[c])},toData:function(f,c){c._chunked=a.support.chunked&&0<c.chunkSize&&1==a.filter(this.items,function(a){return a.file}).length;a.support.html5?this.multipart||!n?(a.log("FileAPI.Form.toMultipartData"),
  this.toMultipartData(f)):c._chunked?(a.log("FileAPI.Form.toPlainData"),this.toPlainData(f)):(a.log("FileAPI.Form.toFormData"),this.toFormData(f)):(a.log("FileAPI.Form.toHtmlData"),this.toHtmlData(f))},_to:function(f,c,e,g){var k=a.queue(function(){c(f)});this.each(function(a){e(a,f,k,g)});k.check()},toHtmlData:function(f){this._to(g.createDocumentFragment(),f,function(c,e){var f=c.blob,k;c.file?(a.reset(f),f.name=c.name,e.appendChild(f)):(k=g.createElement("input"),k.name=c.name,k.type="hidden",k.value=
  f,e.appendChild(k))})},toPlainData:function(a){this._to({},a,function(a,e,f){a.file&&(e.type=a.file);a.blob.toBlob?(f.inc(),a.blob.toBlob(function(g){e.name=a.name;e.file=g;e.size=g.length;e.type=a.type;f.next()},"image/png")):a.file?(e.name=a.blob.name,e.file=a.blob,e.size=a.blob.size,e.type=a.type):(e.params||(e.params=[]),e.params.push(encodeURIComponent(a.name)+"="+encodeURIComponent(a.blob)));e.start=-1;e.end=e.file.FileAPIReadPosition||-1;e.retry=0})},toFormData:function(a){this._to(new n,a,
  function(a,e,f){a.file&&e.append("_"+a.name,a.file);a.blob&&a.blob.toBlob?(f.inc(),a.blob.toBlob(function(g){e.append(a.name,g,a.file);f.next()},"image/png")):a.file?e.append(a.name,a.blob,a.file):e.append(a.name,a.blob)})},toMultipartData:function(f){this._to([],f,function(c,e,f,g){var p=!!c.file,n=c.blob,j=function(a){e.push("--_"+g+('\r\nContent-Disposition: form-data; name="'+c.name+'"'+(p?'; filename="'+r(c.file)+'"':"")+(p?"\r\nContent-Type: "+(c.type||"application/octet-stream"):"")+"\r\n\r\n"+
  (p?a:r(a))+"\r\n"));f.next()};f.inc();a.isFile(n)?a.readAsBinaryString(n,function(a){"load"==a.type&&j(a.result)}):j(n)},a.expando)}};a.Form=j})(FileAPI,window,document);
  (function(a,j){var g=function(){},r=function(a){this.uid=j.uid();this.xhr={abort:g,getResponseHeader:g,getAllResponseHeaders:g};this.options=a};r.prototype={status:0,statusText:"",getResponseHeader:function(a){return this.xhr.getResponseHeader(a)},getAllResponseHeaders:function(){return this.xhr.getAllResponseHeaders()||{}},end:function(n,f){var c=this,e=c.options;c.end=c.abort=g;c.status=n;f&&(c.statusText=f);j.log("xhr.end:",n,f);e.complete(200==n||201==n?!1:c.statusText||"unknown",c);c.xhr&&c.xhr.node&&
  setTimeout(function(){var e=c.xhr.node;try{e.parentNode.removeChild(e)}catch(f){}try{delete a[c.uid]}catch(g){}a[c.uid]=c.xhr.node=null},9)},abort:function(){this.end(0,"abort");this.xhr&&(this.xhr.aborted=!0,this.xhr.abort())},send:function(a){var f=this,c=this.options;a.toData(function(a){c.upload(c,f);f._send.call(f,c,a)},c)},_send:function(g,f){var c=this,e,q=c.uid,k=g.url;j.log("XHR._send:",f);k+=(~k.indexOf("?")?"&":"?")+j.uid();f.nodeName?(g.upload(g,c),e=document.createElement("div"),e.innerHTML=
  '<form target="'+q+'" action="'+k+'" method="POST" enctype="multipart/form-data" style="position: absolute; top: -1000px; overflow: hidden; width: 1px; height: 1px;"><iframe name="'+q+'" src="javascript:false;"></iframe><input value="'+q+'" name="callback" type="hidden"/></form>',c.xhr.abort=function(){var a=e.getElementsByName("iframe")[0];if(a)try{a.stop?a.stop():a.contentWindow.stop?a.contentWindow.stop():a.contentWindow.document.execCommand("Stop")}catch(c){}e=null},k=e.getElementsByTagName("form")[0],
  k.appendChild(f),j.log(k.parentNode.innerHTML),document.body.appendChild(e),c.xhr.node=e,a[q]=function(a,f,g){c.readyState=4;c.responseText=g;c.end(a,f);e=null},c.readyState=2,k.submit(),k=null):this.xhr&&this.xhr.aborted?j.log("Error: already aborted"):(e=c.xhr=j.getXHR(),f.params&&(k+=(0>k.indexOf("?")?"?":"&")+f.params.join("&")),e.open("POST",k,!0),e.withCredential="true",(!g.headers||!g.headers["X-Requested-With"])&&e.setRequestHeader("X-Requested-With","XMLHttpRequest"),j.each(g.headers,function(a,
  c){e.setRequestHeader(c,a)}),g._chunked?(e.upload&&e.upload.addEventListener("progress",function(a){f.retry||g.progress({type:a.type,total:f.size,loaded:f.start+a.loaded,totalSize:f.size},c,g)},!1),e.onreadystatechange=function(){c.status=e.status;c.statusText=e.statusText;c.readyState=e.readyState;if(4==e.readyState){for(var a in{"":1,XML:1,Text:1,Body:1})c["response"+a]=e["response"+a];e.onreadystatechange=null;if(!e.status||0<e.status-201)if(j.log("Error: "+e.status),(!e.status&&!e.aborted||500==
  e.status||416==e.status)&&++f.retry<=g.chunkUploadRetry){a=e.status?0:j.chunkNetworkDownRetryTimeout;g.pause(f.file,g);var k=parseInt(e.getResponseHeader("X-Last-Known-Byte"),10);j.log("X-Last-Known-Byte: "+k);f.end=k?k:f.start-1;setTimeout(function(){c._send(g,f)},a)}else c.end(e.status);else f.retry=0,f.end==f.size-1?c.end(e.status):(k=parseInt(e.getResponseHeader("X-Last-Known-Byte"),10),j.log("X-Last-Known-Byte: "+k),k&&(f.end=k),f.file.FileAPIReadPosition=f.end,setTimeout(function(){c._send(g,
  f)},0));e=null}},f.start=f.end+1,f.end=Math.max(Math.min(f.start+g.chunkSize,f.size)-1,f.start),(q="slice")in f.file||(q="mozSlice")in f.file||(q="webkitSlice"),e.setRequestHeader("Content-Range","bytes "+f.start+"-"+f.end+"/"+f.size),e.setRequestHeader("Content-Disposition","attachment; filename="+encodeURIComponent(f.name)),e.setRequestHeader("Content-Type",f.type||"application/octet-stream"),q=f.file[q](f.start,f.end+1),e.send(q),q=null):(e.upload&&e.upload.addEventListener("progress",j.throttle(function(a){g.progress(a,
  c,g)},100),!1),e.onreadystatechange=function(){c.status=e.status;c.statusText=e.statusText;c.readyState=e.readyState;if(4==e.readyState){for(var a in{"":1,XML:1,Text:1,Body:1})c["response"+a]=e["response"+a];e.onreadystatechange=null;c.end(e.status);e=null}},j.isArray(f)?(e.setRequestHeader("Content-Type","multipart/form-data; boundary=_"+j.expando),f=f.join("")+"--_"+j.expando+"--",e.sendAsBinary?e.sendAsBinary(f):(q=Array.prototype.map.call(f,function(a){return a.charCodeAt(0)&255}),e.send((new Uint8Array(q)).buffer))):
  e.send(f)))}};j.XHR=r})(window,FileAPI);
  (function(a,j,g){var r=a.support,n=j.navigator,f=n.mimeTypes,c=!1;if(n.plugins&&"object"==typeof n.plugins["Shockwave Flash"])c=n.plugins["Shockwave Flash"].description&&!(f&&f["application/x-shockwave-flash"]&&!f["application/x-shockwave-flash"].enabledPlugin);else try{c=!(!j.ActiveXObject||!new ActiveXObject("ShockwaveFlash.ShockwaveFlash"))}catch(e){a.log("ShockwaveFlash.ShockwaveFlash -- does not supported.")}r.flash=c;if(a.support.flash&&(!a.html5||!a.support.html5||a.cors&&!a.support.cors)){var q=
  function(a){return('<object id="#id#" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+(a.width||"100%")+'" height="'+(a.height||"100%")+'"><param name="movie" value="#src#" /><param name="flashvars" value="#flashvars#" /><param name="swliveconnect" value="true" /><param name="allowscriptaccess" value="always" /><param name="allownetworking" value="all" /><param name="menu" value="false" /><param name="wmode" value="#wmode#" /><embed flashvars="#flashvars#" swliveconnect="true" allownetworking="all" allowscriptaccess="always" name="#id#" src="#src#" width="'+
  (a.width||"100%")+'" height="'+(a.height||"100%")+'" menu="false" wmode="transparent" type="application/x-shockwave-flash"></embed></object>').replace(/#(\w+)#/ig,function(c,e){return a[e]})},k=function(a,c){if(a&&a.style){var e,f;for(e in c){f=c[e];"number"==typeof f&&(f+="px");try{a.style[e]=f}catch(g){}}}},p=function(d,c){a.each(c,function(a,c){var e=d[c];d[c]=function(){this.parent=e;return a.apply(this,arguments)}})},y=function(d){var c=d.wid=a.uid();l._fn[c]=d;return"FileAPI.Flash._fn."+c},
  u=function(a){try{l._fn[a.wid]=null,delete l._fn[a.wid]}catch(c){}},C=function(a,c){if(!w.test(a)){if(/^\.\//.test(a)||"/"!=a.charAt(0)){var e=location.pathname,e=e.substr(0,e.lastIndexOf("/"));a=(e+"/"+a).replace("/./","/")}"//"!=a.substr(0,2)&&(a="//"+location.host+a);w.test(a)||(a=location.protocol+a)}c&&(a+=(/\?/.test(a)?"&":"?")+c);return a},t=a.uid(),z=0,s={},w=/^https?:/i,l={_fn:{},init:function(){var d=g.body&&g.body.firstChild;if(d){do if(1==d.nodeType){a.log("FlashAPI.Flash.init...");var c=
  g.createElement("div");k(c,{top:1,right:1,width:5,height:5,position:"absolute"});d.parentNode.insertBefore(c,d);l.publish(c,t);return}while(d=d.nextSibling)}10>z&&setTimeout(l.init,50*++z)},publish:function(d,c){d.innerHTML=q({id:c,src:C(a.flashUrl,"r="+a.version),wmode:"transparent",flashvars:"callback=FileAPI.Flash.event&flashId="+c+"&storeKey="+navigator.userAgent.match(/\d/ig).join("")+"_"+a.version+(l.isReady||(a.pingUrl?"&ping="+a.pingUrl:""))})},ready:function(){l.ready=a.F;l.isReady=!0;l.patch();
  a.event.on(g,"mouseover",l.mouseover);a.event.on(g,"click",function(a){l.mouseover(a)&&(a.preventDefault?a.preventDefault():a.returnValue=!0)})},getWrapper:function(a){do if(/qiniu-js-wrapper/.test(a.className))return a;while((a=a.parentNode)&&a!==g.body)},mouseover:function(d){d=a.event.fix(d).target;if(/input/i.test(d.nodeName)&&"file"==d.type){var c=d.getAttribute(t);if("i"==c||"r"==c)return!1;if("p"!=c){d.setAttribute(t,"i");var c=g.createElement("div"),e=l.getWrapper(d);if(!e){a.log("flash.mouseover.error: qiniu-js-wrapper not found");
  return}k(c,{top:0,left:0,width:d.offsetWidth+5,height:d.offsetHeight+5,zIndex:"1000000",position:"absolute"});e.appendChild(c);l.publish(c,a.uid());d.setAttribute(t,"p")}return!0}},event:function(d){var c=d.type;if("ready"==c){try{l.getInput(d.flashId).setAttribute(t,"r")}catch(e){}l.ready();setTimeout(function(){l.mouseenter(d)},50);return!0}"ping"===c?a.log("(flash -> js).ping:",[d.status,d.savedStatus],d.error):"log"===c?a.log("(flash -> js).log:",d.target):c in l&&setTimeout(function(){a.log("Flash.event."+
  d.type+":",d);l[c](d)},1)},mouseenter:function(d){var c=l.getInput(d.flashId);if(c){l.cmd(d,"multiple",null!=c.getAttribute("multiple"));var e=[],f={};a.each((c.getAttribute("accept")||"").split(/,\s*/),function(d){a.accept[d]&&a.each(a.accept[d].split(" "),function(a){f[a]=1})});a.each(f,function(a,d){e.push(d)});l.cmd(d,"accept",e.length?e.join(",")+","+e.join(",").toUpperCase():"*")}},get:function(a){return g[a]||j[a]||g.embeds[a]},getInput:function(d){try{var c=l.getWrapper(l.get(d));if(c)return c.getElementsByTagName("input")[0]}catch(e){a.log('Can not find "input" by flashId:',
  d,e)}},select:function(d){var c=l.getInput(d.flashId),e=a.uid(c);d=d.target.files;a.each(d,function(d){a.checkFileObj(d)});s[e]=d;g.createEvent?(e=g.createEvent("Event"),e.initEvent("change",!0,!1),c.dispatchEvent(e)):g.createEventObject&&(e=g.createEventObject(),c.fireEvent("onchange",e))},cmd:function(d,c,e,f){try{return a.log("(js -> flash)."+c+":",e),l.get(d.flashId||d).cmd(c,e)}catch(g){a.log("(js -> flash).onError:",g),f||setTimeout(function(){l.cmd(d,c,e,!0)},50)}},patch:function(){a.flashEngine=
  a.support.transform=!0;p(a,{getFiles:function(d,c,e){if(e)return a.filterFiles(a.getFiles(d),c,e),null;var f=a.isArray(d)?d:s[a.uid(d.target||d.srcElement||d)];if(!f)return this.parent.apply(this,arguments);c&&(c=a.getFilesFilter(c),f=a.filter(f,function(a){return c.test(a.name)}));return f},getInfo:function(d,c){if(d&&!d.flashId)this.parent.apply(this,arguments);else{if(!d.__info){var e=d.__info=a.defer();l.cmd(d,"getFileInfo",{id:d.id,callback:y(function F(a,c){u(F);e.resolve(a,d.info=c)})})}d.__info.then(c)}}});
  a.support.transform=!0;a.Image&&p(a.Image.prototype,{get:function(a,c){this.set({scaleMode:c||"noScale"});this.parent(a)},_load:function(d,c){a.log("FileAPI.Image._load:",d);if(d&&!d.flashId)this.parent.apply(this,arguments);else{var e=this;a.getInfo(d,function(a){c.call(e,a,d)})}},_apply:function(d,c){a.log("FileAPI.Image._apply:",d);if(d&&!d.flashId)this.parent.apply(this,arguments);else{var e=this.getMatrix(d.info);l.cmd(d,"imageTransform",{id:d.id,matrix:e,callback:y(function F(f,j){a.log("FileAPI.Image._apply.callback:",
  f);u(F);if(f)c(f);else if(!a.support.dataURI||3E4<j.length){var n={width:!(e.deg%180)?e.dw:e.dh,height:e.deg%180?e.dw:e.dh,scale:e.scaleMode},p=c,r=function(){try{l.get(t).setImage(j)}catch(d){a.log('flash.setImage -- can not set "base64":',d)}},s,t=a.uid(),A=g.createElement("div");for(s in n)A.setAttribute("data-img-"+s,n[s]);k(A,n);A.innerHTML=q(a.extend({id:t,src:C(a.flashImageUrl,"r="+a.uid()),wmode:"opaque",flashvars:"scale="+n.scale+"&callback="+y(function J(){u(J);setTimeout(r,99);return!0})},
  n));p(!1,A);A=null}else{var w=new Image;a.event.one(w,"error abort load",function(a){c("load"!=a.type&&a.type,w);w=null});w.src="data:"+d.type+";base64,"+j}})})}},toData:function(d){var c=this.file,e=c.info,f=this.getMatrix(e);c&&!c.flashId?this.parent.apply(this,arguments):("auto"==f.deg&&(f.deg=a.Image.exifOrientation[e&&e.exif&&e.exif.Orientation]||0),d.call(this,!c.info,{id:c.id,flashId:c.flashId,name:c.name,type:c.type,matrix:f}))}});p(a.Form.prototype,{toData:function(c){for(var e=this.items,
  f=e.length;f--;)if(e[f].file&&e[f].blob&&!e[f].blob.flashId)return this.parent.apply(this,arguments);a.log("flash.Form.toData");c(e)}});p(a.XHR.prototype,{_send:function(c,e){if(e.nodeName||e.append&&a.support.html5||a.isArray(e)&&"string"===typeof e[0])return this.parent.apply(this,arguments);var f={},g={},j=this,k,n;a.each(e,function(a){a.file?(g[a.name]=a={id:a.blob.id,name:a.blob.name,matrix:a.blob.matrix,flashId:a.blob.flashId},n=a.id,k=a.flashId):f[a.name]=a.blob});if(!n&&!k)return this.parent.apply(this,
  arguments);a.log("flash.XHR._send:",k,n,g);j.xhr={headers:{},abort:function(){l.cmd(k,"abort",{id:n})},getResponseHeader:function(a){return this.headers[a]},getAllResponseHeaders:function(){return this.headers}};var p=a.queue(function(){l.cmd(k,"upload",{url:C(c.url),data:f,files:g,headers:c.headers,callback:y(function I(e){var f=e.type,g=e.result;a.log("flash.upload."+f+":",e);if("progress"==f)e.loaded=Math.min(e.loaded,e.total),e.lengthComputable=!0,c.progress(e);else if("complete"==f)u(I),"string"==
  typeof g&&(j.responseText=g.replace(/%22/g,'"').replace(/%5c/g,"\\").replace(/%26/g,"&").replace(/%25/g,"%")),j.end(e.status||200);else if("abort"==f||"error"==f)j.end(e.status||0,e.message),u(I)})})});a.each(g,function(c){p.inc();a.getInfo(c,p.next)});p.check()}})}};a.Flash=l;var x=new Image;a.event.one(x,"error load",function(){a.support.dataURI=!(1!=x.width||1!=x.height);x=null;l.init()});x.src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="}})(FileAPI,window,document);
  "undefined"!==typeof ajs&&ajs.loaded&&ajs.loaded("{fileapi}FileAPI.min");
  return window.FileAPI;
});;def('qiniu.deps.shim', function() {
  function createScript() {
    return document.createElement("script");
  }
  // JSON
  var s = document.getElementsByTagName("script")[0];
  var head = s.parentNode;

  if (!window.JSON) {
    var jsonSrc = createScript();
    jsonSrc.src = "//cdn.staticfile.org/json2/20121008/json2.min.js";
    head.insertBefore(jsonSrc, s);
  }
  
  if (!window.atob && !window.btoa) {
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64DecodeChars = [
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
      52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
      -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
      15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
      -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
      41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1 ];

    function base64encode(str) {
      var out, i, len;
      var c1, c2, c3;

      len = str.length;
      i = 0;
      out = "";
      while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
        out += base64EncodeChars.charAt(c3 & 0x3F);
      }
      return out;
    }

    function base64decode(str) {
      var c1, c2, c3, c4;
      var i, len, out;

      len = str.length;
      i = 0;
      out = "";
      while (i < len) {
        do {
          c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c1 == -1);
        if (c1 == -1)
          break;
        do {
          c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c2 == -1);
        if (c2 == -1) break;
       
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
        do {
          c3 = str.charCodeAt(i++) & 0xff;
          if (c3 == 61) return out;
          c3 = base64DecodeChars[c3];
        } while (i < len && c3 == -1);
        if (c3 == -1) break;
        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
        do {
          c4 = str.charCodeAt(i++) & 0xff;
          if (c4 == 61) return out;
          c4 = base64DecodeChars[c4];
        } while (i < len && c4 == -1);
        if (c4 == -1) break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
      }
      return out;
    }
    window.btoa = base64encode;
    window.atob = base64decode;
  }
});;def('qiniu.Asset', [ 'qiniu.utils', 'qiniu.Fop' ], function(require, exports, module) {

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
    return utils.format('http://%s.qiniudn.com/%s', this.parent.name, this.key);
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

  return module.exports = exports = function(config) {
    configData = config;
    return Asset;
  };
});;def('qiniu.Image', [ 'qiniu.Asset', 'qiniu.utils', 'qiniu.deps.Events', 'qiniu.deps.file', 'qiniu.deps.Ajax' ], function(require, exports, module) {

  if ('undefined' !== typeof define && define.amd) {
    var Asset  = arguments[0];
    var utils  = arguments[1];
    var events = arguments[2];
    var file   = arguments[3];
    var ajax   = arguments[4];
  } else {
    var Asset  = require('qiniu.Asset')({});
    var utils  = require('qiniu.utils');
    var events = require('qiniu.deps.Events');
    var file   = require('qiniu.deps.file');
    var ajax   = require('qiniu.deps.Ajax');
  }

  var EventEmitter = events.EventEmitter;
  var Promise = events.Promise;

  /**
   * Image Asset
   * @param {String} key    key
   * @param {Bucket} parent bucket object
   */
  function _Image(key, parent, _config) {
    var config = utils.objExtend(utils.objClone(parent.config), {
      separate: '-'
    }, _config);

    this.key = key;
    this.parent = parent;
    this.config = config;
  }
  utils.inherits(_Image, Asset);

  /**
   * get the image's infomations
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  _Image.prototype.imageInfo = function(callback) {
    var promise = new Promise();
    callback = callback || noop;

    var infoUrl = this.url() + '?imageInfo';

    ajax.get(infoUrl, function(err, body) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      var info = JSON.parse(body);

      promise.resolve(info);
      callback(null, info);
    });

    return promise;
  };

  /**
   * get the exif infomation of the picture
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  _Image.prototype.exif = function(callback) {
    var promise = new Promise();
    callback = callback || noop;

    var infoUrl = this.url() + '?exif';

    ajax.get(infoUrl, function(err, body) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      var info = JSON.parse(body);

      promise.resolve(info);
      callback(null, info);
    });

    return promise;
  };

  var imageViewTranslations = {
    weight: 'w',
    height: 'h',
    quality: 'q'
  };

  /**
   * return a thumbnail image
   * @param  {Object}   opts     options
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  _Image.prototype.imageView = function(opts, callback) {
    var promise = new Promise();
    callback = callback || noop;

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

    url += utils.format('?imageView/%d%s', mode, genOptUrl(params));

    var image = new Image();
    image.src = url;

    promise.image = image;

    promise.resolve(image);

    return promise;
  };

  /**
   * return a processed image
   * @param  {Object}   opts     options
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  _Image.prototype.imageMogr = function(opts) {
    var promise = new Promise();
    var url = this.url();
    var params = {};

    utils.objExtend(params, opts);
    
    url += utils.format('?imageMogr/v2/auto-orient%s', genOptUrl(params));

    var image = new Image();
    image.src = url;

    promise.image = image;

    promise.resolve(image);

    return promise;
  };

  /**
   * return a image with a watermark
   * @param  {Object}   opts     options
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  _Image.prototype.watermark = function(opts, callback) {
    var promise = new Promise();
    callback = callback || noop;
    
    var url = this.url();
    var params = {};
    var mode = opts.mode;
    delete opts.mode;

    utils.objExtend(params, opts);

    params.image = utils.safeEncode(params.image);

    url += utils.format('?watermark/%d%s', mode, genOptUrl(params));

    var image = new Image();
    image.src = url;

    promise.image = image;

    promise.resolve(image);

    return promise;
  };

  _Image.extend = function(_file) {
    _file.imageView = function(opts, callback) {
      var promise = new events.Promise();
      callback = callback || noop;

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
              return promise.reject(err);
            }

            callback(null, image);
            promise.resolve(image);
          });

      });

      return promise;
    };

    _file.imageMogr = function(opts, callback) {
      var promise = new events.Promise();
      callback = callback || noop;

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
              return promise.reject(err);
            }

            callback(null, image);
            promise.resolve(image);
          });
      });

      return promise;
    };
    
    _file.imageInfo = function(callback) {
      var promise = new events.Promise();
      callback = callback || noop;

      var img = file.Image(this);

      img._load(this, function(err, img) {
        if (err) {
          callback(err);
          return promise.reject(err);
        }

        var info = {
          width: img.width,
          height: img.height
        };
        callback(null, info);
        promise.resolve(info);
      });
      return promise;
    };

    _file.image = function() {
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

  return module.exports = exports = _Image;
});;def('qiniu.Bucket', [ 'qiniu.Asset', 'qiniu.Image', 'qiniu.utils', 'qiniu.deps.file', 'qiniu.deps.Events', 'qiniu.deps.Ajax' ], function(require, exports, module) {
  
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

    // uploading
    var xhr = file.upload({
      url: uploadUrl,
      data: {
        token: putToken,
        key: key
      },
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
});;def('qiniu.Fop', [ 'qiniu.utils' ], function(require, exports, module) {

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
;def('qiniu', [ 'qiniu.Asset', 'qiniu.Bucket', 'qiniu.Image', 'qiniu.utils', 'qiniu.deps.Events', 'qiniu.deps.shim', 'qiniu.deps.file', 'qiniu.deps.Ajax' ], function(require, exports) {

  var _configData = {
    uploadUrl : 'up.qiniu.com',
    rsUrl     : 'rs.qbox.me',
    rsfUrl    : 'rsf.qbox.me'
  };

  if ('undefined' !== typeof define && define.amd) {
    var Asset  = arguments[0](_configData);
    var Bucket = arguments[1](_configData);
    var _Image = arguments[2];
    var utils  = arguments[3];
    var events = arguments[4];
    var file   = arguments[6];
    var ajax   = arguments[7];
  } else {
    var Asset  = require('qiniu.Asset')(_configData);
    var Bucket = require('qiniu.Bucket')(_configData);
    var _Image = require('qiniu.Image');
    var utils  = require('qiniu.utils');
    var events = require('qiniu.deps.Events');
    var file   = require('qiniu.deps.file');
    var ajax   = require('qiniu.deps.Ajax');
  }

  var qiniu = exports;

  /**
   * Global Config
   * Example:
   * ```
   * qiniu.config({
   *   foo: '-----'
   * });
   *
   * qiniu.config('foo', 'bar');
   * qiniu.config('foo');
   * ``` 
   * @param  {String/Object} key   key of config
   * @param  {Mix}           value value
   */
  qiniu.config = function(key, value) {
    if (arguments.length > 1 && key instanceof String) {
      // set config data normally
      qiniu.set(key, value);
    } else {
      switch (true) {
        case utils.isString(key):
          // Get config data
          return qiniu.get(key);
          break;
        case utils.isObject(key):
          // Set config data with a object
          for (var ii in key) {
            (function(_key) {
              qiniu.set(_key, key[_key]);
            })(ii);
          }
          break;
      }
    }

    return this;
  };

  /**
   * Set config data
   * @param  {String} key   key
   * @param  {Mix}    value value
   * @return {Object}       qiniu object
   */
  qiniu.set = function(key, value) {
    _configData[key] = value;

    return this;
  };

  /**
   * Get config data
   * @param  {String} key   key
   * @return {Mix}          config value
   */
  qiniu.get = function(key) {
    return _configData[key];
  };

  /**
   * Binding the select button
   * @param  {HTMLElement} el      select button
   * @param  {Object} options options
   * @return {Object}         qiniu
   */
  qiniu.bind = function(el, options) {
    options = options || {};

    var css = ".qiniu-transparent { \
      zoom: 1; \
      opacity: 0; \
      -moz-opacity: 0; \
      -khtml-opacity: 0; \
      filter: 'alpha(opacity=0)'; \
      *filter: alpha(opacity=0); \
    }";
    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);

    var tmp = document.createElement('div');
    var html = '<span class="qiniu-js-wrapper qiniu-transparent"></span>';
    tmp.innerHTML = html;
    var wrapper = tmp.firstChild;

    if (el.jquery) {
      el
        .before(wrapper)
        .addClass('select-btn');
    } else {
      var parentNode = el.parentNode;
      parentNode.insertBefore(wrapper, el);
    }

    var input       = document.createElement('input');
    input.type      = 'file';
    input.className = 'qiniu-transparent';
    input.multiple  = true;

    wrapper.appendChild(input);

    el = el.jquery ? el.get(0) : el;

    utils.css(wrapper, {
      top      : el.style.top,
      right    : el.style.right,
      position : "absolute",
      width    : el.offsetWidth + 5,
      height   : el.offsetHeight + 5,
      margin   : el.style.margin
    });
    utils.css(input, {
      width    : el.offsetWidth + 5,
      height   : el.offsetHeight + 5,
      position : 'relative'
    });

    file.event.on(input, 'change', function(evt) {
      var files = file.getFiles(evt);
      var filter = options.filter || false;

      var filters = {
        'image': /image/,
        'audio': /audio/,
        'video': /video/,
        'media': /audio|video/
      };

      switch (true) {
        case utils.isString(filter):
          if (filters[filter]) {
            files = file.filter(files, function(_file) {
              return filters[filter].test(_file.type);
            });
          }
          break;
        case utils.isArray(filter):
          for (var i = 0; i < filter.length; i++) {
            (function(index) {
              files = file.filter(files, function(_file) {
                return filters[filter[index]].test(_file.type);
              });
            })(i);
          }
          break;
        case (filter instanceof RegExp):
          files = file.filter(files, function(_file) {
            return filter.test(_file.type);
          });
          break;
      }

      for (var i = 0; i < files.length; i++) {
        (function(index) {
          qiniu.emit('file', _Image.extend(files[index]));
        })(i);
      }
    });

    return this;
  };

  /**
   * Binding the drag and drop aera
   * @param  {HTMLElement} el      aera
   * @param  {Object} options options
   * @return {Object}         qiniu
   */
  qiniu.bind.dnd = function(el, options) {
    if (file.support.dnd) {
      file.event.dnd(
        (el.jquery ? el.get(0) : el),
        function(files) {
          var filter = options.filter || false;

          var filters = {
            'image': /image/,
            'audio': /audio/,
            'video': /video/,
            'media': /audio|video/
          };

          switch (true) {
            case utils.isString(filter):
              if (filters[filter]) {
                files = file.filter(files, function(_file) {
                  return filters[filter].test(_file.type);
                });
              }
              break;
            case utils.isArray(filter):
              for (var i = 0; i < filter.length; i++) {
                (function(index) {
                  files = file.filter(files, function(_file) {
                    return filters[filter[index]].test(_file.type);
                  });
                })(i);
              }
              break;
            case (filter instanceof RegExp):
              files = file.filter(files, function(_file) {
                return filter.test(_file.type);
              });
              break;
          }

          for (var i = 0; i < files.length; i++) {
            (function(index) {
              qiniu.emit('file', _Image.extend(files[index]));
            })(i);
          }
        }
      );

      file.event.on(
        (el.jquery ? el.get(0) : el),
        'dragover dragleave',
        function(evt) {
          switch (evt.type) {
            case 'dragover':
              (options.over && utils.isFunction(options.over) ? options.over : noop)
                .call(null);

              qiniu.emit('over');
              break;
            case 'dragleave':
              (options.out && utils.isFunction(options.out) ? options.out : noop)
                .call(null);

              qiniu.emit('out');
          }
        }
      );

      (options.success && utils.isFunction(options.success) ? options.success : noop).call(null);
      qiniu.emit('dnd.success');
    } else {
      qiniu.emit('dnd.error', 'no support');
      (options.error && utils.isFunction(options.error) ? options.error : noop).call(null, 'no support');
    }

    return qiniu;
  };

  qiniu.supportDnd = file.support.dnd;

  qiniu.bucket = function(bucket, config) {
    return new Bucket(bucket, config);
  };

  qiniu.Asset = Asset;
  qiniu.Bucket = Bucket;
  qiniu.Image = _Image;

  utils.objExtend(qiniu, events.EventEmitter.prototype);
  events.EventEmitter.call(qiniu);

  function noop() {
    return false;
  }

  return qiniu;
});
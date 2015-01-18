def('qiniu.utils', function() {
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
      var encoded = btoa(str);
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
});
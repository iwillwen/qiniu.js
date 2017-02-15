(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
   typeof define === 'function' && define.amd ? define(factory) :
   (global.qiniu = factory());
}(this, function () { 'use strict';

   var babelHelpers = {};
   babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
     return typeof obj;
   } : function (obj) {
     return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
   };

   babelHelpers.classCallCheck = function (instance, Constructor) {
     if (!(instance instanceof Constructor)) {
       throw new TypeError("Cannot call a class as a function");
     }
   };

   babelHelpers.createClass = function () {
     function defineProperties(target, props) {
       for (var i = 0; i < props.length; i++) {
         var descriptor = props[i];
         descriptor.enumerable = descriptor.enumerable || false;
         descriptor.configurable = true;
         if ("value" in descriptor) descriptor.writable = true;
         Object.defineProperty(target, descriptor.key, descriptor);
       }
     }

     return function (Constructor, protoProps, staticProps) {
       if (protoProps) defineProperties(Constructor.prototype, protoProps);
       if (staticProps) defineProperties(Constructor, staticProps);
       return Constructor;
     };
   }();

   babelHelpers.inherits = function (subClass, superClass) {
     if (typeof superClass !== "function" && superClass !== null) {
       throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
     }

     subClass.prototype = Object.create(superClass && superClass.prototype, {
       constructor: {
         value: subClass,
         enumerable: false,
         writable: true,
         configurable: true
       }
     });
     if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
   };

   babelHelpers.possibleConstructorReturn = function (self, call) {
     if (!self) {
       throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
     }

     return call && (typeof call === "object" || typeof call === "function") ? call : self;
   };

   babelHelpers;

   var slice = [].slice;

   var nativeForEach = [].forEach || false;

   var utils = {
     slice: slice,
     noop: function noop() {
       return false;
     },

     // Class Inherits
     inherits: function inherits(ctor, superCtor) {
       ctor.super_ = superCtor;
       ctor.prototype = utils.objCreate(utils.objExtend(utils.objClone(superCtor.prototype), {
         constructor: {
           value: ctor,
           enumerable: false,
           writable: true,
           configurable: true
         }
       }));
     },

     isString: function isString(val) {
       return typeof val == 'string';
     },

     isObject: function isObject(val) {
       return val instanceof Object;
     },

     isArray: function isArray(val) {
       return val instanceof Array;
     },

     isFunction: function isFunction(val) {
       return val instanceof Function;
     },

     isUndefine: function isUndefine(val) {
       return val === void 0;
     },

     objClone: function objClone(obj) {
       if (!utils.isObject(obj)) return obj;
       return utils.isArray(obj) ? obj.slice() : utils.objExtend({}, obj);
     },

     objExtend: function objExtend(obj) {
       var sources = slice.call(arguments, 1);

       for (var i = 0; i < sources.length; i++) {
         (function (index) {
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

     objCreate: function objCreate(o) {
       if (arguments.length > 1) {
         throw new Error('Object.create implementation only accepts the first parameter.');
       }
       function F() {}
       F.prototype = o;
       return new F();
     },

     objKeys: function objKeys(obj) {
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

     each: function each(obj, iterator, context) {
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

     format: function format(str) {
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

       var rtn = String(str).replace(formatRegExp, function (x) {

         if (x === '%%') {
           return '%';
         }

         if (i >= len) {
           return x;
         }
         switch (x) {
           case '%s':
             return String(values[i++]);
           case '%d':
             return Number(values[i++]);
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

     safeEncode: function safeEncode(str) {
       var encoded = btoa(str);
       var rtn = encoded.replace(/\//g, '_').replace(/\+/g, '-');

       return rtn;
     },

     css: function css(el, _css) {
       if (el && el.style) {
         var key, val;
         for (key in _css) {
           val = _css[key];
           if (typeof val == 'number') val += 'px';
           try {
             el.style[key] = val;
           } catch (e) {}
         }
       }
     }

   };

   var imageViewTranslations = {
     weight: 'w',
     height: 'h',
     quality: 'q'
   };

   var Fop = function () {
     /**
      * Fop Class
      * @param {Asset} asset    asset
      * @param {Object} _config config
      */

     function Fop(asset) {
       var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
       babelHelpers.classCallCheck(this, Fop);

       this.parent = asset;
       this.config = config;

       this.query = '';
     }

     /**
      * custom fop
      * @param  {String} str fop string
      * @return {Fop}     fop
      */


     babelHelpers.createClass(Fop, [{
       key: 'fop',
       value: function fop(str) {
         this.query += '|' + str;

         return this;
       }

       /**
        * Add imageInfo to the fop
        * @return {Fop} fop
        */

     }, {
       key: 'imageInfo',
       value: function imageInfo() {
         this.query += '|imageInfo';

         return this;
       }

       /**
        * Add exif to the fop
        * @return {Fop} fop
        */

     }, {
       key: 'exif',
       value: function exif() {
         this.query += '|exif';

         return this;
       }

       /**
        * Add imageView to the fop
        * @param  {Object} opts options
        * @return {Fop}      fop
        */

     }, {
       key: 'imageView',
       value: function imageView(opts) {
         var mode = opts.mode;
         delete opts.mode;

         var url = this.url();
         var params = {};

         utils.each(opts, function (value, key) {
           if (imageViewTranslations.hasOwnProperty(key)) {
             key = imageViewTranslations[key];
           }

           params[key] = value;
         });

         this.query += utils.format('|imageView/%d%s', mode, genOptUrl(params));

         return this;
       }

       /**
        * Add imageMogr to the fop
        * @param  {Object} opts options
        * @return {Fop}      fop
        */

     }, {
       key: 'imageMogr',
       value: function imageMogr(opts) {
         var params = {};

         utils.objExtend(params, opts);

         this.query += utils.format('|imageMogr/v2/auto-orient%s', genOptUrl(params));

         return this;
       }

       /**
        * Add watermark to the fop
        * @param  {Object} opts options
        * @return {Fop}      fop
        */

     }, {
       key: 'watermark',
       value: function watermark(opts) {
         var params = {};
         var mode = opts.mode;
         delete opts.mode;

         utils.objExtend(params, opts);

         params.image = utils.safeEncode(params.image);

         this.query += utils.format('|watermark/%d%s', mode, genOptUrl(params));

         return this;
       }

       /**
        * Add qrcode to the fop
        * @param  {Object} opts options
        * @return {Fop}      fop
        */

     }, {
       key: 'qrcode',
       value: function qrcode(opts) {
         opts = opts || {
           mode: 0,
           level: 'L'
         };

         this.query += utils.format('|qrcode/%d/level/%s', this.url(), opts.mode, opts.level);

         return this;
       }

       /**
        * Markdown to HTML
        * @param  {Object}   opts     options
        * @return {Fop}           fop
        */

     }, {
       key: 'md2html',
       value: function md2html(opts) {
         opts = opts || {
           mode: false,
           css: false
         };

         var url = '|md2html';

         if (opts.css) {
           url += utils.format('/%s', opts.mode);
         }

         if (opts.css) {
           url += utils.format('/css/%s', utils.safeEncode(opts.css));
         }

         this.query += url;

         return this;
       }

       /**
        * get the url of the fop
        * @return {String} url
        */

     }, {
       key: 'url',
       value: function url() {
         return utils.format('%s?%s', this.parent.url(), this.query.substr(1));
       }

       /**
        * return the image of the fop
        * @return {Image} image
        */

     }, {
       key: 'image',
       value: function image() {
         var image = new Image();
         image.src = this.url();

         return image;
       }
     }]);
     return Fop;
   }();

   function genOptUrl(params) {
     var url = "";

     utils.each(params, function (value, key) {
       url += utils.format('/%s/%s', key, value);
     });

     return url;
   }

   var configData = {};
   function noop$1() {
     return false;
   }

   var Asset$1 = function () {

     /**
      * Asset Class
      * @param {String} key    Asset's key
      * @param {Bucket} parent Bucket object
      */

     function Asset(key, parent) {
       var config = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
       babelHelpers.classCallCheck(this, Asset);

       this.key = key;
       this.parent = parent;

       this.config = config;
     }

     /**
      * return the asset url
      * @return {String} url
      */


     babelHelpers.createClass(Asset, [{
       key: 'url',
       value: function url() {
         return this.parent.url() + '/' + this.key;
       }

       /**
        * return the encoded entry url of the asset
        * @return {String} entry url
        */

     }, {
       key: 'entryUrl',
       value: function entryUrl() {
         return utils.safeEncode(utils.format('%s:%s', this.parent.name, this.key));
       }

       /**
        * return the qrcode image of the asset
        * @param  {Object}   opts     options
        * @return {String}            url
        */

     }, {
       key: 'qrcode',
       value: function qrcode(opts, callback) {
         switch (true) {
           case utils.isFunction(opts):
             callback = opts;
             opts = { mode: 0, level: 'L' };
             break;
           case utils.isObject(opts) && utils.isUndefined(callback):
             callback = noop$1;
             break;
           case utils.isUndefined(opts):
             opts = { mode: 0, level: 'L' };
             callback = noop$1;
             break;
         }

         var url = utils.format('%s?qrcode/%d/level/%s', this.url(), opts.mode, opts.level);

         var img = new Image();
         img.src = img.url = url;

         return img;
       }
     }, {
       key: 'fop',
       value: function fop(config) {
         return new Fop(this, config);
       }

       /**
        * return a image with a established format
        * @param  {String}   alias    alias name
        * @return {String}            url
        */

     }, {
       key: 'alias',
       value: function alias(_alias) {
         var url = this.url();

         url += utils.format('%s%s', this.config.separate, _alias);

         return url;
       }

       /**
        * Markdown to HTML
        * @param  {Object}   opts     options
        * @return {Promise}           promise object
        */

     }, {
       key: 'md2html',
       value: function md2html(opts) {
         if (utils.isFunction(opts)) {
           callback = opts;
           opts = {
             mode: false,
             css: false
           };
         } else if (utils.isObject(opts)) {
           callback = callback || noop$1;
         } else {
           callback = callback || noop$1;
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

         return url;
       }
     }]);
     return Asset;
   }();

   function _Asset (config) {
     configData = config;
     return Asset$1;
   }

   /**!
    * FileAPI — a set of tools for working with files
    *
    * @author  RubaXa  <trash@rubaxa.org>
    * @build lib/canvas-to-blob lib/FileAPI.core lib/FileAPI.Image lib/FileAPI.Form lib/FileAPI.XHR lib/FileAPI.Flash
    */ /*! fileapi 2.0.2 - BSD | git://github.com/mailru/FileAPI.git
    * FileAPI — a set of  javascript tools for working with files. Multiupload, drag'n'drop and chunked file upload. Images: crop, resize and auto orientation by EXIF.
    */window.FileAPI={staticPath:'http://iwillwen.u.qiniudn.com/',withCredentials:false}; /*jslint evil: true */ /*global window, URL, webkitURL, ActiveXObject */(function(window,undef){'use strict';var gid=1,noop=function noop(){},document=window.document,doctype=document.doctype||{},userAgent=window.navigator.userAgent, // https://github.com/blueimp/JavaScript-Load-Image/blob/master/load-image.js#L48
   apiURL=window.createObjectURL&&window||window.URL&&URL.revokeObjectURL&&URL||window.webkitURL&&webkitURL,Blob=window.Blob,File=window.File,FileReader=window.FileReader,FormData=window.FormData,XMLHttpRequest=window.XMLHttpRequest,jQuery=window.jQuery,html5=!!(File&&FileReader&&(window.Uint8Array||FormData||XMLHttpRequest.prototype.sendAsBinary))&&!(/safari\//i.test(userAgent)&&!/chrome\//i.test(userAgent)&&/windows/i.test(userAgent)), // BugFix: https://github.com/mailru/FileAPI/issues/25
   cors=html5&&'withCredentials' in new XMLHttpRequest(),chunked=html5&&!!Blob&&!!(Blob.prototype.webkitSlice||Blob.prototype.mozSlice||Blob.prototype.slice), // https://github.com/blueimp/JavaScript-Canvas-to-Blob
   dataURLtoBlob=window.dataURLtoBlob,_rimg=/img/i,_rcanvas=/canvas/i,_rimgcanvas=/img|canvas/i,_rinput=/input/i,_rdata=/^data:[^,]+,/,Math=window.Math,_SIZE_CONST=function _SIZE_CONST(pow){pow=new window.Number(Math.pow(1024,pow));pow.from=function(sz){return Math.round(sz*this);};return pow;},_elEvents={}, // element event listeners
   _infoReader=[], // list of file info processors
   _readerEvents='abort progress error load loadend',_xhrPropsExport='status statusText readyState response responseXML responseText responseBody'.split(' '),currentTarget='currentTarget', // for minimize
   preventDefault='preventDefault', // and this too
   _isArray=function _isArray(ar){return ar&&'length' in ar;}, /**
        * Iterate over a object or array
        */_each=function _each(obj,fn,ctx){if(obj){if(_isArray(obj)){for(var i=0,n=obj.length;i<n;i++){if(i in obj){fn.call(ctx,obj[i],i,obj);}}}else {for(var key in obj){if(obj.hasOwnProperty(key)){fn.call(ctx,obj[key],key,obj);}}}}}, /**
        * Merge the contents of two or more objects together into the first object
        */_extend=function _extend(dst){var args=arguments,i=1,_ext=function _ext(val,key){dst[key]=val;};for(;i<args.length;i++){_each(args[i],_ext);}return dst;}, /**
        * Add event listener
        */_on=function _on(el,type,fn){if(el){var uid=api.uid(el);if(!_elEvents[uid]){_elEvents[uid]={};}_each(type.split(/\s+/),function(type){if(jQuery){jQuery.event.add(el,type,fn);}else {if(!_elEvents[uid][type]){_elEvents[uid][type]=[];}_elEvents[uid][type].push(fn);if(el.addEventListener){el.addEventListener(type,fn,false);}else if(el.attachEvent){el.attachEvent('on'+type,fn);}else {el['on'+type]=fn;}}});}}, /**
        * Remove event listener
        */_off=function _off(el,type,fn){if(el){var uid=api.uid(el),events=_elEvents[uid]||{};_each(type.split(/\s+/),function(type){if(jQuery){jQuery.event.remove(el,type,fn);}else {var fns=events[type]||[],i=fns.length;while(i--){if(fns[i]===fn){fns.splice(i,1);break;}}if(el.addEventListener){el.removeEventListener(type,fn,false);}else if(el.detachEvent){el.detachEvent('on'+type,fn);}else {el['on'+type]=null;}}});}},_one=function _one(el,type,fn){_on(el,type,function _(evt){_off(el,type,_);fn(evt);});},_fixEvent=function _fixEvent(evt){if(!evt.target){evt.target=window.event&&window.event.srcElement||document;}if(evt.target.nodeType===3){evt.target=evt.target.parentNode;}return evt;},_supportInputAttr=function _supportInputAttr(attr){var input=document.createElement('input');input.setAttribute('type',"file");return attr in input;}, /**
        * FileAPI (core object)
        */api={version:'2.0.2',cors:false,html5:true,media:false,formData:true,debug:false,pingUrl:false,multiFlash:false,flashAbortTimeout:0,withCredentials:true,staticPath:'./dist/',flashUrl:0, // @default: './FileAPI.flash.swf'
   flashImageUrl:0, // @default: './FileAPI.flash.image.swf'
   postNameConcat:function postNameConcat(name,idx){return name+(idx!=null?'['+idx+']':'');},ext2mime:{jpg:'image/jpeg',tif:'image/tiff',txt:'text/plain'}, // Fallback for flash
   accept:{'image/*':'art bm bmp dwg dxf cbr cbz fif fpx gif ico iefs jfif jpe jpeg jpg jps jut mcf nap nif pbm pcx pgm pict pm png pnm qif qtif ras rast rf rp svf tga tif tiff xbm xbm xpm xwd','audio/*':'m4a flac aac rm mpa wav wma ogg mp3 mp2 m3u mod amf dmf dsm far gdm imf it m15 med okt s3m stm sfx ult uni xm sid ac3 dts cue aif aiff wpl ape mac mpc mpp shn wv nsf spc gym adplug adx dsp adp ymf ast afc hps xs','video/*':'m4v 3gp nsv ts ty strm rm rmvb m3u ifo mov qt divx xvid bivx vob nrg img iso pva wmv asf asx ogm m2v avi bin dat dvr-ms mpg mpeg mp4 mkv avc vp3 svq3 nuv viv dv fli flv wpl'},chunkSize:0,chunkUploadRetry:0,chunkNetworkDownRetryTimeout:2000, // milliseconds, don't flood when network is down
   KB:_SIZE_CONST(1),MB:_SIZE_CONST(2),GB:_SIZE_CONST(3),TB:_SIZE_CONST(4),expando:'fileapi'+new Date().getTime(),uid:function uid(obj){return obj?obj[api.expando]=obj[api.expando]||api.uid():(++gid,api.expando+gid);},log:function log(){if(api.debug&&window.console&&console.log){if(console.log.apply){console.log.apply(console,arguments);}else {console.log([].join.call(arguments,' '));}}}, /**
          * Create new image
          *
          * @param {String} [src]
          * @param {Function} [fn]   1. error -- boolean, 2. img -- Image element
          * @returns {HTMLElement}
          */newImage:function newImage(src,fn){var img=document.createElement('img');if(fn){api.event.one(img,'error load',function(evt){fn(evt.type=='error',img);img=null;});}img.src=src;return img;}, /**
          * Get XHR
          * @returns {XMLHttpRequest}
          */getXHR:function getXHR(){var xhr;if(XMLHttpRequest){xhr=new XMLHttpRequest();}else if(window.ActiveXObject){try{xhr=new ActiveXObject('MSXML2.XMLHttp.3.0');}catch(e){xhr=new ActiveXObject('Microsoft.XMLHTTP');}}return xhr;},isArray:_isArray,support:{dnd:cors&&'ondrop' in document.createElement('div'),cors:cors,html5:html5,chunked:chunked,dataURI:true,accept:_supportInputAttr('accept'),multiple:_supportInputAttr('multiple')},event:{on:_on,off:_off,one:_one,fix:_fixEvent},throttle:function throttle(fn,delay){var id,args;return function _throttle(){args=arguments;if(!id){fn.apply(window,args);id=setTimeout(function(){id=0;fn.apply(window,args);},delay);}};},F:function F(){},parseJSON:function parseJSON(str){var json;if(window.JSON&&JSON.parse){json=JSON.parse(str);}else {json=new Function('return ('+str.replace(/([\r\n])/g,'\\$1')+');')();}return json;},trim:function trim(str){str=String(str);return str.trim?str.trim():str.replace(/^\s+|\s+$/g,'');}, /**
          * Simple Defer
          * @return  {Object}
          */defer:function defer(){var list=[],result,error,defer={resolve:function resolve(err,res){defer.resolve=noop;error=err||false;result=res;while(res=list.shift()){res(error,result);}},then:function then(fn){if(error!==undef){fn(error,result);}else {list.push(fn);}}};return defer;},queue:function queue(fn){var _idx=0,_length=0,_fail=false,_end=false,queue={inc:function inc(){_length++;},next:function next(){_idx++;setTimeout(queue.check,0);},check:function check(){_idx>=_length&&!_fail&&queue.end();},isFail:function isFail(){return _fail;},fail:function fail(){!_fail&&fn(_fail=true);},end:function end(){if(!_end){_end=true;fn();}}};return queue;}, /**
          * For each object
          *
          * @param {Object|Array}  obj
          * @param {Function}    fn
          * @param {*}       [ctx]
          */each:_each, /**
          * Async for
          * @param {Array} array
          * @param {Function} callback
          */afor:function afor(array,callback){var i=0,n=array.length;if(_isArray(array)&&n--){(function _next(){callback(n!=i&&_next,array[i],i++);})();}else {callback(false);}}, /**
          * Merge the contents of two or more objects together into the first object
          *
          * @param {Object}  dst
          * @return  {Object}
          */extend:_extend, /**
          * Is file instance
          *
          * @param  {File}  file
          * @return {Boolean}
          */isFile:function isFile(file){return html5&&file&&file instanceof File;}, /**
          * Is canvas element
          *
          * @param {HTMLElement} el
          * @return  {Boolean}
          */isCanvas:function isCanvas(el){return el&&_rcanvas.test(el.nodeName);},getFilesFilter:function getFilesFilter(filter){filter=typeof filter=='string'?filter:filter.getAttribute&&filter.getAttribute('accept')||'';return filter?new RegExp('('+filter.replace(/\./g,'\\.').replace(/,/g,'|')+')$','i'):/./;}, /**
          * Read as DataURL
          *
          * @param {File|Element} file
          * @param {Function} fn
          */readAsDataURL:function readAsDataURL(file,fn){if(api.isCanvas(file)){_emit(file,fn,'load',api.toDataURL(file));}else {_readAs(file,fn,'DataURL');}}, /**
          * Read as Binary string
          *
          * @param {File} file
          * @param {Function} fn
          */readAsBinaryString:function readAsBinaryString(file,fn){if(_hasSupportReadAs('BinaryString')){_readAs(file,fn,'BinaryString');}else { // Hello IE10!
   _readAs(file,function(evt){if(evt.type=='load'){try{ // dataURL -> binaryString
   evt.result=api.toBinaryString(evt.result);}catch(e){evt.type='error';evt.message=e.toString();}}fn(evt);},'DataURL');}}, /**
          * Read as ArrayBuffer
          *
          * @param {File} file
          * @param {Function} fn
          */readAsArrayBuffer:function readAsArrayBuffer(file,fn){_readAs(file,fn,'ArrayBuffer');}, /**
          * Read as text
          *
          * @param {File} file
          * @param {String} encoding
          * @param {Function} [fn]
          */readAsText:function readAsText(file,encoding,fn){if(!fn){fn=encoding;encoding='utf-8';}_readAs(file,fn,'Text',encoding);}, /**
          * Convert image or canvas to DataURL
          *
          * @param   {Element}  el      Image or Canvas element
          * @param   {String}   [type]  mime-type
          * @return  {String}
          */toDataURL:function toDataURL(el,type){if(typeof el=='string'){return el;}else if(el.toDataURL){return el.toDataURL(type||'image/png');}}, /**
          * Canvert string, image or canvas to binary string
          *
          * @param   {String|Element} val
          * @return  {String}
          */toBinaryString:function toBinaryString(val){return window.atob(api.toDataURL(val).replace(_rdata,''));}, /**
          * Read file or DataURL as ImageElement
          *
          * @param {File|String} file
          * @param {Function}    fn
          * @param {Boolean}   [progress]
          */readAsImage:function readAsImage(file,fn,progress){if(api.isFile(file)){if(apiURL){ /** @namespace apiURL.createObjectURL */var data=apiURL.createObjectURL(file);if(data===undef){_emit(file,fn,'error');}else {api.readAsImage(data,fn,progress);}}else {api.readAsDataURL(file,function(evt){if(evt.type=='load'){api.readAsImage(evt.result,fn,progress);}else if(progress||evt.type=='error'){_emit(file,fn,evt,null,{loaded:evt.loaded,total:evt.total});}});}}else if(api.isCanvas(file)){_emit(file,fn,'load',file);}else if(_rimg.test(file.nodeName)){if(file.complete){_emit(file,fn,'load',file);}else {var events='error abort load';_one(file,events,function _fn(evt){if(evt.type=='load'&&apiURL){ /** @namespace apiURL.revokeObjectURL */apiURL.revokeObjectURL(file.src);}_off(file,events,_fn);_emit(file,fn,evt,file);});}}else if(file.iframe){_emit(file,fn,{type:'error'});}else { // Created image
   var img=api.newImage(file.dataURL||file);api.readAsImage(img,fn,progress);}}, /**
          * Make file by name
          *
          * @param {String}  name
          * @return  {Array}
          */checkFileObj:function checkFileObj(name){var file={},accept=api.accept;if((typeof name==='undefined'?'undefined':babelHelpers.typeof(name))=='object'){file=name;}else {file.name=(name+'').split(/\\|\//g).pop();}if(file.type==null){file.type=file.name.split('.').pop();}_each(accept,function(ext,type){ext=new RegExp(ext.replace(/\s/g,'|'),'i');if(ext.test(file.type)||api.ext2mime[file.type]){file.type=api.ext2mime[file.type]||type.split('/')[0]+'/'+file.type;}});return file;}, /**
          * Get drop files
          *
          * @param {Event} evt
          * @param {Function} callback
          */getDropFiles:function getDropFiles(evt,callback){var files=[],dataTransfer=_getDataTransfer(evt),entrySupport=_isArray(dataTransfer.items)&&dataTransfer.items[0]&&_getAsEntry(dataTransfer.items[0]),queue=api.queue(function(){callback(files);});_each((entrySupport?dataTransfer.items:dataTransfer.files)||[],function(item){queue.inc();try{if(entrySupport){_readEntryAsFiles(item,function(err,entryFiles){if(err){api.log('[err] getDropFiles:',err);}else {files.push.apply(files,entryFiles);}queue.next();});}else {_isRegularFile(item,function(yes){yes&&files.push(item);queue.next();});}}catch(err){queue.next();api.log('[err] getDropFiles: ',err);}});queue.check();}, /**
          * Get file list
          *
          * @param {HTMLInputElement|Event}  input
          * @param {String|Function} [filter]
          * @param {Function}      [callback]
          * @return  {Array|Null}
          */getFiles:function getFiles(input,filter,callback){var files=[];if(callback){api.filterFiles(api.getFiles(input),filter,callback);return null;}if(input.jquery){ // jQuery object
   input.each(function(){files=files.concat(api.getFiles(this));});input=files;files=[];}if(typeof filter=='string'){filter=api.getFilesFilter(filter);}if(input.originalEvent){ // jQuery event
   input=_fixEvent(input.originalEvent);}else if(input.srcElement){ // IE Event
   input=_fixEvent(input);}if(input.dataTransfer){ // Drag'n'Drop
   input=input.dataTransfer;}else if(input.target){ // Event
   input=input.target;}if(input.files){ // Input[type="file"]
   files=input.files;if(!html5){ // Partial support for file api
   files[0].blob=input;files[0].iframe=true;}}else if(!html5&&isInputFile(input)){if(api.trim(input.value)){files=[api.checkFileObj(input.value)];files[0].blob=input;files[0].iframe=true;}}else if(_isArray(input)){files=input;}return api.filter(files,function(file){return !filter||filter.test(file.name);});}, /**
          * Get total file size
          * @param {Array} files
          * @return  {Number}
          */getTotalSize:function getTotalSize(files){var size=0,i=files&&files.length;while(i--){size+=files[i].size;}return size;}, /**
          * Get image information
          *
          * @param {File}    file
          * @param {Function}  fn
          */getInfo:function getInfo(file,fn){var info={},readers=_infoReader.concat();if(api.isFile(file)){(function _next(){var reader=readers.shift();if(reader){if(reader.test(file.type)){reader(file,function(err,res){if(err){fn(err);}else {_extend(info,res);_next();}});}else {_next();}}else {fn(false,info);}})();}else {fn('not_support_info',info);}}, /**
          * Add information reader
          *
          * @param {RegExp} mime
          * @param {Function} fn
          */addInfoReader:function addInfoReader(mime,fn){fn.test=function(type){return mime.test(type);};_infoReader.push(fn);}, /**
          * Filter of array
          *
          * @param {Array}   input
          * @param {Function}  fn
          * @return  {Array}
          */filter:function filter(input,fn){var result=[],i=0,n=input.length,val;for(;i<n;i++){if(i in input){val=input[i];if(fn.call(val,val,i,input)){result.push(val);}}}return result;}, /**
          * Filter files
          *
          * @param {Array}   files
          * @param {Function}  eachFn
          * @param {Function}  resultFn
          */filterFiles:function filterFiles(files,eachFn,resultFn){if(files.length){ // HTML5 or Flash
   var queue=files.concat(),file,result=[],deleted=[];(function _next(){if(queue.length){file=queue.shift();api.getInfo(file,function(err,info){(eachFn(file,err?false:info)?result:deleted).push(file);_next();});}else {resultFn(result,deleted);}})();}else {resultFn([],files);}},upload:function upload(options){options=_extend({prepare:api.F,beforeupload:api.F,upload:api.F,fileupload:api.F,fileprogress:api.F,filecomplete:api.F,progress:api.F,complete:api.F,pause:api.F,imageOriginal:true,chunkSize:api.chunkSize,chunkUpoloadRetry:api.chunkUploadRetry},options);if(options.imageAutoOrientation&&!options.imageTransform){options.imageTransform={rotate:'auto'};}var proxyXHR=new api.XHR(options),dataArray=this._getFilesDataArray(options.files),_this=this,_total=0,_loaded=0,_nextFile2,_complete=false; // calc total size
   _each(dataArray,function(data){_total+=data.size;}); // Array of files
   proxyXHR.files=[];_each(dataArray,function(data){proxyXHR.files.push(data.file);}); // Set upload status props
   proxyXHR.total=_total;proxyXHR.loaded=0;proxyXHR.filesLeft=dataArray.length; // emit "beforeupload"  event
   options.beforeupload(proxyXHR,options); // Upload by file
   _nextFile2=function _nextFile(){var data=dataArray.shift(),_file=data&&data.file,_fileLoaded=false,_fileOptions=_simpleClone(options);proxyXHR.filesLeft=dataArray.length;if(_file&&_file.name===api.expando){_file=null;api.log('[warn] FileAPI.upload() — called without files');}if((proxyXHR.statusText!='abort'||proxyXHR.current)&&data){ // Mark active job
   _complete=false; // Set current upload file
   proxyXHR.currentFile=_file; // Prepare file options
   _file&&options.prepare(_file,_fileOptions);_this._getFormData(_fileOptions,data,function(form){if(!_loaded){ // emit "upload" event
   options.upload(proxyXHR,options);}var xhr=new api.XHR(_extend({},_fileOptions,{upload:_file?function(){ // emit "fileupload" event
   options.fileupload(_file,xhr,_fileOptions);}:noop,progress:_file?function(evt){if(!_fileLoaded){ // emit "fileprogress" event
   options.fileprogress({type:'progress',total:data.total=evt.total,loaded:data.loaded=evt.loaded},_file,xhr,_fileOptions); // emit "progress" event
   options.progress({type:'progress',total:_total,loaded:proxyXHR.loaded=_loaded+data.size*(evt.loaded/evt.total)|0},_file,xhr,_fileOptions);}}:noop,complete:function complete(err){ // fixed throttle event
   _fileLoaded=true;_each(_xhrPropsExport,function(name){proxyXHR[name]=xhr[name];});if(_file){data.loaded=data.total; // emulate 100% "progress"
   this.progress(data); // bytes loaded
   _loaded+=data.size; // data.size != data.total, it's desirable fix this
   proxyXHR.loaded=_loaded; // emit "filecomplete" event
   options.filecomplete(err,xhr,_file,_fileOptions);} // upload next file
   _nextFile2.call(_this);}})); // xhr
   // ...
   proxyXHR.abort=function(current){if(!current){dataArray.length=0;}this.current=current;xhr.abort();}; // Start upload
   xhr.send(form);});}else {options.complete(proxyXHR.status==200||proxyXHR.status==201?false:proxyXHR.statusText||'error',proxyXHR,options); // Mark done state
   _complete=true;}}; // Next tick
   setTimeout(_nextFile2,0); // Append more files to the existing request
   // first - add them to the queue head/tail
   proxyXHR.append=function(files,first){files=api._getFilesDataArray([].concat(files));_each(files,function(data){_total+=data.size;proxyXHR.files.push(data.file);if(first){dataArray.unshift(data);}else {dataArray.push(data);}});proxyXHR.statusText="";if(_complete){_nextFile2.call(_this);}}; // Removes file from queue by file reference and returns it
   proxyXHR.remove=function(file){var i=dataArray.length,_file;while(i--){if(dataArray[i].file==file){_file=dataArray.splice(i,1);_total-=_file.size;}}return _file;};return proxyXHR;},_getFilesDataArray:function _getFilesDataArray(data){var files=[],oFiles={};if(isInputFile(data)){var tmp=api.getFiles(data);oFiles[data.name||'file']=data.getAttribute('multiple')!==null?tmp:tmp[0];}else if(_isArray(data)&&isInputFile(data[0])){_each(data,function(input){oFiles[input.name||'file']=api.getFiles(input);});}else {oFiles=data;}_each(oFiles,function add(file,name){if(_isArray(file)){_each(file,function(file){add(file,name);});}else if(file&&(file.name||file.image)){files.push({name:name,file:file,size:file.size,total:file.size,loaded:0});}});if(!files.length){ // Create fake `file` object
   files.push({file:{name:api.expando}});}return files;},_getFormData:function _getFormData(options,data,fn){var file=data.file,name=data.name,filename=file.name,filetype=file.type,trans=api.support.transform&&options.imageTransform,Form=new api.Form(),queue=api.queue(function(){fn(Form);}),isOrignTrans=trans&&_isOriginTransform(trans),postNameConcat=api.postNameConcat;(function _addFile(file /**Object*/){if(file.image){ // This is a FileAPI.Image
   queue.inc();file.toData(function(err,image){ // @todo: error
   filename=filename||new Date().getTime()+'.png';_addFile(image);queue.next();});}else if(api.Image&&trans&&(/^image/.test(file.type)||_rimgcanvas.test(file.nodeName))){queue.inc();if(isOrignTrans){ // Convert to array for transform function
   trans=[trans];}api.Image.transform(file,trans,options.imageAutoOrientation,function(err,images){if(isOrignTrans&&!err){if(!dataURLtoBlob&&!api.flashEngine){ // Canvas.toBlob or Flash not supported, use multipart
   Form.multipart=true;}Form.append(name,images[0],filename,trans[0].type||filetype);}else {var addOrigin=0;if(!err){_each(images,function(image,idx){if(!dataURLtoBlob&&!api.flashEngine){Form.multipart=true;}if(!trans[idx].postName){addOrigin=1;}Form.append(trans[idx].postName||postNameConcat(name,idx),image,filename,trans[idx].type||filetype);});}if(err||options.imageOriginal){Form.append(postNameConcat(name,addOrigin?'original':null),file,filename,filetype);}}queue.next();});}else if(filename!==api.expando){Form.append(name,file,filename);}})(file); // Append data
   _each(options.data,function add(val,name){if((typeof val==='undefined'?'undefined':babelHelpers.typeof(val))=='object'){_each(val,function(v,i){add(v,postNameConcat(name,i));});}else {Form.append(name,val);}});queue.check();},reset:function reset(inp,notRemove){var parent,clone;if(jQuery){clone=jQuery(inp).clone(true).insertBefore(inp).val('')[0];if(!notRemove){jQuery(inp).remove();}}else {parent=inp.parentNode;clone=parent.insertBefore(inp.cloneNode(true),inp);clone.value='';if(!notRemove){parent.removeChild(inp);}_each(_elEvents[api.uid(inp)],function(fns,type){_each(fns,function(fn){_off(inp,type,fn);_on(clone,type,fn);});});}return clone;}, /**
          * Load remote file
          *
          * @param   {String}    url
          * @param   {Function}  fn
          * @return  {XMLHttpRequest}
          */load:function load(url,fn){var xhr=api.getXHR();if(xhr){xhr.open('GET',url,true);if(xhr.overrideMimeType){xhr.overrideMimeType('text/plain; charset=x-user-defined');}_on(xhr,'progress',function( /**Event*/evt){ /** @namespace evt.lengthComputable */if(evt.lengthComputable){fn({type:evt.type,loaded:evt.loaded,total:evt.total},xhr);}});xhr.onreadystatechange=function(){if(xhr.readyState==4){xhr.onreadystatechange=null;if(xhr.status==200){url=url.split('/'); /** @namespace xhr.responseBody */var file={name:url[url.length-1],size:xhr.getResponseHeader('Content-Length'),type:xhr.getResponseHeader('Content-Type')};file.dataURL='data:'+file.type+';base64,'+api.encode64(xhr.responseBody||xhr.responseText);fn({type:'load',result:file},xhr);}else {fn({type:'error'},xhr);}}};xhr.send(null);}else {fn({type:'error'});}return xhr;},encode64:function encode64(str){var b64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',outStr='',i=0;if(typeof str!=='string'){str=String(str);}while(i<str.length){ //all three "& 0xff" added below are there to fix a known bug
   //with bytes returned by xhr.responseText
   var byte1=str.charCodeAt(i++)&0xff,byte2=str.charCodeAt(i++)&0xff,byte3=str.charCodeAt(i++)&0xff,enc1=byte1>>2,enc2=(byte1&3)<<4|byte2>>4,enc3,enc4;if(isNaN(byte2)){enc3=enc4=64;}else {enc3=(byte2&15)<<2|byte3>>6;enc4=isNaN(byte3)?64:byte3&63;}outStr+=b64.charAt(enc1)+b64.charAt(enc2)+b64.charAt(enc3)+b64.charAt(enc4);}return outStr;}} // api
   ;function _emit(target,fn,name,res,ext){var evt={type:name.type||name,target:target,result:res};_extend(evt,ext);fn(evt);}function _hasSupportReadAs(as){return FileReader&&!!FileReader.prototype['readAs'+as];}function _readAs(file,fn,as,encoding){if(api.isFile(file)&&_hasSupportReadAs(as)){var Reader=new FileReader(); // Add event listener
   _on(Reader,_readerEvents,function _fn(evt){var type=evt.type;if(type=='progress'){_emit(file,fn,evt,evt.target.result,{loaded:evt.loaded,total:evt.total});}else if(type=='loadend'){_off(Reader,_readerEvents,_fn);Reader=null;}else {_emit(file,fn,evt,evt.target.result);}});try{ // ReadAs ...
   if(encoding){Reader['readAs'+as](file,encoding);}else {Reader['readAs'+as](file);}}catch(err){_emit(file,fn,'error',undef,{error:err.toString()});}}else {_emit(file,fn,'error',undef,{error:'filreader_not_support_'+as});}}function _isRegularFile(file,callback){ // http://stackoverflow.com/questions/8856628/detecting-folders-directories-in-javascript-filelist-objects
   if(!file.type&&file.size%4096===0&&file.size<=102400){if(FileReader){try{var Reader=new FileReader();_one(Reader,_readerEvents,function(evt){var isFile=evt.type!='error';callback(isFile);if(isFile){Reader.abort();}});Reader.readAsDataURL(file);}catch(err){callback(false);}}else {callback(null);}}else {callback(true);}}function _getAsEntry(item){var entry;if(item.getAsEntry){entry=item.getAsEntry();}else if(item.webkitGetAsEntry){entry=item.webkitGetAsEntry();}return entry;}function _readEntryAsFiles(entry,callback){if(!entry){ // error
   callback('invalid entry');}else if(entry.isFile){ // Read as file
   entry.file(function(file){ // success
   file.fullPath=entry.fullPath;callback(false,[file]);},function(err){ // error
   callback('FileError.code: '+err.code);});}else if(entry.isDirectory){var reader=entry.createReader(),result=[];reader.readEntries(function(entries){ // success
   api.afor(entries,function(next,entry){_readEntryAsFiles(entry,function(err,files){if(err){api.log(err);}else {result=result.concat(files);}if(next){next();}else {callback(false,result);}});});},function(err){ // error
   callback('directory_reader: '+err);});}else {_readEntryAsFiles(_getAsEntry(entry),callback);}}function _simpleClone(obj){var copy={};_each(obj,function(val,key){if(val&&(typeof val==='undefined'?'undefined':babelHelpers.typeof(val))==='object'&&val.nodeType===void 0){val=_extend({},val);}copy[key]=val;});return copy;}function isInputFile(el){return _rinput.test(el&&el.tagName);}function _getDataTransfer(evt){return (evt.originalEvent||evt||'').dataTransfer||{};}function _isOriginTransform(trans){var key;for(key in trans){if(trans.hasOwnProperty(key)){if(!(trans[key] instanceof Object||key==='overlay'||key==='filter')){return true;}}}return false;} // Add default image info reader
   api.addInfoReader(/^image/,function(file /**File*/,callback /**Function*/){if(!file.__dimensions){var defer=file.__dimensions=api.defer();api.readAsImage(file,function(evt){var img=evt.target;defer.resolve(evt.type=='load'?false:'error',{width:img.width,height:img.height});img=null;});}file.__dimensions.then(callback);}); /**
      * Drag'n'Drop special event
      *
      * @param {HTMLElement} el
      * @param {Function}    onHover
      * @param {Function}    onDrop
      */api.event.dnd=function(el,onHover,onDrop){var _id,_type;if(!onDrop){onDrop=onHover;onHover=api.F;}if(FileReader){_on(el,'dragenter dragleave dragover',function(evt){var types=_getDataTransfer(evt).types,i=types&&types.length,debounceTrigger=false;while(i--){if(~types[i].indexOf('File')){evt[preventDefault]();if(_type!==evt.type){_type=evt.type; // Store current type of event
   if(_type!='dragleave'){onHover.call(evt[currentTarget],true,evt);}debounceTrigger=true;}break; // exit from "while"
   }}if(debounceTrigger){clearTimeout(_id);_id=setTimeout(function(){onHover.call(evt[currentTarget],_type!='dragleave',evt);},50);}});_on(el,'drop',function(evt){evt[preventDefault]();_type=0;onHover.call(evt[currentTarget],false,evt);api.getDropFiles(evt,function(files){onDrop.call(evt[currentTarget],files,evt);});});}else {api.log("Drag'n'Drop -- not supported");}}; /**
      * Remove drag'n'drop
      * @param {HTMLElement} el
      * @param {Function}    onHover
      * @param {Function}    onDrop
      */api.event.dnd.off=function(el,onHover,onDrop){_off(el,'dragenter dragleave dragover',onHover);_off(el,'drop',onDrop);}; // Support jQuery
   if(jQuery&&!jQuery.fn.dnd){jQuery.fn.dnd=function(onHover,onDrop){return this.each(function(){api.event.dnd(this,onHover,onDrop);});};jQuery.fn.offdnd=function(onHover,onDrop){return this.each(function(){api.event.dnd.off(this,onHover,onDrop);});};} // @export
   window.FileAPI=_extend(api,window.FileAPI); // Debug info
   api.log('FileAPI: '+api.version);api.log('protocol: '+window.location.protocol);api.log('doctype: ['+doctype.name+'] '+doctype.publicId+' '+doctype.systemId); // @detect 'x-ua-compatible'
   _each(document.getElementsByTagName('meta'),function(meta){if(/x-ua-compatible/i.test(meta.getAttribute('http-equiv'))){api.log('meta.http-equiv: '+meta.getAttribute('content'));}}); // @configuration
   if(!api.flashUrl){api.flashUrl=api.staticPath+'FileAPI.flash.swf';}if(!api.flashImageUrl){api.flashImageUrl=api.staticPath+'FileAPI.flash.image.swf';}if(!api.flashWebcamUrl){api.flashWebcamUrl=api.staticPath+'FileAPI.flash.camera.swf';}})(window,void 0); /*global window, FileAPI, document */(function(api,document,undef){'use strict';var min=Math.min,round=Math.round,getCanvas=function getCanvas(){return document.createElement('canvas');},support=false,exifOrientation={8:270,3:180,6:90};try{support=getCanvas().toDataURL('image/png').indexOf('data:image/png')>-1;}catch(e){}function Image(file){if(file instanceof Image){var img=new Image(file.file);api.extend(img.matrix,file.matrix);return img;}else if(!(this instanceof Image)){return new Image(file);}this.file=file;this.matrix={sx:0,sy:0,sw:0,sh:0,dx:0,dy:0,dw:0,dh:0,resize:0, // min, max OR preview
   deg:0,quality:1, // jpeg quality
   filter:0};}Image.prototype={image:true,constructor:Image,set:function set(attrs){api.extend(this.matrix,attrs);return this;},crop:function crop(x,y,w,h){if(w===undef){w=x;h=y;x=y=0;}return this.set({sx:x,sy:y,sw:w,sh:h||w});},resize:function resize(w,h,type){if(typeof h=='string'){type=h;h=w;}return this.set({dw:w,dh:h,resize:type});},preview:function preview(w,h){return this.resize(w,h||w,'preview');},rotate:function rotate(deg){return this.set({deg:deg});},filter:function filter(_filter){return this.set({filter:_filter});},overlay:function overlay(images){return this.set({overlay:images});},clone:function clone(){return new Image(this);},_load:function _load(image,fn){var self=this;if(/img|video/i.test(image.nodeName)){fn.call(self,null,image);}else {api.readAsImage(image,function(evt){fn.call(self,evt.type!='load',evt.result);});}},_apply:function _apply(image,fn){var canvas=getCanvas(),m=this.getMatrix(image),ctx=canvas.getContext('2d'),width=image.videoWidth||image.width,height=image.videoHeight||image.height,deg=m.deg,dw=m.dw,dh=m.dh,w=width,h=height,filter=m.filter,copy // canvas copy
   ,buffer=image,overlay=m.overlay,queue=api.queue(function(){fn(false,canvas);}),renderImageToCanvas=api.renderImageToCanvas; // For `renderImageToCanvas`
   image._type=this.file.type;while(min(w/dw,h/dh)>2){w=w/2+0.5|0;h=h/2+0.5|0;copy=getCanvas();copy.width=w;copy.height=h;if(buffer!==image){renderImageToCanvas(copy,buffer,0,0,buffer.width,buffer.height,0,0,w,h);buffer=copy;}else {buffer=copy;renderImageToCanvas(buffer,image,m.sx,m.sy,m.sw,m.sh,0,0,w,h);m.sx=m.sy=m.sw=m.sh=0;}}canvas.width=deg%180?dh:dw;canvas.height=deg%180?dw:dh;canvas.type=m.type;canvas.quality=m.quality;ctx.rotate(deg*Math.PI/180);renderImageToCanvas(canvas,buffer,m.sx,m.sy,m.sw||buffer.width,m.sh||buffer.height,deg==180||deg==270?-dw:0,deg==90||deg==180?-dh:0,dw,dh);dw=canvas.width;dh=canvas.height; // Apply overlay
   overlay&&api.each([].concat(overlay),function(over){queue.inc(); // preload
   var img=new window.Image(),fn=function fn(){var x=over.x|0,y=over.y|0,w=over.w||img.width,h=over.h||img.height,rel=over.rel; // center  |  right  |  left
   x=rel==1||rel==4||rel==7?(dw-w+x)/2:rel==2||rel==5||rel==8?dw-(w+x):x; // center  |  bottom  |  top
   y=rel==3||rel==4||rel==5?(dh-h+y)/2:rel>=6?dh-(h+y):y;api.event.off(img,'error load abort',fn);try{ctx.globalAlpha=over.opacity||1;ctx.drawImage(img,x,y,w,h);}catch(er){}queue.next();};api.event.on(img,'error load abort',fn);img.src=over.src;if(img.complete){fn();}});if(filter){queue.inc();Image.applyFilter(canvas,filter,queue.next);}queue.check();},getMatrix:function getMatrix(image){var m=api.extend({},this.matrix),sw=m.sw=m.sw||image.videoWidth||image.naturalWidth||image.width,sh=m.sh=m.sh||image.videoHeight||image.naturalHeight||image.height,dw=m.dw=m.dw||sw,dh=m.dh=m.dh||sh,sf=sw/sh,df=dw/dh,type=m.resize;if(type=='preview'){if(dw!=sw||dh!=sh){ // Make preview
   var w,h;if(df>=sf){w=sw;h=w/df;}else {h=sh;w=h*df;}if(w!=sw||h!=sh){m.sx=~ ~((sw-w)/2);m.sy=~ ~((sh-h)/2);sw=w;sh=h;}}}else if(type){if(!(sw>dw||sh>dh)){dw=sw;dh=sh;}else if(type=='min'){dw=round(sf<df?min(sw,dw):dh*sf);dh=round(sf<df?dw/sf:min(sh,dh));}else {dw=round(sf>=df?min(sw,dw):dh*sf);dh=round(sf>=df?dw/sf:min(sh,dh));}}m.sw=sw;m.sh=sh;m.dw=dw;m.dh=dh;return m;},_trans:function _trans(fn){this._load(this.file,function(err,image){if(err){fn(err);}else {this._apply(image,fn);}});},get:function get(fn){if(api.support.transform){var _this=this,matrix=_this.matrix;if(matrix.deg=='auto'){api.getInfo(_this.file,function(err,info){ // rotate by exif orientation
   matrix.deg=exifOrientation[info&&info.exif&&info.exif.Orientation]||0;_this._trans(fn);});}else {_this._trans(fn);}}else {fn('not_support_transform');}},toData:function toData(fn){this.get(fn);}};Image.exifOrientation=exifOrientation;Image.transform=function(file,transform,autoOrientation,fn){function _transform(err,img){ // img -- info object
   var images={},queue=api.queue(function(err){fn(err,images);});if(!err){api.each(transform,function(params,name){if(!queue.isFail()){var ImgTrans=new Image(img.nodeType?img:file);if(typeof params=='function'){params(img,ImgTrans);}else if(params.width){ImgTrans[params.preview?'preview':'resize'](params.width,params.height,params.type);}else {if(params.maxWidth&&(img.width>params.maxWidth||img.height>params.maxHeight)){ImgTrans.resize(params.maxWidth,params.maxHeight,'max');}}if(params.crop){var crop=params.crop;ImgTrans.crop(crop.x|0,crop.y|0,crop.w||crop.width,crop.h||crop.height);}if(params.rotate===undef&&autoOrientation){params.rotate='auto';}ImgTrans.set({deg:params.rotate,type:params.type||file.type||'image/png',quality:params.quality||1,overlay:params.overlay,filter:params.filter});queue.inc();ImgTrans.toData(function(err,image){if(err){queue.fail();}else {images[name]=image;queue.next();}});}});}else {queue.fail();}} // @todo: Оло-ло, нужно рефакторить это место
   if(file.width){_transform(false,file);}else {api.getInfo(file,_transform);}}; // @const
   api.each(['TOP','CENTER','BOTTOM'],function(x,i){api.each(['LEFT','CENTER','RIGHT'],function(y,j){Image[x+'_'+y]=i*3+j;Image[y+'_'+x]=i*3+j;});}); /**
      * Trabsform element to canvas
      *
      * @param    {Image|HTMLVideoElement}   el
      * @returns  {Canvas}
      */Image.toCanvas=function(el){var canvas=document.createElement('canvas');canvas.width=el.videoWidth||el.width;canvas.height=el.videoHeight||el.height;canvas.getContext('2d').drawImage(el,0,0);return canvas;}; /**
      * Create image from DataURL
      * @param  {String}  dataURL
      * @param  {Object}  size
      * @param  {Function}  callback
      */Image.fromDataURL=function(dataURL,size,callback){var img=api.newImage(dataURL);api.extend(img,size);callback(img);}; /**
      * Apply filter (caman.js)
      *
      * @param  {Canvas|Image}   canvas
      * @param  {String|Function}  filter
      * @param  {Function}  doneFn
      */Image.applyFilter=function(canvas,filter,doneFn){if(typeof filter=='function'){filter(canvas,doneFn);}else if(window.Caman){ // http://camanjs.com/guides/
   window.Caman(canvas.tagName=='IMG'?Image.toCanvas(canvas):canvas,function(){if(typeof filter=='string'){this[filter]();}else {api.each(filter,function(val,method){this[method](val);},this);}this.render(doneFn);});}}; /**
      * For load-image-ios.js
      */api.renderImageToCanvas=function(canvas,img,sx,sy,sw,sh,dx,dy,dw,dh){canvas.getContext('2d').drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);return canvas;}; // @export
   api.support.canvas=api.support.transform=support;api.Image=Image;})(FileAPI,document); /*global window, FileAPI */(function(api,window){"use strict";var document=window.document,FormData=window.FormData,Form=function Form(){this.items=[];},encodeURIComponent=window.encodeURIComponent;Form.prototype={append:function append(name,blob,file,type){this.items.push({name:name,blob:blob&&blob.blob||(blob==void 0?'':blob),file:blob&&(file||blob.name),type:blob&&(type||blob.type)});},each:function each(fn){var i=0,n=this.items.length;for(;i<n;i++){fn.call(this,this.items[i]);}},toData:function toData(fn,options){ // allow chunked transfer if we have only one file to send
   // flag is used below and in XHR._send
   options._chunked=api.support.chunked&&options.chunkSize>0&&api.filter(this.items,function(item){return item.file;}).length==1;if(!api.support.html5){api.log('FileAPI.Form.toHtmlData');this.toHtmlData(fn);}else if(!api.formData||this.multipart||!FormData){api.log('FileAPI.Form.toMultipartData');this.toMultipartData(fn);}else if(options._chunked){api.log('FileAPI.Form.toPlainData');this.toPlainData(fn);}else {api.log('FileAPI.Form.toFormData');this.toFormData(fn);}},_to:function _to(data,complete,next,arg){var queue=api.queue(function(){complete(data);});this.each(function(file){next(file,data,queue,arg);});queue.check();},toHtmlData:function toHtmlData(fn){this._to(document.createDocumentFragment(),fn,function(file,data /**DocumentFragment*/){var blob=file.blob,hidden;if(file.file){api.reset(blob,true); // set new name
   blob.name=file.name;data.appendChild(blob);}else {hidden=document.createElement('input');hidden.name=file.name;hidden.type='hidden';hidden.value=blob;data.appendChild(hidden);}});},toPlainData:function toPlainData(fn){this._to({},fn,function(file,data,queue){if(file.file){data.type=file.file;}if(file.blob.toBlob){ // canvas
   queue.inc();_convertFile(file,function(file,blob){data.name=file.name;data.file=blob;data.size=blob.length;data.type=file.type;queue.next();});}else if(file.file){ // file
   data.name=file.blob.name;data.file=file.blob;data.size=file.blob.size;data.type=file.type;}else { // additional data
   if(!data.params){data.params=[];}data.params.push(encodeURIComponent(file.name)+"="+encodeURIComponent(file.blob));}data.start=-1;data.end=data.file&&data.file.FileAPIReadPosition||-1;data.retry=0;});},toFormData:function toFormData(fn){this._to(new FormData(),fn,function(file,data,queue){if(file.blob&&file.blob.toBlob){queue.inc();_convertFile(file,function(file,blob){data.append(file.name,blob,file.file);queue.next();});}else if(file.file){data.append(file.name,file.blob,file.file);}else {data.append(file.name,file.blob);}if(file.file){data.append('_'+file.name,file.file);}});},toMultipartData:function toMultipartData(fn){this._to([],fn,function(file,data,queue,boundary){queue.inc();_convertFile(file,function(file,blob){data.push('--_'+boundary+('\r\nContent-Disposition: form-data; name="'+file.name+'"'+(file.file?'; filename="'+encodeURIComponent(file.file)+'"':'')+(file.file?'\r\nContent-Type: '+(file.type||'application/octet-stream'):'')+'\r\n'+'\r\n'+(file.file?blob:encodeURIComponent(blob))+'\r\n'));queue.next();},true);},api.expando);}};function _convertFile(file,fn,useBinaryString){var blob=file.blob,filename=file.file;if(filename){if(!blob.toDataURL){ // The Blob is not an image.
   api.readAsBinaryString(blob,function(evt){if(evt.type=='load'){fn(file,evt.result);}});return;}var mime={'image/jpeg':'.jpe?g','image/png':'.png'},type=mime[file.type]?file.type:'image/png',ext=mime[type]||'.png',quality=blob.quality||1;if(!filename.match(new RegExp(ext+'$','i'))){ // Does not change the current extension, but add a new one.
   filename+=ext.replace('?','');}file.file=filename;file.type=type;if(!useBinaryString&&blob.toBlob){blob.toBlob(function(blob){fn(file,blob);},type,quality);}else {fn(file,api.toBinaryString(blob.toDataURL(type,quality)));}}else {fn(file,blob);}} // @export
   api.Form=Form;})(FileAPI,window); /*global window, FileAPI, Uint8Array */(function(window,api){"use strict";var noop=function noop(){},document=window.document,XHR=function XHR(options){this.uid=api.uid();this.xhr={abort:noop,getResponseHeader:noop,getAllResponseHeaders:noop};this.options=options;},_xhrResponsePostfix={'':1,XML:1,Text:1,Body:1};XHR.prototype={status:0,statusText:'',constructor:XHR,getResponseHeader:function getResponseHeader(name){return this.xhr.getResponseHeader(name);},getAllResponseHeaders:function getAllResponseHeaders(){return this.xhr.getAllResponseHeaders()||{};},end:function end(status,statusText){var _this=this,options=_this.options;_this.end=_this.abort=noop;_this.status=status;if(statusText){_this.statusText=statusText;}api.log('xhr.end:',status,statusText);options.complete(status==200||status==201?false:_this.statusText||'unknown',_this);if(_this.xhr&&_this.xhr.node){setTimeout(function(){var node=_this.xhr.node;try{node.parentNode.removeChild(node);}catch(e){}try{delete window[_this.uid];}catch(e){}window[_this.uid]=_this.xhr.node=null;},9);}},abort:function abort(){this.end(0,'abort');if(this.xhr){this.xhr.aborted=true;this.xhr.abort();}},send:function send(FormData){var _this=this,options=this.options;FormData.toData(function(data){ // Start uploading
   options.upload(options,_this);_this._send.call(_this,options,data);},options);},_send:function _send(options,data){var _this=this,xhr,uid=_this.uid,url=options.url;api.log('XHR._send:',data);if(!options.cache){ // No cache
   url+=(~url.indexOf('?')?'&':'?')+api.uid();}if(data.nodeName){ // legacy
   options.upload(options,_this);xhr=document.createElement('div');xhr.innerHTML='<form target="'+uid+'" action="'+url+'" method="POST" enctype="multipart/form-data" style="position: absolute; top: -1000px; overflow: hidden; width: 1px; height: 1px;">'+'<iframe name="'+uid+'" src="javascript:false;"></iframe>'+'<input value="'+uid+'" name="callback" type="hidden"/>'+'</form>';_this.xhr.abort=function(){var transport=xhr.getElementsByTagName('iframe')[0];if(transport){try{if(transport.stop){transport.stop();}else if(transport.contentWindow.stop){transport.contentWindow.stop();}else {transport.contentWindow.document.execCommand('Stop');}}catch(er){}}xhr=null;}; // append form-data
   var form=xhr.getElementsByTagName('form')[0];form.appendChild(data);api.log(form.parentNode.innerHTML); // append to DOM
   document.body.appendChild(xhr); // keep a reference to node-transport
   _this.xhr.node=xhr; // jsonp-callack
   window[uid]=function(status,statusText,response){_this.readyState=4;_this.responseText=response;_this.end(status,statusText);xhr=null;}; // send
   _this.readyState=2; // loaded
   form.submit();form=null;}else { // html5
   if(this.xhr&&this.xhr.aborted){api.log("Error: already aborted");return;}xhr=_this.xhr=api.getXHR();if(data.params){url+=(url.indexOf('?')<0?"?":"&")+data.params.join("&");}xhr.open('POST',url,true);if(api.withCredentials){xhr.withCredentials="true";}if(!options.headers||!options.headers['X-Requested-With']){xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');}api.each(options.headers,function(val,key){xhr.setRequestHeader(key,val);});if(options._chunked){ // chunked upload
   if(xhr.upload){xhr.upload.addEventListener('progress',function( /**Event*/evt){if(!data.retry){ // show progress only for correct chunk uploads
   options.progress({type:evt.type,total:data.size,loaded:data.start+evt.loaded,totalSize:data.size},_this,options);}},false);}xhr.onreadystatechange=function(){var lkb=parseInt(xhr.getResponseHeader('X-Last-Known-Byte'),10);_this.status=xhr.status;_this.statusText=xhr.statusText;_this.readyState=xhr.readyState;if(xhr.readyState==4){for(var k in _xhrResponsePostfix){_this['response'+k]=xhr['response'+k];}xhr.onreadystatechange=null;if(!xhr.status||xhr.status-201>0){api.log("Error: "+xhr.status); // some kind of error
   // 0 - connection fail or timeout, if xhr.aborted is true, then it's not recoverable user action
   // up - server error
   if((!xhr.status&&!xhr.aborted||500==xhr.status||416==xhr.status)&&++data.retry<=options.chunkUploadRetry){ // let's try again the same chunk
   // only applicable for recoverable error codes 500 && 416
   var delay=xhr.status?0:api.chunkNetworkDownRetryTimeout; // inform about recoverable problems
   options.pause(data.file,options); // smart restart if server reports about the last known byte
   api.log("X-Last-Known-Byte: "+lkb);if(lkb){data.end=lkb;}else {data.end=data.start-1;}setTimeout(function(){_this._send(options,data);},delay);}else { // no mo retries
   _this.end(xhr.status);}}else { // success
   data.retry=0;if(data.end==data.size-1){ // finished
   _this.end(xhr.status);}else { // next chunk
   // shift position if server reports about the last known byte
   api.log("X-Last-Known-Byte: "+lkb);if(lkb){data.end=lkb;}data.file.FileAPIReadPosition=data.end;setTimeout(function(){_this._send(options,data);},0);}}xhr=null;}};data.start=data.end+1;data.end=Math.max(Math.min(data.start+options.chunkSize,data.size)-1,data.start);var slice;(slice='slice') in data.file||(slice='mozSlice') in data.file||(slice='webkitSlice') in data.file;xhr.setRequestHeader("Content-Range","bytes "+data.start+"-"+data.end+"/"+data.size);xhr.setRequestHeader("Content-Disposition",'attachment; filename='+encodeURIComponent(data.name));xhr.setRequestHeader("Content-Type",data.type||"application/octet-stream");slice=data.file[slice](data.start,data.end+1);xhr.send(slice);slice=null;}else { // single piece upload
   if(xhr.upload){ // https://github.com/blueimp/jQuery-File-Upload/wiki/Fixing-Safari-hanging-on-very-high-speed-connections-%281Gbps%29
   xhr.upload.addEventListener('progress',api.throttle(function( /**Event*/evt){options.progress(evt,_this,options);},100),false);}xhr.onreadystatechange=function(){_this.status=xhr.status;_this.statusText=xhr.statusText;_this.readyState=xhr.readyState;if(xhr.readyState==4){for(var k in _xhrResponsePostfix){_this['response'+k]=xhr['response'+k];}xhr.onreadystatechange=null;_this.end(xhr.status);xhr=null;}};if(api.isArray(data)){ // multipart
   xhr.setRequestHeader('Content-Type','multipart/form-data; boundary=_'+api.expando);data=data.join('')+'--_'+api.expando+'--'; /** @namespace  xhr.sendAsBinary  https://developer.mozilla.org/ru/XMLHttpRequest#Sending_binary_content */if(xhr.sendAsBinary){xhr.sendAsBinary(data);}else {var bytes=Array.prototype.map.call(data,function(c){return c.charCodeAt(0)&0xff;});xhr.send(new Uint8Array(bytes).buffer);}}else { // FormData 
   xhr.send(data);}}}}}; // @export
   api.XHR=XHR;})(window,FileAPI); /**
    * @class FileAPI.Camera
    * @author  RubaXa  <trash@rubaxa.org>
    * @support Chrome 21+, FF 18+, Opera 12+
    */ /*global window, FileAPI, jQuery */ /** @namespace LocalMediaStream -- https://developer.mozilla.org/en-US/docs/WebRTC/MediaStream_API#LocalMediaStream */(function(window,api){"use strict";var URL=window.URL||window.webkitURL,document=window.document,navigator=window.navigator,getMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia,html5=!!getMedia; // Support "media"
   api.support.media=html5;var Camera=function Camera(video){this.video=video;};Camera.prototype={isActive:function isActive(){return !!this._active;}, /**
        * Start camera streaming
        * @param {Function}  callback
        */start:function start(callback){var _this=this,video=_this.video,_successId,_failId,_complete=function _complete(err){_this._active=!err;clearTimeout(_failId);clearTimeout(_successId); //          api.event.off(video, 'loadedmetadata', _complete);
   callback&&callback(err,_this);};getMedia.call(navigator,{video:true},function(stream /**LocalMediaStream*/){ // Success
   _this.stream=stream; //        api.event.on(video, 'loadedmetadata', function (){
   //          _complete(null);
   //        });
   // Set camera stream
   video.src=URL.createObjectURL(stream); // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
   // See crbug.com/110938.
   _successId=setInterval(function(){if(_detectVideoSignal(video)){_complete(null);}},1000);_failId=setTimeout(function(){_complete('timeout');},5000); // Go-go-go!
   video.play();},_complete /*error*/);}, /**
        * Stop camera streaming
        */stop:function stop(){try{this._active=false;this.video.pause();this.stream.stop();}catch(err){}}, /**
        * Create screenshot
        * @return {FileAPI.Camera.Shot}
        */shot:function shot(){return new Shot(this.video);}}; /**
      * Get camera element from container
      *
      * @static
      * @param {HTMLElement} el
      * @return  {Camera}
      */Camera.get=function(el){return new Camera(el.firstChild);}; /**
      * Publish camera element into container
      *
      * @static
      * @param {HTMLElement} el
      * @param {Object}    options
      * @param {Function}    [callback]
      */Camera.publish=function(el,options,callback){if(typeof options=='function'){callback=options;options={};} // Dimensions of "camera"
   options=api.extend({},{width:'100%',height:'100%',start:true},options);if(el.jquery){ // Extract first element, from jQuery collection
   el=el[0];}var doneFn=function doneFn(err){if(err){callback(err);}else { // Get camera
   var cam=Camera.get(el);if(options.start){cam.start(callback);}else {callback(null,cam);}}};el.style.width=_px(options.width);el.style.height=_px(options.height);if(api.html5&&html5){ // Create video element
   var video=document.createElement('video'); // Set dimensions
   video.style.width=_px(options.width);video.style.height=_px(options.height); // Clean container
   if(window.jQuery){jQuery(el).empty();}else {el.innerHTML='';} // Add "camera" to container
   el.appendChild(video); // end
   doneFn();}else {Camera.fallback(el,options,doneFn);}};Camera.fallback=function(el,options,callback){callback('not_support_camera');}; /**
      * @class FileAPI.Camera.Shot
      */var Shot=function Shot(video){var canvas=video.nodeName?api.Image.toCanvas(video):video;var shot=api.Image(canvas);shot.type='image/png';shot.width=canvas.width;shot.height=canvas.height;shot.size=canvas.width*canvas.height*4;return shot;}; /**
      * Add "px" postfix, if value is a number
      *
      * @private
      * @param {*}  val
      * @return  {String}
      */function _px(val){return val>=0?val+'px':val;} /**
      * @private
      * @param {HTMLVideoElement} video
      * @return  {Boolean}
      */function _detectVideoSignal(video){var canvas=document.createElement('canvas'),ctx,res=false;try{ctx=canvas.getContext('2d');ctx.drawImage(video,0,0,1,1);res=ctx.getImageData(0,0,1,1).data[4]!=255;}catch(e){}return res;} // @export
   Camera.Shot=Shot;api.Camera=Camera;})(window,FileAPI); /**
    * FileAPI fallback to Flash
    *
    * @flash-developer  "Vladimir Demidov" <v.demidov@corp.mail.ru>
    */ /*global window, ActiveXObject, FileAPI */(function(window,jQuery,api){"use strict";var document=window.document,location=window.location,navigator=window.navigator,_each=api.each,_cameraQueue=[];api.support.flash=function(){var mime=navigator.mimeTypes,has=false;if(navigator.plugins&&babelHelpers.typeof(navigator.plugins['Shockwave Flash'])=='object'){has=navigator.plugins['Shockwave Flash'].description&&!(mime&&mime['application/x-shockwave-flash']&&!mime['application/x-shockwave-flash'].enabledPlugin);}else {try{has=!!(window.ActiveXObject&&new ActiveXObject('ShockwaveFlash.ShockwaveFlash'));}catch(er){api.log('Flash -- does not supported.');}}if(has&&/^file:/i.test(location)){api.log('[warn] Flash does not work on `file:` protocol.');}return has;}();api.support.flash&&(0||!api.html5||!api.support.html5||api.cors&&!api.support.cors||api.media&&!api.support.media)&&function(){var _attr=api.uid(),_retry=0,_files={},_rhttp=/^https?:/i,flash={_fn:{}, /**
            * Initialization & preload flash object
            */init:function init(){var child=document.body&&document.body.firstChild;if(child){do {if(child.nodeType==1){api.log('FlashAPI.state: awaiting');var dummy=document.createElement('div');dummy.id='_'+_attr;_css(dummy,{top:1,right:1,width:5,height:5,position:'absolute',zIndex:1e6+'' // set max zIndex
   });child.parentNode.insertBefore(dummy,child);flash.publish(dummy,_attr);return;}}while(child=child.nextSibling);}if(_retry<10){setTimeout(flash.init,++_retry*50);}}, /**
            * Publish flash-object
            *
            * @param {HTMLElement} el
            * @param {String} id
            * @param {Object} [opts]
            */publish:function publish(el,id,opts){opts=opts||{};el.innerHTML=_makeFlashHTML({id:id,src:_getUrl(api.flashUrl,'r='+api.version) //            , src: _getUrl('http://v.demidov.boom.corp.mail.ru/uploaderfileapi/FlashFileAPI.swf?1')
   ,wmode:opts.camera?'':'transparent',flashvars:'callback='+(opts.onEvent||'FileAPI.Flash.onEvent')+'&flashId='+id+'&storeKey='+navigator.userAgent.match(/\d/ig).join('')+'_'+api.version+(flash.isReady||(api.pingUrl?'&ping='+api.pingUrl:''))+'&timeout='+api.flashAbortTimeout+(opts.camera?'&useCamera='+_getUrl(api.flashWebcamUrl):'') //              + '&debug=1'
   },opts);},ready:function ready(){api.log('FlashAPI.state: ready');flash.ready=api.F;flash.isReady=true;flash.patch();api.event.on(document,'mouseover',flash.mouseover);api.event.on(document,'click',function(evt){if(flash.mouseover(evt)){evt.preventDefault?evt.preventDefault():evt.returnValue=true;}});},getEl:function getEl(){return document.getElementById('_'+_attr);},getWrapper:function getWrapper(node){do {if(/js-fileapi-wrapper/.test(node.className)){return node;}}while((node=node.parentNode)&&node!==document.body);},mouseover:function mouseover(evt){var target=api.event.fix(evt).target;if(/input/i.test(target.nodeName)&&target.type=='file'){var state=target.getAttribute(_attr),wrapper=flash.getWrapper(target);if(api.multiFlash){ // check state:
   //   i — published
   //   i — initialization
   //   r — ready
   if(state=='i'||state=='r'){ // publish fail
   return false;}else if(state!='p'){ // set "init" state
   target.setAttribute(_attr,'i');var dummy=document.createElement('div');if(!wrapper){api.log('[err] FlashAPI.mouseover: js-fileapi-wrapper not found');return;}_css(dummy,{top:0,left:0,width:target.offsetWidth+100,height:target.offsetHeight+100,zIndex:1e6+'' // set max zIndex
   ,position:'absolute'});wrapper.appendChild(dummy);flash.publish(dummy,api.uid()); // set "publish" state
   target.setAttribute(_attr,'p');}return true;}else if(wrapper){ // Use one flash element
   var box=_getDimensions(wrapper);_css(flash.getEl(),box); // Set current input
   flash.curInp=target;}}else if(!/object|embed/i.test(target.nodeName)){_css(flash.getEl(),{top:1,left:1,width:5,height:5});}},onEvent:function onEvent(evt){var type=evt.type;if(type=='ready'){try{ // set "ready" state
   flash.getInput(evt.flashId).setAttribute(_attr,'r');}catch(e){}flash.ready();setTimeout(function(){flash.mouseenter(evt);},50);return true;}else if(type==='ping'){api.log('(flash -> js).ping:',[evt.status,evt.savedStatus],evt.error);}else if(type==='log'){api.log('(flash -> js).log:',evt.target);}else if(type in flash){setTimeout(function(){api.log('FlashAPI.event.'+evt.type+':',evt);flash[type](evt);},1);}},mouseenter:function mouseenter(evt){var node=flash.getInput(evt.flashId);if(node){ // Set multiple mode
   flash.cmd(evt,'multiple',node.getAttribute('multiple')!=null); // Set files filter
   var accept=[],exts={};_each((node.getAttribute('accept')||'').split(/,\s*/),function(mime){api.accept[mime]&&_each(api.accept[mime].split(' '),function(ext){exts[ext]=1;});});_each(exts,function(i,ext){accept.push(ext);});flash.cmd(evt,'accept',accept.length?accept.join(',')+','+accept.join(',').toUpperCase():'*');}},get:function get(id){return document[id]||window[id]||document.embeds[id];},getInput:function getInput(id){if(api.multiFlash){try{var node=flash.getWrapper(flash.get(id));if(node){return node.getElementsByTagName('input')[0];}}catch(e){api.log('[err] Can not find "input" by flashId:',id,e);}}else {return flash.curInp;}},select:function select(evt){var inp=flash.getInput(evt.flashId),uid=api.uid(inp),files=evt.target.files,event;_each(files,function(file){api.checkFileObj(file);});_files[uid]=files;if(document.createEvent){event=document.createEvent('Event');event.files=files;event.initEvent('change',true,true);inp.dispatchEvent(event);}else if(jQuery){jQuery(inp).trigger({type:'change',files:files});}else {event=document.createEventObject();event.files=files;inp.fireEvent('onchange',event);}},cmd:function cmd(id,name,data,last){try{api.log('(js -> flash).'+name+':',data);return flash.get(id.flashId||id).cmd(name,data);}catch(e){api.log('(js -> flash).onError:',e);if(!last){ // try again
   setTimeout(function(){flash.cmd(id,name,data,true);},50);}}},patch:function patch(){api.flashEngine=api.support.transform=true; // FileAPI
   _inherit(api,{getFiles:function getFiles(input,filter,callback){if(callback){api.filterFiles(api.getFiles(input),filter,callback);return null;}var files=api.isArray(input)?input:_files[api.uid(input.target||input.srcElement||input)];if(!files){ // Файлов нету, вызываем родительский метод
   return this.parent.apply(this,arguments);}if(filter){filter=api.getFilesFilter(filter);files=api.filter(files,function(file){return filter.test(file.name);});}return files;},getInfo:function getInfo(file,fn){if(_isHtmlFile(file)){this.parent.apply(this,arguments);}else if(file.isShot){fn(null,file.info={width:file.width,height:file.height});}else {if(!file.__info){var defer=file.__info=api.defer();flash.cmd(file,'getFileInfo',{id:file.id,callback:_wrap(function _(err,info){_unwrap(_);defer.resolve(err,file.info=info);})});}file.__info.then(fn);}}}); // FileAPI.Image
   api.support.transform=true;api.Image&&_inherit(api.Image.prototype,{get:function get(fn,scaleMode){this.set({scaleMode:scaleMode||'noScale'}); // noScale, exactFit
   this.parent(fn);},_load:function _load(file,fn){api.log('FlashAPI.Image._load:',file);if(_isHtmlFile(file)){this.parent.apply(this,arguments);}else {var _this=this;api.getInfo(file,function(err){fn.call(_this,err,file);});}},_apply:function _apply(file,fn){api.log('FlashAPI.Image._apply:',file);if(_isHtmlFile(file)){this.parent.apply(this,arguments);}else {var m=this.getMatrix(file.info),doneFn=fn;flash.cmd(file,'imageTransform',{id:file.id,matrix:m,callback:_wrap(function _(err,base64){api.log('FlashAPI.Image._apply.callback:',err);_unwrap(_);if(err){doneFn(err);}else if(!api.support.html5&&(!api.support.dataURI||base64.length>3e4)){_makeFlashImage({width:m.deg%180?m.dh:m.dw,height:m.deg%180?m.dw:m.dh,scale:m.scaleMode},base64,doneFn);}else {if(m.filter){doneFn=function doneFn(err,img){if(err){fn(err);}else {api.Image.applyFilter(img,m.filter,function(){fn(err,this.canvas);});}};}api.newImage('data:'+file.type+';base64,'+base64,doneFn);}})});}},toData:function toData(fn){var file=this.file,info=file.info,matrix=this.getMatrix(info);if(_isHtmlFile(file)){this.parent.apply(this,arguments);}else {if(matrix.deg=='auto'){matrix.deg=api.Image.exifOrientation[info&&info.exif&&info.exif.Orientation]||0;}fn.call(this,!file.info,{id:file.id,flashId:file.flashId,name:file.name,type:file.type,matrix:matrix});}}});api.Image&&_inherit(api.Image,{fromDataURL:function fromDataURL(dataURL,size,callback){if(!api.support.dataURI||dataURL.length>3e4){_makeFlashImage(api.extend({scale:'exactFit'},size),dataURL.replace(/^data:[^,]+,/,''),function(err,el){callback(el);});}else {this.parent(dataURL,size,callback);}}}); // FileAPI.Camera:statics
   api.Camera.fallback=function(el,options,callback){var camId=api.uid();api.log('FlashAPI.Camera.publish: '+camId);flash.publish(el,camId,api.extend(options,{camera:true,onEvent:_wrap(function _(evt){if(evt.type=='camera'){_unwrap(_);if(evt.error){api.log('FlashAPI.Camera.publish.error: '+evt.error);callback(evt.error);}else {api.log('FlashAPI.Camera.publish.success: '+camId);callback(null);}}})}));}; // Run
   _each(_cameraQueue,function(args){api.Camera.fallback.apply(api.Camera,args);});_cameraQueue=[]; // FileAPI.Camera:proto
   _inherit(api.Camera.prototype,{_id:function _id(){return this.video.id;},start:function start(callback){var _this=this;flash.cmd(this._id(),'camera.on',{callback:_wrap(function _(evt){_unwrap(_);if(evt.error){api.log('FlashAPI.camera.on.error: '+evt.error);callback(evt.error,_this);}else {api.log('FlashAPI.camera.on.success: '+_this._id());_this._active=true;callback(null,_this);}})});},stop:function stop(){this._active=false;flash.cmd(this._id(),'camera.off');},shot:function shot(){api.log('FlashAPI.Camera.shot:',this._id());var shot=flash.cmd(this._id(),'shot',{});shot.type='image/png';shot.flashId=this._id();shot.isShot=true;return new api.Camera.Shot(shot);}}); // FileAPI.Form
   _inherit(api.Form.prototype,{toData:function toData(fn){var items=this.items,i=items.length;for(;i--;){if(items[i].file&&_isHtmlFile(items[i].blob)){return this.parent.apply(this,arguments);}}api.log('FlashAPI.Form.toData');fn(items);}}); // FileAPI.XHR
   _inherit(api.XHR.prototype,{_send:function _send(options,formData){if(formData.nodeName||formData.append&&api.support.html5||api.isArray(formData)&&typeof formData[0]==='string'){ // HTML5, Multipart or IFrame
   return this.parent.apply(this,arguments);}var data={},files={},_this=this,flashId,fileId;_each(formData,function(item){if(item.file){files[item.name]=item=_getFileDescr(item.blob);fileId=item.id;flashId=item.flashId;}else {data[item.name]=item.blob;}});if(!fileId){flashId=_attr;}if(!flashId){api.log('[err] FlashAPI._send: flashId -- undefined');return this.parent.apply(this,arguments);}else {api.log('FlashAPI.XHR._send: '+flashId+' -> '+fileId,files);}_this.xhr={headers:{},abort:function abort(){flash.cmd(flashId,'abort',{id:fileId});},getResponseHeader:function getResponseHeader(name){return this.headers[name];},getAllResponseHeaders:function getAllResponseHeaders(){return this.headers;}};var queue=api.queue(function(){flash.cmd(flashId,'upload',{url:_getUrl(options.url),data:data,files:fileId?files:null,headers:options.headers||{},callback:_wrap(function upload(evt){var type=evt.type,result=evt.result;api.log('FlashAPI.upload.'+type+':',evt);if(type=='progress'){evt.loaded=Math.min(evt.loaded,evt.total); // @todo fixme
   evt.lengthComputable=true;options.progress(evt);}else if(type=='complete'){_unwrap(upload);if(typeof result=='string'){_this.responseText=result.replace(/%22/g,"\"").replace(/%5c/g,"\\").replace(/%26/g,"&").replace(/%25/g,"%");}_this.end(evt.status||200);}else if(type=='abort'||type=='error'){_this.end(evt.status||0,evt.message);_unwrap(upload);}})});}); // #2174: FileReference.load() call while FileReference.upload() or vice versa
   _each(files,function(file){queue.inc();api.getInfo(file,queue.next);});queue.check();}});}};function _makeFlashHTML(opts){return ('<object id="#id#" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+(opts.width||'100%')+'" height="'+(opts.height||'100%')+'">'+'<param name="movie" value="#src#" />'+'<param name="flashvars" value="#flashvars#" />'+'<param name="swliveconnect" value="true" />'+'<param name="allowscriptaccess" value="always" />'+'<param name="allownetworking" value="all" />'+'<param name="menu" value="false" />'+'<param name="wmode" value="#wmode#" />'+'<embed flashvars="#flashvars#" swliveconnect="true" allownetworking="all" allowscriptaccess="always" name="#id#" src="#src#" width="'+(opts.width||'100%')+'" height="'+(opts.height||'100%')+'" menu="false" wmode="transparent" type="application/x-shockwave-flash"></embed>'+'</object>').replace(/#(\w+)#/ig,function(a,name){return opts[name];});}function _css(el,css){if(el&&el.style){var key,val;for(key in css){val=css[key];if(typeof val=='number'){val+='px';}try{el.style[key]=val;}catch(e){}}}}function _inherit(obj,methods){_each(methods,function(fn,name){var prev=obj[name];obj[name]=function(){this.parent=prev;return fn.apply(this,arguments);};});}function _isHtmlFile(file){return file&&!file.flashId;}function _wrap(fn){var id=fn.wid=api.uid();flash._fn[id]=fn;return 'FileAPI.Flash._fn.'+id;}function _unwrap(fn){try{flash._fn[fn.wid]=null;delete flash._fn[fn.wid];}catch(e){}}function _getUrl(url,params){if(!_rhttp.test(url)){if(/^\.\//.test(url)||'/'!=url.charAt(0)){var path=location.pathname;path=path.substr(0,path.lastIndexOf('/'));url=(path+'/'+url).replace('/./','/');}if('//'!=url.substr(0,2)){url='//'+location.host+url;}if(!_rhttp.test(url)){url=location.protocol+url;}}if(params){url+=(/\?/.test(url)?'&':'?')+params;}return url;}function _makeFlashImage(opts,base64,fn){var key,flashId=api.uid(),el=document.createElement('div'),attempts=10;for(key in opts){el.setAttribute(key,opts[key]);el[key]=opts[key];}_css(el,opts);opts.width='100%';opts.height='100%';el.innerHTML=_makeFlashHTML(api.extend({id:flashId,src:_getUrl(api.flashImageUrl,'r='+api.uid()),wmode:'opaque',flashvars:'scale='+opts.scale+'&callback='+_wrap(function _(){_unwrap(_);if(--attempts>0){_setImage();}return true;})},opts));function _setImage(){try{ // Get flash-object by id
   var img=flash.get(flashId);img.setImage(base64);}catch(e){api.log('[err] FlashAPI.Preview.setImage -- can not set "base64":',e);}}fn(false,el);el=null;}function _getFileDescr(file){return {id:file.id,name:file.name,matrix:file.matrix,flashId:file.flashId};}function _getDimensions(el){var box=el.getBoundingClientRect(),body=document.body,docEl=(el&&el.ownerDocument).documentElement;return {top:box.top+(window.pageYOffset||docEl.scrollTop)-(docEl.clientTop||body.clientTop||0),left:box.left+(window.pageXOffset||docEl.scrollLeft)-(docEl.clientLeft||body.clientLeft||0),width:box.right-box.left,height:box.bottom-box.top};}api.Camera.fallback=function(){_cameraQueue.push(arguments);}; // @export
   api.Flash=flash; // Check dataURI support
   api.newImage('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',function(err,img){api.support.dataURI=!(img.width!=1||img.height!=1);flash.init();});}();})(window,window.jQuery,FileAPI); /*
    * JavaScript Load Image iOS scaling fixes 1.0.3
    * https://github.com/blueimp/JavaScript-Load-Image
    *
    * Copyright 2013, Sebastian Tschan
    * https://blueimp.net
    *
    * iOS image scaling fixes based on
    * https://github.com/stomita/ios-imagefile-megapixel
    *
    * Licensed under the MIT license:
    * http://www.opensource.org/licenses/MIT
    */ /*jslint nomen: true, bitwise: true */ /*global FileAPI, window, document */(function(factory){'use strict';factory(FileAPI);})(function(loadImage){'use strict'; // Only apply fixes on the iOS platform:
   if(!window.navigator||!window.navigator.platform||!/iP(hone|od|ad)/.test(window.navigator.platform)){return;}var originalRenderMethod=loadImage.renderImageToCanvas; // Detects subsampling in JPEG images:
   loadImage.detectSubsampling=function(img){var canvas,context;if(img.width*img.height>1024*1024){ // only consider mexapixel images
   canvas=document.createElement('canvas');canvas.width=canvas.height=1;context=canvas.getContext('2d');context.drawImage(img,-img.width+1,0); // subsampled image becomes half smaller in rendering size.
   // check alpha channel value to confirm image is covering edge pixel or not.
   // if alpha value is 0 image is not covering, hence subsampled.
   return context.getImageData(0,0,1,1).data[3]===0;}return false;}; // Detects vertical squash in JPEG images:
   loadImage.detectVerticalSquash=function(img,subsampled){var naturalHeight=img.naturalHeight||img.height,canvas=document.createElement('canvas'),context=canvas.getContext('2d'),data,sy,ey,py,alpha;if(subsampled){naturalHeight/=2;}canvas.width=1;canvas.height=naturalHeight;context.drawImage(img,0,0);data=context.getImageData(0,0,1,naturalHeight).data; // search image edge pixel position in case it is squashed vertically:
   sy=0;ey=naturalHeight;py=naturalHeight;while(py>sy){alpha=data[(py-1)*4+3];if(alpha===0){ey=py;}else {sy=py;}py=ey+sy>>1;}return py/naturalHeight||1;}; // Renders image to canvas while working around iOS image scaling bugs:
   // https://github.com/blueimp/JavaScript-Load-Image/issues/13
   loadImage.renderImageToCanvas=function(canvas,img,sourceX,sourceY,sourceWidth,sourceHeight,destX,destY,destWidth,destHeight){if(img._type==='image/jpeg'){var context=canvas.getContext('2d'),tmpCanvas=document.createElement('canvas'),tileSize=1024,tmpContext=tmpCanvas.getContext('2d'),subsampled,vertSquashRatio,tileX,tileY;tmpCanvas.width=tileSize;tmpCanvas.height=tileSize;context.save();subsampled=loadImage.detectSubsampling(img);if(subsampled){sourceX/=2;sourceY/=2;sourceWidth/=2;sourceHeight/=2;}vertSquashRatio=loadImage.detectVerticalSquash(img,subsampled);if(subsampled||vertSquashRatio!==1){sourceY*=vertSquashRatio;destWidth=Math.ceil(tileSize*destWidth/sourceWidth);destHeight=Math.ceil(tileSize*destHeight/sourceHeight/vertSquashRatio);destY=0;tileY=0;while(tileY<sourceHeight){destX=0;tileX=0;while(tileX<sourceWidth){tmpContext.clearRect(0,0,tileSize,tileSize);tmpContext.drawImage(img,sourceX,sourceY,sourceWidth,sourceHeight,-tileX,-tileY,sourceWidth,sourceHeight);context.drawImage(tmpCanvas,0,0,tileSize,tileSize,destX,destY,destWidth,destHeight);tileX+=tileSize;destX+=destWidth;}tileY+=tileSize;destY+=destHeight;}context.restore();return canvas;}}return originalRenderMethod(canvas,img,sourceX,sourceY,sourceWidth,sourceHeight,destX,destY,destWidth,destHeight);};}); /*
    * JavaScript Canvas to Blob 2.0.5
    * https://github.com/blueimp/JavaScript-Canvas-to-Blob
    *
    * Copyright 2012, Sebastian Tschan
    * https://blueimp.net
    *
    * Licensed under the MIT license:
    * http://www.opensource.org/licenses/MIT
    *
    * Based on stackoverflow user Stoive's code snippet:
    * http://stackoverflow.com/q/4998908
    */ /*jslint nomen: true, regexp: true */ /*global window, atob, Blob, ArrayBuffer, Uint8Array */(function(window){'use strict';var CanvasPrototype=window.HTMLCanvasElement&&window.HTMLCanvasElement.prototype,hasBlobConstructor=window.Blob&&function(){try{return Boolean(new Blob());}catch(e){return false;}}(),hasArrayBufferViewSupport=hasBlobConstructor&&window.Uint8Array&&function(){try{return new Blob([new Uint8Array(100)]).size===100;}catch(e){return false;}}(),BlobBuilder=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,dataURLtoBlob=(hasBlobConstructor||BlobBuilder)&&window.atob&&window.ArrayBuffer&&window.Uint8Array&&function(dataURI){var byteString,arrayBuffer,intArray,i,mimeString,bb;if(dataURI.split(',')[0].indexOf('base64')>=0){ // Convert base64 to raw binary data held in a string:
   byteString=atob(dataURI.split(',')[1]);}else { // Convert base64/URLEncoded data component to raw binary data:
   byteString=decodeURIComponent(dataURI.split(',')[1]);} // Write the bytes of the string to an ArrayBuffer:
   arrayBuffer=new ArrayBuffer(byteString.length);intArray=new Uint8Array(arrayBuffer);for(i=0;i<byteString.length;i+=1){intArray[i]=byteString.charCodeAt(i);} // Separate out the mime component:
   mimeString=dataURI.split(',')[0].split(':')[1].split(';')[0]; // Write the ArrayBuffer (or ArrayBufferView) to a blob:
   if(hasBlobConstructor){return new Blob([hasArrayBufferViewSupport?intArray:arrayBuffer],{type:mimeString});}bb=new BlobBuilder();bb.append(arrayBuffer);return bb.getBlob(mimeString);};if(window.HTMLCanvasElement&&!CanvasPrototype.toBlob){if(CanvasPrototype.mozGetAsFile){CanvasPrototype.toBlob=function(callback,type,quality){if(quality&&CanvasPrototype.toDataURL&&dataURLtoBlob){callback(dataURLtoBlob(this.toDataURL(type,quality)));}else {callback(this.mozGetAsFile('blob',type));}};}else if(CanvasPrototype.toDataURL&&dataURLtoBlob){CanvasPrototype.toBlob=function(callback,type,quality){callback(dataURLtoBlob(this.toDataURL(type,quality)));};}}window.dataURLtoBlob=dataURLtoBlob;})(window);var file = FileAPI;

   function createXHR() {
     if (window.ActiveXObject) {
       var xhr = new ActiveXObject("Microsoft.XMLHTTP");
     } else if (window.XMLHttpRequest) {
       var xhr = new XMLHttpRequest();
     }

     return xhr;
   }

   var ajax = {};

   ajax.get = function (url, callback) {
     var xhr = createXHR();

     xhr.open('GET', url);
     xhr.onreadystatechange = function () {
       if (xhr.readyState !== 4) return;

       if (xhr.status == 200) {
         callback(null, xhr.responseText);
       } else if (xhr.status != 304) {
         callback(true);
       }
     };
     xhr.send(null);

     return xhr;
   };

   ajax.post = function (url, data, callback) {
     var xhr = createXHR();

     var query = '?';
     for (var key in data) {
       if (data.hasOwnProperty(key)) {
         query += key + '=' + data[key];
       }
     }

     xhr.open('POST', url);
     xhr.onreadystatechange = function () {
       if (xhr.readyState == 4 && xhr.status == 200) {
         callback(null, xhr.responseText);
       } else {
         callback(true);
       }
     };
     xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
     xhr.send(query);

     return xhr;
   };

   ajax.postBlob = function (url, blob, options, callback) {
     var xhr = createXHR();

     if (utils.isFunction(options)) {
       callback = options;
       options = {};
     }

     xhr.open('POST', url);
     xhr.onreadystatechange = function () {
       if (xhr.readyState == 4 && xhr.status == 200) {
         callback(null.xhr.responseText);
       } else {
         callback(true);
       }
     };
     if (options.headers) {
       utils.each(options.headers, function (val, header) {
         xhr.setRequestHeader(header, val);
       });
     }
     xhr.send(blob);

     return xhr;
   };

   var Asset$3 = _Asset({});

   var imageViewTranslations$1 = {
     weight: 'w',
     height: 'h',
     quality: 'q'
   };

   var _Image = function (_Asset2) {
     babelHelpers.inherits(_Image, _Asset2);


     /**
      * Image Asset
      * @param {String} key    key
      * @param {Bucket} parent bucket object
      */

     function _Image(key, parent, _config) {
       babelHelpers.classCallCheck(this, _Image);

       var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(_Image).call(this));

       var config = utils.objExtend(utils.objClone(parent.config), {
         separate: '-'
       }, _config);

       _this.key = key;
       _this.parent = parent;
       _this.config = config;
       return _this;
     }

     /**
      * get the image's infomations
      * @param  {Function} callback Callback
      * @return {Promise}           promise object
      */


     babelHelpers.createClass(_Image, [{
       key: 'imageInfo',
       value: function imageInfo() {
         var _this2 = this;

         var callback = arguments.length <= 0 || arguments[0] === undefined ? noop$3 : arguments[0];

         return new Promise(function (resolve, reject) {
           var infoUrl = _this2.url() + '?imageInfo';

           ajax.get(infoUrl, function (err, body) {
             if (err) {
               reject(err);
               return callback(err);
             }

             var info = JSON.parse(body);

             resolve(info);
             callback(null, info);
           });
         });
       }

       /**
        * get the exif infomation of the picture
        * @param  {Function} callback Callback
        * @return {Promise}           promise object
        */

     }, {
       key: 'exif',
       value: function exif() {
         var _this3 = this;

         var callback = arguments.length <= 0 || arguments[0] === undefined ? noop$3 : arguments[0];

         return new Promise(function (resolve, reject) {
           var infoUrl = _this3.url() + '?exif';

           ajax.get(infoUrl, function (err, body) {
             if (err) {
               reject(err);
               return callback(err);
             }

             var info = JSON.parse(body);

             resolve(info);
             callback(null, info);
           });
         });
       }

       /**
        * return a thumbnail image
        * @param  {Object}   opts     options
        * @param  {Function} callback Callback
        * @return {Promise}           promise
        */

     }, {
       key: 'imageView',
       value: function imageView(opts) {
         var _this4 = this;

         var callback = arguments.length <= 1 || arguments[1] === undefined ? noop$3 : arguments[1];

         var promise = new Promise(function (resolve, reject) {

           var mode = opts.mode;
           delete opts.mode;

           var url = _this4.url();
           var params = {};

           utils.each(opts, function (value, key) {
             if (imageViewTranslations$1.hasOwnProperty(key)) {
               key = imageViewTranslations$1[key];
             }

             params[key] = value;
           });

           url += utils.format('?imageView/%d%s', mode, genOptUrl$1(params));

           var image = new Image();
           image.src = url;

           promise.image = image;

           resolve(image);
           callback(null, image);
         });

         return promise;
       }

       /**
        * return a processed image
        * @param  {Object}   opts     options
        * @param  {Function} callback Callback
        * @return {Promise}           promise
        */

     }, {
       key: 'imageMogr',
       value: function imageMogr(opts) {
         var _this5 = this;

         var callback = arguments.length <= 1 || arguments[1] === undefined ? noop$3 : arguments[1];

         var promise = new Promise(function (resolve, reject) {
           var url = _this5.url();
           var params = {};

           utils.objExtend(params, opts);

           url += utils.format('?imageMogr/v2/auto-orient%s', genOptUrl$1(params));

           var image = new Image();
           image.src = url;

           promise.image = image;

           resolve(image);
           callback(null, image);
         });

         return promise;
       }

       /**
        * return a image with a watermark
        * @param  {Object}   opts     options
        * @param  {Function} callback Callback
        * @return {Promise}           promise object
        */

     }, {
       key: 'watermark',
       value: function watermark(opts) {
         var _this6 = this;

         var callback = arguments.length <= 1 || arguments[1] === undefined ? noop$3 : arguments[1];

         var promise = new Promise(function (resolve) {
           var url = _this6.url();
           var params = {};
           var mode = opts.mode;
           delete opts.mode;

           utils.objExtend(params, opts);

           params.image = utils.safeEncode(params.image);

           url += utils.format('?watermark/%d%s', mode, genOptUrl$1(params));

           var image = new Image();
           image.src = url;

           promise.image = image;

           resolve(image);
           callback(null, image);
         });

         return promise;
       }
     }]);
     return _Image;
   }(Asset$3);

   _Image.extend = function (_file) {
     _file.imageView = function (opts, callback) {
       var _this7 = this;

       callback = callback || noop$3;
       return new Promise(function (resolve) {

         var img = file.Image(_this7);

         img._load(_this7, function (err, _img) {
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

           img.set(view).get(function (err, image) {
             if (err) {
               callback(err);
               return reject(err);
             }

             callback(null, image);
             resolve(image);
           });
         });
       });
     };

     _file.imageMogr = function (opts, callback) {
       var _this8 = this;

       callback = callback || noop$3;

       return new Promise(function (resolve, reject) {

         var img = file.Image(_this8);

         img._load(_this8, function (err, _img) {
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
                 sx: (_img.width - thumbnail.width) / 2, // x
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

           img.set(view).get(function (err, image) {
             if (err) {
               callback(err);
               return reject(err);
             }

             callback(null, image);
             resolve(image);
           });
         });
       });
     };

     _file.imageInfo = function (callback) {
       var _this9 = this;

       callback = callback || noop$3;

       return new Promise(function (resolve, reject) {
         var img = file.Image(_this9);

         img._load(_this9, function (err, img) {
           if (err) {
             callback(err);
             return reject(err);
           }

           var info = {
             width: img.width,
             height: img.height
           };
           callback(null, info);
           resolve(info);
         });
       });
     };

     _file.getImage = function () {
       return file.Image(this);
     };

     return _file;
   };

   function genOptUrl$1(params) {
     var url = "";

     utils.each(params, function (value, key) {
       url += utils.format('/%s/%s', key, value);
     });

     return url;
   }

   function noop$3() {
     return false;
   }

   var Asset$2 = null;

   var globalConfig = null;

   function noop$2() {
     return false;
   }

   var Bucket$1 = function () {
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

     function Bucket(name) {
       var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
       babelHelpers.classCallCheck(this, Bucket);

       this.name = name;
       this.queue = [];
       this.config = utils.objExtend(globalConfig, config, {
         scope: name
       });

       if (this.config.url) {
         if (/\/$/.test(this.config.url)) {
           this.config.url = this.config.url.substr(0, this.config.url.length - 1);
         }
       } else {
         throw new ReferenceError('You should set the url of the bucket.');
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


     babelHelpers.createClass(Bucket, [{
       key: 'putFile',
       value: function putFile(key, _file, options, callback) {
         var _arguments = arguments,
             _this = this;

         return new Promise(function (resolve, reject) {

           switch (_arguments.length) {
             case 3:
               if (utils.isFunction(options)) {
                 callback = options;
                 options = {};
               } else {
                 callback = noop$2;
               }
               break;
             case 2:
               options = {};
               callback = noop$2;
               break;
           }

           var config = utils.objExtend(utils.objClone(_this.config), options);

           var putToken = config.putToken;

           // upload API
           var uploadUrl = 'http://' + globalConfig.uploadUrl;

           // isIE
           var isIE = window.ActiveXObject ? true : false;

           var data = {
             token: putToken,
             key: key
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
             upload: function upload(xhr, _options) {
               (options.before && utils.isFunction(options.before) ? options.before : noop$2).call(null, xhr, key, _file);
             },
             progress: function progress(evt) {
               var totalPercent = evt.loaded / evt.total * 100;(options.progress && utils.isFunction(options.progress) ? options.progress : noop$2).call(null, totalPercent, evt.loaded, evt.total);
             },
             complete: function complete(err, evt) {
               if (err) {
                 callback(err);
                 return reject(err);
               }

               var reply = null;

               if (window.JSON) {
                 reply = JSON.parse(xhr.responseText);
               } else {
                 reply = xhr.responseText;
               }

               var asset = _this.key(key);

               callback(null, reply, asset, xhr, evt);
               resolve(reply, asset, xhr, evt);
             }
           });
         });
       }
     }, {
       key: 'putChunkedFile',
       value: function putChunkedFile(key, _file, options, callback) {
         var _this2 = this;

         return new Promise(function (resolve, reject) {
           var config = utils.objExtend(utils.objClone(_this2.config), options);

           var putToken = _this2.config.putToken;

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
                 }, function (err, reply) {
                   if (err) {
                     callback(err);
                     return reject(err);
                   }

                   var replyData = eval(reply);

                   blockCtxes.push(replyData.ctx);

                   var host = replyData.host;

                   loop(utils.format('%s/bput/%s/%s', host, replyData.ctx, end), end, _callback, host);
                 });
               } else {
                 return _callback(host);
               }
             })(uploadUrl, 0, function (host) {
               var asset = self.key(key);

               var url = utils.format('%s/rs-mkfile/%s/fsize/%s/mimeType/%s', host, asset.entryUrl(), _file.size, _file.type);

               if (options.params) {
                 url, utils.format('/params/%s');
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

               ajax.post();
             });
           } else {
             var err = 'no support chunk';

             reject(err);
             callback(err);
           }
         });
       }

       /**
        * Get a key
        * @param  {String}   key      key
        * @param  {Function} callback Callback
        * @return {Promise}           Promise Object
        */

     }, {
       key: 'getFile',
       value: function getFile(key) {
         var _this3 = this;

         var callback = arguments.length <= 1 || arguments[1] === undefined ? noop$2 : arguments[1];

         return new Promise(function (resolve, reject) {
           // token
           var getToken = _this3.config.getToken || '';

           // key url
           var url = null;
           if (_this3.config.url) {
             url = utils.format('%s/%s?e=3600&token=%s', _this3.url(), key, getToken);
           } else {
             url = utils.format('http://%s.qiniudn.com/%s?e=3600&token=%s', _this3.name, key, getToken);
           }

           ajax.get(url, function (err, body) {
             if (err) {
               callback(err);
               return reject(err);
             }

             callback(null, body);
             resolve(body);
           });
         });
       }
     }, {
       key: 'url',
       value: function url() {
         return this.config.url;
       }

       /**
        * return a asset object
        * @param  {String} key key
        * @return {Asset}      asset object
        */

     }, {
       key: 'key',
       value: function key(_key) {
         return new Asset$2(_key, this);
       }
     }, {
       key: 'image',
       value: function image(key) {
         return new _Image(key, this);
       }
     }]);
     return Bucket;
   }();

   Bucket$1.Image = _Image;

   function _Bucket (config) {
     globalConfig = config;
     Asset$2 = _Asset(config);
     return Bucket$1;
   }

   // Copyright Joyent, Inc. and other Node contributors.
   //
   // Permission is hereby granted, free of charge, to any person obtaining a
   // copy of this software and associated documentation files (the
   // "Software"), to deal in the Software without restriction, including
   // without limitation the rights to use, copy, modify, merge, publish,
   // distribute, sublicense, and/or sell copies of the Software, and to permit
   // persons to whom the Software is furnished to do so, subject to the
   // following conditions:
   //
   // The above copyright notice and this permission notice shall be included
   // in all copies or substantial portions of the Software.
   //
   // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
   // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
   // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
   // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
   // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
   // USE OR OTHER DEALINGS IN THE SOFTWARE.

   function EventEmitter() {
     this._events = this._events || {};
     this._maxListeners = this._maxListeners || undefined;
   }
   // Backwards-compat with node 0.10.x
   EventEmitter.EventEmitter = EventEmitter;

   EventEmitter.prototype._events = undefined;
   EventEmitter.prototype._maxListeners = undefined;

   // By default EventEmitters will print a warning if more than 10 listeners are
   // added to it. This is a useful default which helps finding memory leaks.
   EventEmitter.defaultMaxListeners = 10;

   // Obviously not all Emitters should be limited to 10. This function allows
   // that to be increased. Set to zero for unlimited.
   EventEmitter.prototype.setMaxListeners = function (n) {
     if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError('n must be a positive number');
     this._maxListeners = n;
     return this;
   };

   EventEmitter.prototype.emit = function (type) {
     var er, handler, len, args, i, listeners;

     if (!this._events) this._events = {};

     // If there is no 'error' event listener then throw.
     if (type === 'error') {
       if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
         er = arguments[1];
         if (er instanceof Error) {
           throw er; // Unhandled 'error' event
         }
         throw TypeError('Uncaught, unspecified "error" event.');
       }
     }

     handler = this._events[type];

     if (isUndefined(handler)) return false;

     if (isFunction(handler)) {
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
           args = Array.prototype.slice.call(arguments, 1);
           handler.apply(this, args);
       }
     } else if (isObject(handler)) {
       args = Array.prototype.slice.call(arguments, 1);
       listeners = handler.slice();
       len = listeners.length;
       for (i = 0; i < len; i++) {
         listeners[i].apply(this, args);
       }
     }

     return true;
   };

   EventEmitter.prototype.addListener = function (type, listener) {
     var m;

     if (!isFunction(listener)) throw TypeError('listener must be a function');

     if (!this._events) this._events = {};

     // To avoid recursion in the case that type === "newListener"! Before
     // adding it to the listeners, first emit "newListener".
     if (this._events.newListener) this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);

     if (!this._events[type])
       // Optimize the case of one listener. Don't need the extra array object.
       this._events[type] = listener;else if (isObject(this._events[type]))
       // If we've already got an array, just append.
       this._events[type].push(listener);else
       // Adding the second element, need to change to array.
       this._events[type] = [this._events[type], listener];

     // Check for listener leak
     if (isObject(this._events[type]) && !this._events[type].warned) {
       if (!isUndefined(this._maxListeners)) {
         m = this._maxListeners;
       } else {
         m = EventEmitter.defaultMaxListeners;
       }

       if (m && m > 0 && this._events[type].length > m) {
         this._events[type].warned = true;
         console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
         if (typeof console.trace === 'function') {
           // not supported in IE 10
           console.trace();
         }
       }
     }

     return this;
   };

   EventEmitter.prototype.on = EventEmitter.prototype.addListener;

   EventEmitter.prototype.once = function (type, listener) {
     if (!isFunction(listener)) throw TypeError('listener must be a function');

     var fired = false;

     function g() {
       this.removeListener(type, g);

       if (!fired) {
         fired = true;
         listener.apply(this, arguments);
       }
     }

     g.listener = listener;
     this.on(type, g);

     return this;
   };

   // emits a 'removeListener' event iff the listener was removed
   EventEmitter.prototype.removeListener = function (type, listener) {
     var list, position, length, i;

     if (!isFunction(listener)) throw TypeError('listener must be a function');

     if (!this._events || !this._events[type]) return this;

     list = this._events[type];
     length = list.length;
     position = -1;

     if (list === listener || isFunction(list.listener) && list.listener === listener) {
       delete this._events[type];
       if (this._events.removeListener) this.emit('removeListener', type, listener);
     } else if (isObject(list)) {
       for (i = length; i-- > 0;) {
         if (list[i] === listener || list[i].listener && list[i].listener === listener) {
           position = i;
           break;
         }
       }

       if (position < 0) return this;

       if (list.length === 1) {
         list.length = 0;
         delete this._events[type];
       } else {
         list.splice(position, 1);
       }

       if (this._events.removeListener) this.emit('removeListener', type, listener);
     }

     return this;
   };

   EventEmitter.prototype.removeAllListeners = function (type) {
     var key, listeners;

     if (!this._events) return this;

     // not listening for removeListener, no need to emit
     if (!this._events.removeListener) {
       if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
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

     if (isFunction(listeners)) {
       this.removeListener(type, listeners);
     } else if (listeners) {
       // LIFO order
       while (listeners.length) {
         this.removeListener(type, listeners[listeners.length - 1]);
       }
     }
     delete this._events[type];

     return this;
   };

   EventEmitter.prototype.listeners = function (type) {
     var ret;
     if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
     return ret;
   };

   EventEmitter.prototype.listenerCount = function (type) {
     if (this._events) {
       var evlistener = this._events[type];

       if (isFunction(evlistener)) return 1;else if (evlistener) return evlistener.length;
     }
     return 0;
   };

   EventEmitter.listenerCount = function (emitter, type) {
     return emitter.listenerCount(type);
   };

   function isFunction(arg) {
     return typeof arg === 'function';
   }

   function isNumber(arg) {
     return typeof arg === 'number';
   }

   function isObject(arg) {
     return (typeof arg === 'undefined' ? 'undefined' : babelHelpers.typeof(arg)) === 'object' && arg !== null;
   }

   function isUndefined(arg) {
     return arg === void 0;
   }

   var _configData = {
     uploadUrl: 'up.qiniu.com',
     rsUrl: 'rs.qbox.me',
     rsfUrl: 'rsf.qbox.me'
   };

   var Asset = _Asset(_configData);
   var Bucket = _Bucket(_configData);
   var qiniu = {};

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
   qiniu.config = function (key, value) {
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
             (function (_key) {
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
   qiniu.set = function (key, value) {
     _configData[key] = value;

     return this;
   };

   /**
    * Get config data
    * @param  {String} key   key
    * @return {Mix}          config value
    */
   qiniu.get = function (key) {
     return _configData[key];
   };

   /**
    * Binding the select button
    * @param  {HTMLElement} el      select button
    * @param  {Object} options options
    * @return {Object}         qiniu
    */
   qiniu.bind = function (el) {
     var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
     var chain = arguments[2];


     var eventHandler = createEventHandler();

     if (chain) {
       var events = ['file', 'over', 'out', 'dnd.success', 'dnd.error'];
       events.forEach(function (event) {
         return chain.on(event, function () {
           for (var _len = arguments.length, args = Array(_len), _key2 = 0; _key2 < _len; _key2++) {
             args[_key2] = arguments[_key2];
           }

           return eventHandler.emit.apply(eventHandler, [event].concat(args));
         });
       });
     }

     var css = ".qiniu-transparent { \
    z-index: 1000; \
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
     var html = '<div class="js-fileapi-wrapper qiniu-transparent"></div>';
     tmp.innerHTML = html;
     var wrapper = tmp.firstChild;

     if (el.jquery) {
       el.before(wrapper).addClass('select-btn');
     } else {
       var parentNode = el.parentNode;
       parentNode.insertBefore(wrapper, el);
     }

     var input = document.createElement('input');
     input.type = 'file';
     input.className = 'qiniu-transparent';
     input.multiple = true;

     wrapper.appendChild(input);

     el = el.jquery ? el.get(0) : el;

     utils.css(wrapper, {
       top: el.style.top,
       right: el.style.right,
       position: "absolute",
       width: el.offsetWidth + 5,
       height: el.offsetHeight + 5,
       margin: el.style.margin
     });
     utils.css(input, {
       width: el.offsetWidth + 5,
       height: el.offsetHeight + 5,
       position: 'relative'
     });

     file.event.on(input, 'change', function (evt) {
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
             files = file.filter(files, function (_file) {
               return filters[filter].test(_file.type);
             });
           }
           break;
         case utils.isArray(filter):
           for (var i = 0; i < filter.length; i++) {
             (function (index) {
               files = file.filter(files, function (_file) {
                 return filters[filter[index]].test(_file.type);
               });
             })(i);
           }
           break;
         case filter instanceof RegExp:
           files = file.filter(files, function (_file) {
             return filter.test(_file.type);
           });
           break;
       }

       for (var _i = 0; _i < files.length; _i++) {
         (function (index) {
           eventHandler.emit('file', _Image.extend(files[index]));
         })(_i);
       }
     });

     return eventHandler;
   };

   /**
    * Binding the drag and drop aera
    * @param  {HTMLElement} el      aera
    * @param  {Object} options options
    * @return {Object}         qiniu
    */
   qiniu.bind.dnd = function (el) {
     var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
     var chain = arguments[2];


     var eventHandler = createEventHandler();

     if (chain) {
       var events = ['file', 'over', 'out', 'dnd.success', 'dnd.error'];
       events.forEach(function (event) {
         return chain.on(event, function () {
           for (var _len2 = arguments.length, args = Array(_len2), _key3 = 0; _key3 < _len2; _key3++) {
             args[_key3] = arguments[_key3];
           }

           return eventHandler.emit.apply(eventHandler, [event].concat(args));
         });
       });
     }

     if (file.support.dnd) {
       file.event.dnd(el.jquery ? el.get(0) : el, function (files) {
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
               files = file.filter(files, function (_file) {
                 return filters[filter].test(_file.type);
               });
             }
             break;
           case utils.isArray(filter):
             for (var i = 0; i < filter.length; i++) {
               (function (index) {
                 files = file.filter(files, function (_file) {
                   return filters[filter[index]].test(_file.type);
                 });
               })(i);
             }
             break;
           case filter instanceof RegExp:
             files = file.filter(files, function (_file) {
               return filter.test(_file.type);
             });
             break;
         }

         for (var _i2 = 0; _i2 < files.length; _i2++) {
           (function (index) {
             eventHandler.emit('file', _Image.extend(files[index]));
           })(_i2);
         }
       });

       file.event.on(el.jquery ? el.get(0) : el, 'dragover dragleave', function (evt) {
         switch (evt.type) {
           case 'dragover':
             (options.over && utils.isFunction(options.over) ? options.over : noop).call(null);

             eventHandler.emit('over');
             break;
           case 'dragleave':
             (options.out && utils.isFunction(options.out) ? options.out : noop).call(null);

             eventHandler.emit('out');
         }
       });

       (options.success && utils.isFunction(options.success) ? options.success : noop).call(null);
       eventHandler.emit('dnd.success');
     } else {
       eventHandler.emit('dnd.error', 'no support');
       (options.error && utils.isFunction(options.error) ? options.error : noop).call(null, 'no support');
     }

     return eventHandler;
   };

   qiniu.supportDnd = file.support.dnd;

   qiniu.bucket = function (bucket, config) {
     return new Bucket(bucket, config);
   };

   qiniu.Asset = Asset;
   qiniu.Bucket = Bucket;
   qiniu.Image = _Image;

   utils.objExtend(qiniu, EventEmitter.prototype);
   EventEmitter.call(qiniu);

   function noop() {
     return false;
   }

   function createEventHandler() {
     var eventHandler = new EventEmitter();

     eventHandler.bind = function () {
       for (var _len3 = arguments.length, args = Array(_len3), _key4 = 0; _key4 < _len3; _key4++) {
         args[_key4] = arguments[_key4];
       }

       var restArgs = args.length === 1 ? [{}, eventHandler] : [eventHandler];

       args.push.apply(args, restArgs); // Chaining
       return qiniu.bind.apply(qiniu, args);
     };
     eventHandler.bind.dnd = function () {
       for (var _len4 = arguments.length, args = Array(_len4), _key5 = 0; _key5 < _len4; _key5++) {
         args[_key5] = arguments[_key5];
       }

       var restArgs = args.length === 1 ? [{}, eventHandler] : [eventHandler];

       args.push.apply(args, restArgs); // Chaining
       return qiniu.bind.dnd.apply(qiniu, args);
     };

     return eventHandler;
   }

   return qiniu;

}));
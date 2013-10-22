# 七牛 JavaScript SDK

该 SDK 用于构建网页前端的七牛云存储应用，支持文件上传、上传进度、上传预览、图片操作、Fop等功能。
处于安全需求，该 SDK 需要其余后端语言的 SDK 提供密钥生成支持。

## 平台支持
七牛 JavaScript SDK 支持一下浏览器平台

- IE 5.5-8 (Adobe Flash is required)
- IE 8-11
- Chrome
- Safari
- FireFox
- Opera
- Webkit 系平台

## 安装

你可以从 npm 进行安装

```shell
npm install qiniu.js
```

也可以从 Github 进行下载安装

```shell
$ git clone git://github.com/qiniu/qiniu.js
$ cd qiniu.js
$ npm install .
```

## 测试

你可以通过运行该 SDK 提供的 DEMO 进行测试。

```shell
$ make test
```

## 使用

### 配置 `qiniu.config()`

设置全局参数，包括必须的 AccessKey 和 SecretKey，还可以设置其他如 CallbackURL 等参数，将会顺延至所有空间。

```js
qiniu.config({
  foo: 'bar'
});
```

### 监听用户上传事件

#### `qiniu.bind(el, options)`

监听一个选择按钮的选择事件。

```
el
  可以是 jQuery 对象和 DOM 节点对象。

options{Object}
  filter{String}:  image, audio, video, media
  trigger{String/Array}: click, tap...
```

> 在 IE5.5-9 中，`options.trigger`只支持 click。

```js
qiniu.bind(document.getElementById('select'), {
  filter: 'image'
})
  .on('file', function(file) {
    // ...
  });
```

#### `qiniu.bind.dnd(el, options)`

监听一个元素的文件拖放事件。
文件拖放事件只支持现代浏览器，你可以用`qiniu.supportDnd`对象来检测当前客户端是否支持文件拖放事件。

```js
if (qiniu.supportDnd) {
  qiniu.bind.dnd(document.getElementById('select'))
    .on('over', function() {
      // ...
    })
    .on('out', function() {
      // ...
    })
    .on('file', function(file) {
      // ...
    });
}
```

#### Event `file`

当用户选择一个或多个文件时，每一个文件都会触发一次`file`事件。
你可以在此事件的回调函数中，进行上传、预览等事务。

```
qiniu.on('file', function(file) {
  
  // Image Preview
  file.imageView({
    mode: 1,
    width: 200,
    height: 200
  }, function(err, image) {
    // ...
  });

  // Upload
  imagesBucket.putFile('key', file, function(err, reply) {
    // ...
  });
});
```
#### Event `over`

当用户把文件从系统中拖放到指定元素中，但未放开时，便会触发`over`事件。

```js
qiniu.on('over', function() {
  // ...
});
```

#### Event `out`

当用户把文件从系统中拖放到指定元素中，在放开之前把文件移开，便会触发`out`事件。

```js
qiniu.on('out', function() {
  // ...
});
```

### Bucket

获得空间对象并进行操作。

```js
var imagesBucket = qiniu.bucket('qiniu-sdk-test', {
  putToken: '.....'
});
// 也可以这样操作
// var imagesBucket = new qiniu.Bucket('qiniu-sdk-test', {
  putToken: '.....'
});
```

#### 上传文件

**1. `Bucket.putFile()`**

上传一个文件，参数为将要上传的 Key，文件地址(可以是绝对地址，也可以是相对地址)，第三个为可选参数 options，即本次上传中所使用 PutToken 的特殊设置，第四个为可选参数回调(callback)，若不传入回调函数，将由 putFile 函数所返回的 Promise 对象进行响应。

```js
qiniu.on('file', function(file) {
  // 上传
  imagesBucket.putFile('exampleKey', file, function(err, reply) {
    if (err) {
      return console.error(err);
    }

    console.dir(reply);
  });

  // 七牛 JavaScript SDK 所提供的 Promise 对象遵循 Promise/A(+) 标准，使用 .then 方法进行响应
  imagesBucket.putFile('exampleKey_2', file)
    .then(
      function(reply) {
        // 上传成功
        console.dir(reply);
      },
      function(err) {
        // 上传失败
        console.error(err);
      }
    );
});
```

#### 下载文件

`Bucket.getFile()`

获取文件与上传文件同样简单。

```js
imagesBucket.getFile('exampleKey', function(err, data) {
  if (err) {
    return console.error(err);
  }

  // data 为包含文件数据的 Binary 字符串对象
});
```

### `Image` 图片操作

七牛 Node.js SDK 提供`Image`类，用于对图片资源进行操作。

使用 Bucket.image() 方法获取一个图像对象

```js
var image = imagesBucket.image('exampleKey');
```

#### `Image.imageInfo()`

Image.imageInfo 方法可以用于获取图片资源的图片信息。
详细请看：[http://docs.qiniu.com/api/v6/image-process.html#imageInfo](http://docs.qiniu.com/api/v6/image-process.html#imageInfo)

```js
image.imageInfo(function(err, info) {
  if (err) {
    return console.error(err);
  }

  console.dir(info);
});
```

#### `Image.exif()`

Image.imageView 方法用于生成指定规格的缩略图。
详细请看：[http://docs.qiniu.com/api/v6/image-process.html#imageView](http://docs.qiniu.com/api/v6/image-process.html#imageView)

```js
image.exif(function(err, exif) {
  if (err) {
    return console.error(err);
  }

  console.dir(exif);
});
```

#### `Image.imageView()`

Image.imageView 方法用于生成指定规格的缩略图。
详细请看：[http://docs.qiniu.com/api/v6/image-process.html#imageView](http://docs.qiniu.com/api/v6/image-process.html#imageView)

```js
image.imageView({
  mode    : 2,
  width   : 180,
  height  : 180,
  quality : 85,
  format  : 'jpg'
}, function(err, image) {
  if (err) {
    return console.error(err);
  }

  // image 为处理过后的图像 DOM 元素
});
```

#### `Image.imageMogr()`

Image.imageMogr 方法用于调用高级图像处理接口，并返回处理后的图片数据。
详细请看：[http://docs.qiniu.com/api/v6/image-process.html#imageMogr](http://docs.qiniu.com/api/v6/image-process.html#imageMogr)

```js
image.imageMogr({
  thumbnail : '300x500',
  gravity   : 'NorthWest',
  crop      : '!300x400a10a10',
  quality   : 85,
  rotate    : 90,
  format    : 'jpg'
}, function(err, image) {
  if (err) {
    return console.error(err);
  }

  // 使用 image 进行操作
});
```

#### `Image.watermark()`

Image.watermark 方法用于生成一个带有水印的图片，图片水印 API 支持图片水印和文字水印两种模式。
详细请看：http://docs.qiniu.com/api/v6/image-process.html#watermark

```js
image.watermark({
  mode: 1,
  image: 'http://www.b1.qiniudn.com/images/logo-2.png',
  dissolve: 70,
  gravity: 'SouthEast',
  dx: 20,
  dy: 20
}, function(err, image) {
  if (err) {
    return console.error(err);
  }

  // 使用 image 进行操作
});
```

#### `Image.alias()`

Image.alias 方法用于返回既定的数据处理格式的数据，使用此方法需要在[七牛开发者平台](https://portal.qiniu.com)中对设置进行操作。
其中，`Image.alias()`方法继承于 key 所用的`Asset`类。

```js
image.alias('testalias', function(err, image) {
  if (err) {
    return console.error(err);
  }

  // 使用 image 进行操作
});
```

### `Asset` 资源操作

七牛 Node.js SDK 提供一个`Asset`类，用于对所属资源进行操作。

获取 key 所对应资源对象
```js
var picture = imagesBucket.key('exampleKey');
```

#### `Asset.url()`

`Asset.url()`方法可以获得该资源的 URL 地址以用于访问

```js
var picUrl = picture.url();
```

#### `Asset.entryUrl()`

`Asset.entryUrl()`方法可以获得该资源用于 API 调用时所需的 EncodedEntryURL。
但是在 Node.js SDK 中，大部分 API 都不需要开发者自行使用。:)

```js
var encodedPicUrl = picture.entryUrl();
```

### `Fop` 管道操作

七牛云存储提供一个非常实用的资源处理 API，可以用于对资源进行多种处理的操作。

例: 将一个原图缩略，然后在缩略图上打上另外一个图片作为水印

使用`Asset.fop()`方法创建 Fop 管道操作器，并进行操作。

```js
var image = imagesBucket.key('exampleKey');
// Image.fop 方法继承于 Asset 类

image.fop()
  // 对图片进行缩略
  .imageView({
    mode   : 2,
    height : 200
  })
  // 为图片打上水印
  .watermark({
    mode  : 1,
    image : 'http://www.b1.qiniudn.com/images/logo-2.png'
  })
  // 执行操作
  .image(function(err, image) {
    if (err) {
      return console.error(err);
    }

    // image 为已打上水印的缩略图 DOM 对象
  });
```

## License 

    (The MIT License)
    
    Copyright (c) 2010-2013 Will Wen Gunn <willwengunn@gmail.com> and other contributors
    
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    'Software'), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:
    
    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

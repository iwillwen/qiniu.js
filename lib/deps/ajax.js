import utils from '../utils'

function createXHR() {
  if (window.ActiveXObject) {
    var xhr = new ActiveXObject("Microsoft.XMLHTTP");
  } else if(window.XMLHttpRequest) {
    var xhr = new XMLHttpRequest();
  }

  return xhr;
}

var ajax = {};

ajax.get = function(url, callback) {
  var xhr = createXHR();

  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return

    if (xhr.status == 200) {
      callback(null, xhr.responseText)
    } else if (xhr.status != 304) {
      callback(true)
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

export default ajax
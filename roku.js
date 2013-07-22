var sax = require('sax'),
    request = require('request'),
    async = require('async'),
    qs = require('querystring');


function Roku(url) {
  this.baseUrl = url;
  this.commandQueue = [];
  this.queued = false;
}

// Define key constants
[
'Home',
'Rev',
'Fwd',
'Play',
'Select',
'Left',
'Right',
'Down',
'Up',
'Back',
'InstantReplay',
'Info',
'Backspace',
'Search',
'Enter',
].forEach(function(name) {
  Object.defineProperty(Roku, name.toUpperCase(), {
    enumerable: true,
    value: name
  });
});

Roku.prototype.type = function(string, fn) {
  var press = this.press.bind(this);

  string.split('').forEach(function(key) {
    press('Lit_' + escape(key), fn);
  }, fn);
};

Roku.prototype.press = function(string, fn) {
  this.commandQueue.push(function(callback) {
    request.post(this.baseUrl + 'keypress/' + string, callback);
  }.bind(this));

  this.processQueue();
};

Roku.prototype.delay = function(ms, fn) {
  this.commandQueue.push(function(callback) {
    setTimeout(function() {
      fn && fn();
      callback();
    }, ms);
  });

  this.processQueue();
};


// TODO: need better tests for this, not sure if it's actually working
Roku.prototype.input = function(obj, fn) {
  var url = this.baseUrl + 'input?' + qs.stringify(obj);
  request.post(url, function(e, r, b) {
    fn && fn(e);
  });
};

Roku.prototype.apps = function(fn) {
  var parser = sax.createStream();
  request.get(this.baseUrl + 'query/apps').pipe(parser).on('error', fn);

  var result = [], pending = null;
  parser.on('opentag', function(node) {
    if (node.name === 'APP') {
      pending = {
        id: parseInt(node.attributes.ID, 10),
        version: node.attributes.VERSION
      };
    }
  });

  parser.on('text', function(name) {
    name = name.trim();
    if (pending && name) {
      pending.name = name;
      result.push(pending);
      pending = null;
    }
  });

  parser.on('end', function() {
    fn(null, result);
  });
};

Roku.prototype.createIconStream = function(appId) {
  return request.get(this.baseUrl + 'query/icon/' + appId);
};

Roku.prototype.launch = function(name, fn) {
  var baseUrl = this.baseUrl;
  if (name.indexOf('://') > -1) {

    this.commandQueue.push(function(callback) {
      request({
        url: name,
        method: 'HEAD'
      }, function(e, res, body) {

        var url = baseUrl + 'launch/dev?' + qs.stringify({
          url: name,
          streamformat : res.headers['content-type'].split('/').pop(),
        });

        request.post(url, function(e, r, b) {
          callback(e)
          fn && fn(e)
        });
      });
    }.bind(this));
  } else {
    this.commandQueue.push(function(callback) {

      name = name.toLowerCase();
      this.apps(function(e, results) {
        if (e) return fn(e);

        for (var i=0; i<results.length; i++) {
          if (results[i].name.toLowerCase() === name) {
            request.post(baseUrl + 'launch/' + results[i].id, function(e, r, b) {
              callback(e)
              fn && fn(e)
            });
            break;
          }
        }
      });
    }.bind(this));
  }

  this.processQueue();
};

Roku.prototype.info = function(fn) {
  var parser = sax.createStream({ strict: true });
  request.get(this.baseUrl).pipe(parser).on('error', fn);

  var ret = {}, where = [], currentNode;

  parser.on('opentag', function(node) {
    where.unshift({});
    currentNode = node;
  });

  parser.on('text', function(value) {
    value = value.trim();
    if (value && currentNode) {
      ret[currentNode.name] = value;
    }
  });

  parser.on('end', function() {
    fn(null, ret);
  });
};

Roku.prototype.processQueue = function() {
  var that = this;
  if (!this.queued) {
    var queue = this.commandQueue;
    this.queued = true;
    async.whilst(function() {
      return queue.length;
    }, function(fn) {
      queue.shift()(fn)
    }, function() {
      that.queued = false;
    })
  }
};


module.exports = Roku;
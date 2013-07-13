var sax = require('sax'),
    request = require('request'),
    async = require('async');


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

Roku.prototype.apps = function(fn) {
  var parser = sax.createStream();
  request.get(this.baseUrl + 'query/apps').pipe(parser).on('error', fn);

  var result = [], pending = null;
  parser.on('opentag', function(node) {
    if (node.name === 'APP') {
      pending = {
        id: parseInt(node.attributes.ID, 10)
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

Roku.prototype.launch = function(name, fn) {
  console.log(arguments);
  this.commandQueue.push(function(callback) {
    var baseUrl = this.baseUrl;
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

  this.processQueue();
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
var ssdp = new (require('node-ssdp'))()
var Roku = require('../roku.js');
var fs = require('fs');
var async = require('async')

ssdp.once('response', function inResponse(msg, rinfo) {
  var location = msg.toString().match(/Location: (.*)/i)[1].trim();

  var device = new Roku(location);

  device.apps(function(e, apps) {
    if (e) throw e;

    async.each(apps, function(app, fn) {
      console.log('fetching', app.name + "'s", 'icon');
      var ws = fs.createWriteStream(__dirname + '/' + app.id + '.png');
      var rs = device.createIconStream(app.id)

      rs.pipe(ws)
      rs.on('end', fn);
    }, function() {
      console.log('done');
      process.exit(0);
    });
  });
});

ssdp.search('roku:ecp');
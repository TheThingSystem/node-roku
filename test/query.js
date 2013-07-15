var ssdp = new (require('node-ssdp'))()
var Roku = require('../roku.js');

ssdp.once('response', function inResponse(msg, rinfo) {
  var location = msg.toString().match(/Location: (.*)/i)[1].trim();

  var device = new Roku(location);

  device.apps(function(e, apps) {
    if (e) throw e;

    console.log('installed apps:')
    apps.forEach(function(app) {
      console.log(app.id + ':\t', app.name, '(v' + app.version + ')');
    });

    process.exit(0);
  });
});

ssdp.search('roku:ecp');

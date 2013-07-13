var ssdp = new (require('node-ssdp'))()
var Roku = require('../roku.js');

ssdp.once('response', function inResponse(msg, rinfo) {
  var location = msg.toString().match(/Location: (.*)/i)[1].trim();

  var device = new Roku(location);

  device.press(Roku.HOME);
  device.delay(1000);

  device.launch('pandora', function() {
    process.exit(0);
  });
});

ssdp.search('roku:ecp');

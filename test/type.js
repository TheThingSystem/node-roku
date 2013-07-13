var ssdp = new (require('node-ssdp'))()
var Roku = require('../roku.js');

ssdp.once('response', function inResponse(msg, rinfo) {
  var location = msg.toString().match(/Location: (.*)/i)[1].trim();

  var device = new Roku(location);
  device.press(Roku.HOME);
  device.delay(2000);
  device.press(Roku.DOWN);
  device.press(Roku.DOWN);
  device.press(Roku.SELECT);

  device.type("pandora");

  device.delay(1500);

  device.press(Roku.RIGHT);
  device.press(Roku.RIGHT);
  device.press(Roku.RIGHT);
  device.press(Roku.RIGHT);
  device.press(Roku.RIGHT);
  device.press(Roku.RIGHT);
  device.press(Roku.UP);
  device.press(Roku.SELECT);

  device.delay(1000);
  device.press(Roku.SELECT);
  device.delay(5000);
  device.press(Roku.SELECT);
  device.delay(10, process.exit);
});

ssdp.search('roku:ecp');

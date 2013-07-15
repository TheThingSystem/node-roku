var ssdp = new (require('node-ssdp'))()
var Roku = require('../roku.js');

ssdp.once('response', function inResponse(msg, rinfo) {
  var location = msg.toString().match(/Location: (.*)/i)[1].trim();

  var device = new Roku(location);

  device.info(function(e, obj) {
    console.log(obj);
  });
});

ssdp.search('roku:ecp');
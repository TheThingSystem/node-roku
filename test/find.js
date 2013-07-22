var ssdp = new (require('node-ssdp'))()
var Roku = require('../roku.js');

ssdp.once('response', function inResponse(msg, rinfo) {
  var location = msg.toString().match(/Location: (.*)/i)[1].trim();
  console.log('roku found at', location);
  process.exit(0);
});

ssdp.search('roku:ecp');

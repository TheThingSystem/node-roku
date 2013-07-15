var ssdp = new (require('node-ssdp'))()
var Roku = require('../roku.js');

ssdp.once('response', function inResponse(msg, rinfo) {
  var location = msg.toString().match(/Location: (.*)/i)[1].trim();

  var device = new Roku(location);

  device.input({
    'touch.0.x' : 200.0,
    'touch.0.y' : 135.0,
    'touch.0.op' : 'down'
  });

  device.input({
    'orientation.x' : .5,
    'orientation.y' : .5,
    'orientation.z' : .5
  });

  device.input({
    'magnetic.x' : 100,
    'magnetic.y' : 0,
    'magnetic.z' : 0
  });


  device.input({
    'rotation.x' : .5,
    'rotation.y' : .5,
    'rotation.z' : .5
  });
});

ssdp.search('roku:ecp');
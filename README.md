roku
====

wrapper around the roku "external control" api

## install

`npm install roku`

## use

```javascript

var ssdp = new (require('node-ssdp'))()
var Roku = require('roku/roku.js');

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

```

[more examples](https://github.com/tmpvar/node-roku/tree/master/test)

## api

### type(string [, fn])

Types the provided string into a field

### press(button)

Simulates a button press on the remote control

### delay(ms)

Add a delay into the command queue to allow the roku to keep up with what you want to do.

### input(obj)

Pass arguments into the currently running app. see [test/input.js](https://github.com/tmpvar/node-roku/blob/master/test/input.js)

### apps(function(err, array) {});

list the installed apps on the roku

### createIconStream(appId)

create a PNG stream

### launch(string)

Using the `launch` command you can open application or allow a development application handle the protocol.

see the example code in [test/launch.js](https://github.com/tmpvar/node-roku/blob/master/test/launch.js) and [test/dev-video.js](https://github.com/tmpvar/node-roku/blob/master/test/dev-video.js)

### info(function(err, obj) {});

returns an object of information about the roku

example object:

```

{ major: '1',
  minor: '0',
  deviceType: 'urn:roku-com:device:player:1-0',
  friendlyName: 'Roku Streaming Player',
  manufacturer: 'Roku',
  manufacturerURL: 'http://www.roku.com/',
  modelDescription: 'Roku Streaming Player Network Media',
  modelName: 'Roku Streaming Player 4200X',
  modelNumber: '4200X',
  modelURL: 'http://www.roku.com/',
  serialNumber: '1GH35D054697',
  UDN: 'uuid:31474833-3544-a9d5-0000-05006d1f0000',
  serviceType: 'urn:roku-com:service:ecp:1',
  serviceId: 'urn:roku-com:serviceId:ecp1-0',
  SCPDURL: 'ecp_SCPD.xml' }

```


## license

[MIT](http://tmpvar.mit-license.org)

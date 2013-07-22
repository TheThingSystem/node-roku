/*
In order to use this you'll want to grab the roku development sdk:
http://wwwimg.roku.com/static/sdk/RokuSDK.zip

After extracting, you'll want to enable developer mode:
http://sdkdocs.roku.com/display/sdkdoc/Developer+Guide#DeveloperGuide-52ApplicationSecurity

Now you can install the `samplevideoplayer` found in the extracted RokuSdk.zip folder

1. find your roku
node node-roku/test/find.js

2. install the sample app
in a browser go to the ip found in step #1 on port 80 (e.g http://192.168.0.8:80/)

3. upload samplevideoplayer.zip

4. run this script

by default when running this code it will launch a ted talk, but you can provide it with any sort of mp4 hosted online.

node node-roku/test/dev-video.js

or

node node-roku/test/dev-video.js http://video2.research.att.com/pub/United_Way_2011_1000kbps_640x380.mp4

*/



var ssdp = new (require('node-ssdp'))()
var Roku = require('../roku.js');

ssdp.once('response', function inResponse(msg, rinfo) {
  var location = msg.toString().match(/Location: (.*)/i)[1].trim();

  var device = new Roku(location);

  device.press(Roku.HOME);
  device.delay(1000);

  device.launch(process.argv[2] || 'http://video.ted.com/talks/podcast/VilayanurRamachandran_2007_480.mp4', function() {
  });
});

ssdp.search('roku:ecp');

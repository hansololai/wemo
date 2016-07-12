var Server = require('node-ssdp').Server
      , server = new Server({
       // location:require('ip').address()+'/setup.xml',
      })
    ;

     //server.addUSN('upnp:rootdevice');
     //server.addUSN('urn:schemas-upnp-org:device:MediaServer:99');
    // server.addUSN('urn:schemas-upnp-org:service:ContentDirectory:1');
    // server.addUSN('urn:schemas-upnp-org:service:ConnectionManager:1');
    // server.addUSN('urn:schemas-upnp-org:service:ConnectionManager:1');
    server.addUSN('urn:Belkin:device:**');



    // start the server
    server.start();

    process.on('exit', function(){
      server.stop() // advertise shutting down and stop listening
    })
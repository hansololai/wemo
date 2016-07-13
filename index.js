var Server = require('node-ssdp').Server;
var Device=require('./device')

     //server.addUSN('upnp:rootdevice');
     //server.addUSN('urn:schemas-upnp-org:device:MediaServer:99');
    // server.addUSN('urn:schemas-upnp-org:service:ContentDirectory:1');
    // server.addUSN('urn:schemas-upnp-org:service:ConnectionManager:1');
    // server.addUSN('urn:schemas-upnp-org:service:ConnectionManager:1');
    
Server.prototype.addDevice=function(device){
  this.devices=this.devices ||{};
  this.devices[device.name]=device;
  device.activate();
}
Server.prototype._respondToSearch = function (serviceType, rinfo) {
  var self = this
  , peer = rinfo.address
  , port = rinfo.port
  , stRegex
  , acceptor
  console.log(serviceType)
  // unwrap quoted string
  if (serviceType[0] == '"' && serviceType[serviceType.length-1] == '"') {
    serviceType = serviceType.slice(1, -1)
  }

  if (self._allowWildcards) {
    stRegex = new RegExp(serviceType.replace(/\*/g, '.*') + '$')
    acceptor = function(usn, udn,serviceType) {
      return serviceType === 'ssdp:all' || stRegex.test(usn) || stRegex.text(udn);
    }
  } else {
    acceptor = function(usn,udn, serviceType) {
      return serviceType === 'ssdp:all' || usn === serviceType || udn.indexOf(serviceType)>-1;
    }
  }
  Object.keys(self.devices).forEach(function (usn) {
    var udn = self.devices[usn].udn
    if (self._allowWildcards) {
      udn = udn.replace(stRegex, serviceType)
    }
    var _serviceType=serviceType
    if (serviceType.startsWith("urn:")){
      _serviceType=serviceType.substring(4);
    }
    if (acceptor(usn, udn,_serviceType)) {
      var pkt="";
      if(self.devices[usn].searchResponse instanceof Function){
        pkt=self.devices[usn].searchResponse(serviceType,usn,udn)
      }else{
        pkt = self._getSSDPHeader(
        '200 OK',
        {
          'ST': serviceType === 'ssdp:all' ? usn : serviceType,
          'USN': udn,
          'LOCATION': self._location,
          'CACHE-CONTROL': 'max-age=' + self._ttl,
          'DATE': new Date().toUTCString(),
          'SERVER': self._ssdpSig,
          'EXT': ''
        },
        true
        )
      }
      self._logger('Sending a 200 OK for an M-SEARCH: %o', {'peer': peer, 'port': port})

      var message = new Buffer(pkt)

      self._send(message, peer, port, function (err, bytes) {
        self._logger('Sent M-SEARCH response: %o', {'message': pkt})
      })
    }
  })
}

 server = new Server({
       // location:require('ip').address()+'/setup.xml',
     });
 server.start();
    process.on('exit', function(){
      server.stop() // advertise shutting down and stop listening
    })
 var light=new Device({name:"kitchen light"});
 var door=new Device({name:"door"});
 console.log(light);
 server.addDevice(light)
 server.addDevice(door)
    // start the server
    
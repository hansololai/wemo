var uuid=require('uuid4');
var XML_TEMPLATE=function(name,device_serial){
	return "<?xml version=\"1.0\"?> \
<root>\
  <device>\
    <deviceType>urn:MakerMusings:device:controllee:1</deviceType>\
    <friendlyName>"+name+"</friendlyName>\
    <manufacturer>Belkin International Inc.</manufacturer>\
    <modelName>Emulated Socket</modelName>\
    <modelNumber>3.1415</modelNumber>\
    <UDN>uuid:Socket-1_0-"+device_serial+"</UDN>\
  </device>\
</root>"
}


_=require('lodash');
var Device=function(options){
	this.name=options.name;
	this.port=options.port ||0 ;
	this.ip_address=options.ip_address || this.getIp();
	this.root_url="http://"+this.ip_address;
	this.path=options.setup_xml||"/setup.xml";
	this._location=this.root_url+":"+this.port+this.path
	this._ttl=options._ttl || 86400;
	this.serial=this.make_uuid(this.name);
	this.uuid=uuid();
	this.persistent_uuid="Socket-1_0-"+this.serial;
	this.udn="uuid:"+this.persistent_uuid+"::urn:Belkin:device:**";
	//this.udn="uuid:Socket-1_0-5916b697463686::urn:Belkin:device:**"
	this.actionHandler=options.actionHandler||{
		"on":function(){console.log("turned on");return true},
		"off":function(){console.log("turned off");return true}
	}

	var self=this;
	this.httpServer=require('http').createServer((req,res)=>{
		console.log("received request ", req.url);
		if (req.url.indexOf("/setup.xml")==0){
			// Return the xml file
			res.writeHead(200,{
				"CONTENT-TYPE":"text/xml",
				"SERVER":"Unspecified, UPnP/1.0, Unspecified"
			})
			console.log("writing response");
			res.write(XML_TEMPLATE(self.name,self.serial))
			res.end();
			
		}else if(req.headers["soapaction"]=="\"urn:Belkin:service:basicevent:1#SetBinaryState\""){
			console.log("control");
			res.writeHead(200,{
			   "CONTENT-LENGTH": 0,
               "CONTENT-TYPE": "text/xml charset=\"utf-8\"",
               "DATE": new Date().toUTCString(),
               "EXT":"",
               "SERVER": "Unspecified, UPnP/1.0, Unspecified",
               "X-User-Agent": "redsonic",
               "CONNECTION": "close"
			})
			res.end();
		}else{
			res.writeHead(200,{
			   "CONTENT-LENGTH": 0,
               "CONTENT-TYPE": "text/xml charset=\"utf-8\"",
               "DATE": new Date().toUTCString(),
               "EXT":"",
               "SERVER": "Unspecified, UPnP/1.0, Unspecified",
               "X-User-Agent": "redsonic",
               "CONNECTION": "close"
			})
			console.log(req.headers["soapaction"]);
			console.log("pass")
			res.end();
		}
	});
	
}

Device.prototype.getIp=function(){
	var interfaces=require('os').networkInterfaces();
	var toReturn=interfaces['eth0']||interfaces['Ethernet'];
	if (toReturn){
		toReturn=_.find(toReturn,function(i){
			if (i['family'].toLowerCase()=="ipv4") return true;
		});
		toReturn=toReturn['address'];
	}

	toReturn=toReturn || "127.0.0.1";
	
	this.ip_address=toReturn;
	return toReturn;

}

Device.prototype.activate=function(){
	var self=this;
	console.log("listening",self.port,self.root_url);
	this.httpServer.listen({
		host:self.ip_address,
		port:self.port
	},function(){
		self.port=self.httpServer.address().port;
		self._location=self.root_url+":"+self.port+self.path
		console.log(self.port);
	})
}

Device.prototype.make_uuid=function(name){
	var codes=[]
	codes.push(_.sumBy(name,(e)=>{return e.charCodeAt(0)}));
	_.forEach("fakewemo",function(c){
		codes.push(c.charCodeAt(0));
	});
	return codes.join("").substring(0,14);

}
Device.prototype.searchResponse=function(serviceType){
	var self=this;
	var header={
          "CACHE-CONTROL": "max-age=86400",
          'DATE': new Date().toUTCString(),
          'EXT':'',
          'LOCATION': self._location,
          'CACHE-CONTROL': 'max-age=' + self._ttl,
          "OPT": '\"http://schemas.upnp.org/upnp/1/0/\"; ns=01',
          "01-NLS": self.uuid,
          'SERVER': "Unspecified, UPnP/1.0, Unspecified",
          'ST': serviceType === 'ssdp:all' ? usn : serviceType,
          'USN': self.udn,
          'X-User-Agent':'redsonic'
      }
    var message =[]
    message.push("HTTP/1.1 200 OK")
    Object.keys(header).forEach(function(h){
    	message.push(h+":"+header[h]);
    })
     var pkg=message.join("\r\n")
     pkg+="\r\n";
     pkg+="\r\n";
    // pkg.append(XML_TEMPLATE())
    console.log(pkg);
    return pkg;
}


// var d=new Device({
// 	name:"lights",
// 	port:9001,
// 	root_url:"127.0.0.1"
// })

// d.activate();

module.exports=Device;
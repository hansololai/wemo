# wemo emulator in nodejs

** Emulate Belkin WeMo devices that can be discovered and controlled by Amazon Echo **

This work refer to makermusings who did all the sniffing and found out the protocol.

Original article: [this Maker Musings article](http://www.makermusings.com/2015/07/13/amazon-echo-and-home-automation/)

python package: [fauxmo](https://github.com/makermusings/fauxmo)


This is a demo to show how it is ported to nodejs. It is not in npm.

download the zip file and unzip. 

`npm install` to install necessary packages

`node index.js` will start the demo with a kitchen light and door. 

(set enviroment variable DEBUG to see some output) e.g.

`DEBUG=* node index.js`

or in Windows:

`set DEBUG=*`
`node index.js`

Check the `device.js` to see how it is implemented. 

Currently only support binary state changes, i.e. only "turn on" "turn off"



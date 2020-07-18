const WebSocket = require('ws');
const SerialPort = require('serialport');

const serialport = new SerialPort('/dev/ttyO1');

const init = () => {
  const ws = new WebSocket('ws://192.168.43.253:1880/ws');

  ws.on('message', (data) => {
    serialport.write(data);
  });

  ws.on('close', () => {
    setTimeout(() => {
      console.log('retrying');
      init();
    }, 1000);
  });
};

init();

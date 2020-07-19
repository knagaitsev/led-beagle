const WebSocket = require('ws');
const SerialPort = require('serialport');
let config = {};
try {
  config = require('./config.json');
} catch (e) {

}

const serialport = new SerialPort('/dev/ttyS1');

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const init = () => {
  const prodUrl = config.prodUrl;
  const devUrl = config.devUrl;

  let url = prodUrl;
  if (config.dev) {
    url = devUrl;
  }
  const ws = new WebSocket(`ws://${url}:9000/ws`);

  ws.on('message', async (data) => {
    for (let i = 0; i < data.length; i++) {
      console.log(data.charCodeAt(i));
    }
    serialport.write(data);
  });

  ws.on('close', () => {
    setTimeout(() => {
      console.log('retrying');
      init();
    }, 1000);
  });

  ws.on('error', (e) => {
    console.log(e);
  })
};

init();

const { exec } = require('child_process');
const WebSocket = require('ws');
const SerialPort = require('serialport');
let config = {};
try {
  config = require('./config.json');
} catch (e) {

}

exec('config-pin P9_24 uart');
const serialport = new SerialPort('/dev/ttyS1');

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const init = (url) => {
  const ws = new WebSocket(`ws://${url}:9000/ws`);

  ws.on('message', async (data) => {
    for (let i = 0; i < data.length; i++) {
      console.log(data.charCodeAt(i));
    }
    serialport.write(data);
  });

  ws.on('close', () => {
    setTimeout(() => {
      // console.log('retrying');
      init(url);
    }, 1000);
  });

  ws.on('error', (e) => {
    // console.log(e);
  })
};

init(config.prodUrl);
init(config.devUrl);

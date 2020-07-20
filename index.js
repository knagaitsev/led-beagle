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

const init = (url, prod) => {
  const ws = new WebSocket(`ws://${url}:9000/ws`);

  let killTimeout;

  ws.on('message', async (data) => {
    if (data === 'ping') {
      clearTimeout(killTimeout);
      return;
    }

    for (let i = 0; i < data.length; i++) {
      console.log(data.charCodeAt(i));
    }
    serialport.write(data);
  });

  const pingInterval = setInterval(() => {
    ws.send('ping');
    killTimeout = setTimeout(() => {
      ws.close();
    }, 10000);
  }, 20000);

  let retryTimeout;
  const retry = () => {
    clearTimeout(retryTimeout);
    retryTimeout = setTimeout(() => {
      // console.log('retrying');
      clearInterval(pingInterval);
      init(url, prod);
    }, 1000);
  };

  ws.on('close', () => {
    retry();
  });

  ws.on('error', (e) => {
    retry();
    if (prod) {
      console.log(e);
    }
    ws.close();
  });
};

init(config.prodUrl, true);
init(config.devUrl, false);

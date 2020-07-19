const WebSocket = require('ws');
const SerialPort = require('serialport');

const serialport = new SerialPort('/dev/ttyS1');

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const init = () => {
  const ws = new WebSocket('ws://192.168.1.2:1880/ws');

  ws.on('message', async (data) => {
    for (let i = 0; i < data.length; i++) {
      serialport.write(data.charAt(i));
      console.log(data.charCodeAt(i));

      await delay(100);
    }
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

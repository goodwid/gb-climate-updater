require('dotenv').config();

const mqtt = require('mqtt');
const moment = require('moment');
const gb = require('geckoboard')(process.env.API_KEY);

function timestamp() {
  return moment().toISOString();
};

const client = mqtt.connect(process.env.MQTT_SERVER);

const dataset = {
  id: 'livingroomclimate.byminute',
  fields: {
    fahrenheit: {
      type: 'number',
      name: 'Fahrenheit',
      optional: false
    },
    celsius: {
      type: 'number',
      name: 'Celsius',
      optional: false
    },
    pressure: {
      type: 'number',
      name: 'millibars',
      optional: false
    },
    humidity: {
      type: 'number',
      name: 'percent',
      optional: false
    },
    timestamp: {
      type: 'datetime',
      name: 'time'
    }
  },
  unique_by: ['timestamp']
};
let climate;


gb.datasets.findOrCreate(dataset, (err, response) => {
  if (err) console.log('Create error: ', err);
  climate = response;
});

client.on('connect', () => {
  client.subscribe('homeassist/sensors/temp2');
  console.log('Connected to mqtt server.');
});

client.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());
  data.timestamp = timestamp();
  const output = JSON.stringify(data)
  climate.post([data], null, err => {
    if (err) console.log('POST error: ', err);
  });
});
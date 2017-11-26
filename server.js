const http = require('http');
const gpio = require('rpi-gpio');

const channels = [
  {
    pin: 7,
    name: 'Channel 1',
    color: 'red',
  },
  {
    pin: 8,
    name: 'Channel 2',
    color: 'green',
  },
  {
    pin: 25,
    name: 'Channel 3',
    color: 'white',
  },
  {
    pin: 24,
    name: 'Channel 4',
    color: 'blue',
  },
];

// Initialize the GPIO
setupPins();

// Create the server
http.createServer(requestHandler).listen(8080);

function setupPins() {
  // Set the pin numbering scheme to BCM
  gpio.setMode(gpio.MODE_BCM);

  // This variable is used to count how many times the setup function has returned
  var setup_count = {
    count: 0,
  };

  // Loop through all of the setup
  channels.forEach(function(channel) {
    gpio.setup(channel.pin, gpio.DIR_HIGH, setupPinsCallback);
  });
}

function setupPinsCallback(error) {
  // Log the error if needed
  if (error) {
    console.log(error);
  }
}

function requestHandler(request, response) {
  // Build the request body
  var request_body = '';
  request.on('data', function(data) {
    request_body += data;
  });

  // Parse the request
  request.on('end', function() {
    // Check the url
    switch (request.url) {
      case '/status':
        // Get the status of the channels
        getChannelStatus(response);
        break;
      default:
        response.writeHead(404);
        return response.end();
    }
  });
}

function getChannelStatus(response) {
  // Create the callback function
  var callback_function;

  // Loop through the channels
  channels.forEach(function(channel) {
    // Delete the old value
    delete channel.state;

    // Set up the callback function
    callback_function = channelStatusCallback.bind(undefined, response, channel);

    // Get the new value
    gpio.read(channel.pin, callback_function);
  });
}

function channelStatusCallback(response, channel, error, state) {
  // Check for an error and log it
  if (error) {
    console.log(error);
  }

  // Set the channel state
  channel.state = state || false;

  // Check for writing to the response
  var is_complete = true;
  channels.forEach(function(channel) {
    if (typeof channel.state === 'undefined') {
      is_complete = false;
    }
  });

  if (is_complete) {
    response.writeHead(200);
    return response.end(JSON.stringify(channels));
  }
}

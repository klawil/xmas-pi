const express = require('express');
const body_parser = require('body-parser');
const app = express();
const gpio = require('./control.js');

app.use(body_parser.json());
app.use(body_parser.urlencoded({
  extended: true,
}));

// Initialize the GPIO
gpio.setup();

/**
 * This function handles the google assistant requests
 * @param  {Object} request  The request object
 * @param  {Object} response The response object
 */
function googleAssistantHandler(request, response) {
  // Get the body of the request
  request = request.body;

  // Build the basic response object
  var response_object = {
    speech: 'This is a test response.',
    displayText: 'This is a test text response',
    data: {
      google: {
        expect_user_response: false,
        is_ssml: false,
      }
    }
  };

  switch (request.result.action) {
    case 'light_control':
      // Get the channels that have the correct color
      channels = gpio.getChannelsByColor(request.result.parameters.color);
      if (channels.length === 0) {
        response_object.speech = 'It looks like there is no lights of that color.';
      } else {
        channels.forEach(function(channel) {
          gpio.changeChannelState(channel, request.result.parameters.state === 'on', function() {});
        });

        response_object.speech = 'Turning ' + request.result.parameters.state + ' the lights.';
      }
      break;
    case 'all_lights':
      // Get all of the channels
      var channel_count = gpio.getAllChannels();

      for (var channel = 0; channel < channel_count; channel++) {
        gpio.changeChannelState(channel, request.result.parameters.state === 'on', function() {});
      }

      response_object.speech = 'Turning ' + request.result.parameters.state + ' all the lights.';
      break;
    case 'lights_status':
      // Get the statuses
      gpio.getChannelStates(function(error, states) {
        // Loop over the states
        var colors = [];
        states.forEach(function(state, channel) {
          if (state === (request.result.parameters.state === 'on')) {
            colors.push(gpio.getChannelColor(channel));
          }
        });

        // Unique and sort the colors
        colors = colors.sort().filter(function(el, i, a) {
          return el !== 'n/a' && i === a.indexOf(el);
        });

        // Build the response string
        if (colors.length === 0) {
          response_object.speech = 'Currently there are no lights on.';
        } else if (colors.length === 1) {
          response_object.speech = 'The ' + colors[0] + ' lights are on.';
        } else if (colors.length === 2) {
          response_object.speech = 'The ' + colors[0] + ' and ' + colors[1] + ' lights are on.';
        } else {
          response_object.speech = 'The ' + colors.reduce(function(value, current, index) {
              // Add a comma
              value += ', ';

              // Add the and if we are at the end
              if (index === colors.length - 1) {
                value += 'and ';
              }

              // Add the current color
              value += current

              return value;
            }) + ' lights are on.';
        }

        response_object.displayText = response_object.speech;
        console.log(response_object.speech);
        return response.send(JSON.stringify(response_object));
      });
      return;
      break;
  }

  response_object.displayText = response_object.speech;

  console.log(response_object.speech);
  return response.send(JSON.stringify(response_object));
}

/**
 * This function handles a call to the status endpoint
 * @param  {Object} request  The request object
 * @param  {Object} response The response object
 */
function statusHandler(request, response) {
  // Get the pin states
  gpio.getPinStates(function(error, states) {
    response.send(JSON.stringify(states));
  });
}

app.all('/status', statusHandler);
app.post('/google', googleAssistantHandler);
app.listen(8080);

const gpio = require('rpi-gpio');

const channels = [
  {
    pin: 7,
    name: 'Channel 1',
    color: 'white',
  },
  {
    pin: 8,
    name: 'Channel 2',
    color: 'red',
  },
  {
    pin: 25,
    name: 'Channel 3',
    color: 'blue',
  },
  {
    pin: 24,
    name: 'Channel 4',
    color: 'green',
  },
  {
    pin: 23,
    name: 'Channel 5',
    color: 'n/a',
  },
  {
    pin: 18,
    name: 'Channel 6',
    color: 'n/a',
  },
  {
    pin: 15,
    name: 'Channel 7',
    color: 'n/a',
  },
  {
    pin: 14,
    name: 'Channel 8',
    color: 'n/a',
  },
];

/**
 * This function loops over all of the channels and sets them up
 */
function setupPins() {
  // Set the numbering scheme to BCM
  gpio.setMode(gpio.MODE_BCM);

  // Loop through the channels and set them to HIGH (relay off)
  channels.forEach(function(channel) {
    gpio.setup(channel.pin, gpio.DIR_HIGH, setupPinsCallback.bind(undefined, channel));
  });
}

/**
 * This function logs errors with setting up pins
 * @param  {Object} channel The item in the channels array
 * @param  {Error}  error   The error that occured (if any)
 */
function setupPinsCallback(channel, error) {
  if (error) {
    console.log('Error with pin ' + channel.pin);
    console.log(error);
  }
}

/**
 * Changes a pin's state (if needed)
 * @param  {Integer}  channel  The channel number (0-based index)
 * @param  {Boolean}  state    The state to set the pin to (based on relay
 *                             state)
 * @param  {Function} callback The callback to fire when done. Parameter 1 is
 *                             error, if occured, parameter 2 is boolean for did
 *                             the state change
 */
function changeChannelState(channel, state, callback) {
  // Get the pins current state
  gpio.read(channels[channel].pin, function(error, old_state) {
    // Log the error
    if (error) {
      console.log(error);
      old_state = !state;
    }

    // Check for a new state being needed
    if (old_state !== state) {
      gpio.write(channels[channel].pin, state, function(error) {
        if (error) {
          callback(error);
        } else {
          callback(undefined, true);
        }
      })
    } else {
      callback(undefined, false);
    }
  });
}

/**
 * Obtain and return all of the channel states
 * @param  {Function} callback The function to call with the first parameter
 *                             being error and the second being an array of
 *                             booleans
 */
function getChannelStates(callback) {
  // Create the array
  channel_states = [];

  // Loop through the channels
  channels.forEach(function(channel, index) {
    // Delete the old value
    channel_states[index] = null;

    // Get the new value
    gpio.read(channel.pin, function(error, state) {
      // Log the error and record state as false if error
      if (error) {
        console.log(error);
        state = false;
      }

      // Set the states
      channel_states[index] = state;

      // Call the callback if needed
      if (channel_states.indexOf(null) === -1) {
        callback(undefined, channel_states);
      }
    });
  });
}

/**
 * Returns the channels that match the provided color (or colors)
 * @param  {Array} colors The colors to match
 * @return {Array}        The channels that match the color
 */
function getChannelsByColor(colors) {
  // Filter the channels
  color_channels = [];
  channels.forEach(function(channel, index) {
    if (colors.indexOf(channel.color) !== -1) {
      color_channels.push(index);
    }
  });

  return color_channels;
}

/**
 * Returns the number of channels
 * @return {Integer}
 */
function getAllChannels() {
  return channels.length;
}

function getChannelColor(channel) {
  return channels[channel].color;
}

module.exports = {
  setup: setupPins,
  changeChannelState: changeChannelState,
  getChannelStates: getChannelStates,
  getChannelsByColor: getChannelsByColor,
  getAllChannels: getAllChannels,
  getChannelColor: getChannelColor,
};

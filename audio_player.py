import math
import pyaudio
import random
import sys
import wave
import output

channel_states = [] # The states of the channels
channel_names = [] # The names of the channels
max_name_length = 7 # The longest name (plus 2 characters)
chunk_length = 10 # The number of items to get at a time

def initialize_channels(names):
    global max_name_length

    for name in names:
        # Set the state to false
        channel_states.append(False)

        # Save the name
        channel_names.append(name)

        # Check for the name being longer than the max
        if max_name_length < len(name) + 2:
            max_name_length = len(name) + 2

    # Add one to even max lengths
    if max_name_length % 2 is 0:
        max_name_length = max_name_length + 1

def change_channel(channel = None, max_on = 3):
    # Use the global variables
    global channel_states
    global channel_names

    # If a specific channel is to be toggled, toggle it
    if channel is not None:
        channel_states[channel] = not channel_states[channel]
    else:
        # Determine which channels are on and off
        on_channels = []
        off_channels = []
        index = 0
        for state in channel_states:
            # Add the channel index to the array
            if state:
                on_channels.append(index)
            else:
                off_channels.append(index)

            # Move to the next idnex
            index = index + 1

        # Determine which channels we can toggle
        choose_from = on_channels # We can always turn a channel off
        if len(on_channels) < max_on:
            choose_from = choose_from + off_channels

        # Choose a channel to change
        channel_to_change = choose_from[random.randrange(0, len(choose_from))]

        # Toggle the channel
        channel_states[channel_to_change] = not channel_states[channel_to_change]
        output.changeState(channel_to_change, channel_states[channel_to_change])

        # Make sure at least one channel is turned on
        while True not in channel_states:
            # Pick a random channel to turn on
            turn_on_channel = random.randrange(0, len(channel_states))

            # Make sure that we aren't turning on a channel we just turned off
            if turn_on_channel is channel_to_change:
                continue

            # Turn the new channel on
            channel_states[turn_on_channel] = not channel_states[turn_on_channel]
            output.changeState(turn_on_channel, channel_states[turn_on_channel])

    # Print the channel states
    print_state()

def print_state():
    # Use the global variables
    global channel_states
    global channel_names

    # Erase the old line
    sys.stdout.write('\r\033[K')

    # Loop over the channels
    for (state, name) in zip(channel_states, channel_names):
        # Write a spacer
        sys.stdout.write(' ' * round((max_name_length - 1) / 2))

        # Write an X if the channel is on, otherwise write a space
        if state:
            sys.stdout.write('X')
        else:
            sys.stdout.write(' ')

        # Write another spacer and pipe
        sys.stdout.write(' ' * round((max_name_length - 1) / 2))
        sys.stdout.write('|')

    # Flush the stdout to show all of the text
    sys.stdout.flush()

def play_audio(filename, peaks):
    # Prepare the index
    chunk_index = 0
    peak_index = 0

    # Prepare the stdout
    for name in channel_names:
        # Determine how much space there is
        space_characters = max_name_length - len(name)

        # Print the first spacing
        sys.stdout.write(' ' * math.ceil(space_characters / 2))

        # Print the name
        sys.stdout.write(name)

        # Print the last spacing and pipe
        sys.stdout.write(' ' * math.floor(space_characters / 2))
        sys.stdout.write('|')
    sys.stdout.write('\n')
    print_state()

    # Open the wave file
    f = wave.open(filename, "rb")

    # Create a PyAudio instance
    p = pyaudio.PyAudio()

    # Open an audio stream
    stream = p.open(format = p.get_format_from_width(f.getsampwidth()),
                    channels = f.getnchannels(),
                    rate = f.getframerate(),
                    output = True)

    try:
        # Read the first chunk of data
        data = f.readframes(chunk_length)

        # Play the stream
        while data:
            # Add to the chunk index
            chunk_index = chunk_index + chunk_length

            # Check it against the peaks
            if peak_index < len(peaks) and chunk_index >= peaks[peak_index]:
                # Increment the peak index
                peak_index = peak_index + 1

                # Change the lights
                change_channel()

            # Play the chunk
            stream.write(data)

            # Read the next chunk
            data = f.readframes(chunk_length)

    except KeyboardInterrupt:
        # Handle CTRL+c
        print()
        pass

    # Stop the stream
    stream.stop_stream()
    stream.close()

    # Close PyAudio
    p.terminate()

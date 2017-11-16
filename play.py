import audio_parser
import audio_player
import getopts
import sys

# Set up the channels
audio_player.initialize_channels(['red', 'green', 'blue', 'white'])

# Get the options
options = getopts.getopts(sys.argv[1:], '', ['input=', 'method='])

# Set the defaults
filename = 'rockin_xmas_tree.wav'
peak_method = 'standard'

# Parse the options
for option, value in options:
    if option is '--input':
        filename = value
    else if option is '--method':
        peak_method = value

# Parse the music file
if peak_method is 'frequency':
    peaks = audio_parser.parse_file_frequency(filename)
else:
    peaks = audio_parser.parse_file_standard(filename)

# Play the music file
audio_player.play_audio(filename, peaks)

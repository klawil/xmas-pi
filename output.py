import json

# Import the Raspberry Pi GPIO library
try:
    import RPi.GPIO as GPIO
except:
    # Import a fake version for use on other devices
    import fake_gpio as GPIO

# The channels and their pins
pins = [7, 8, 25, 24, 23, 18, 15, 14]

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Default all of the pins to HIGH
for pin in pins:
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, GPIO.HIGH)

def changeState(channel, state):
    # Validate the channel
    channel = int(channel)
    if channel >= len(pins):
        return {
            "success": False,
            "message": "Invalid Channel"
        }

    # Validate the state
    if state not in [False, True]:
        return {
            "success": False,
            "message": "Invalid State"
        }
    elif state:
        gpio_state = GPIO.LOW
    else:
        gpio_state = GPIO.HIGH

    # Set the state
    GPIO.output(pins[channel], gpio_state)

    # Return success
    return {
        "success": True,
        "message": "",
        "state": state,
        "channel": channel,
    }

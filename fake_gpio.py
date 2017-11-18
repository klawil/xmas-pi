import logging

# Set up the logging
logging.basicConfig(format='%(asctime)s %(levelname)s: %(name)s: %(message)s', level=logging.INFO, datefmt='%m/%d/%Y %I:%M:%S %p')
log = logging.getLogger('GPIO')

BCM = None
LOW = False
HIGH = True

def setmode(mode):
    log.info('Changing Mode')

def setwarnings(warning):
    log.info('Changing Warnings')

def output(pin, state):
    log.info('Changing Pin {} State to {}'.format(str(pin), str(state)))

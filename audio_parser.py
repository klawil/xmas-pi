from scipy.io import wavfile as wav
import numpy
import peakutils

def get_file_data(filename):
    # Read the file
    rate, data = wav.read(filename)

    # Make the data one-dimensional
    if hasattr(data[0], '__len__'):
        # Import the scipy library
        import scipy

        # Average the data
        data = scipy.mean(data, axis=1)

    # Parse into a numpy array
    data = numpy.asarray(data, dtype=numpy.float32)

    # Return the data and the rate
    return rate, data

def parse_file_standard(filename, max_per_sec = 2):
    # Read the file
    rate, data = get_file_data(filename)

    # Scale the data
    data, unused_info = peakutils.prepare.scale(data, new_range=(0.0, 1.0), eps=1e-9)

    # Get the peak values
    peaks = peakutils.indexes(data, thres=0.2, min_dist = rate / max_per_sec)

    # Return the peaks
    return peaks

def parse_file_frequency(filename, max_per_sec = 2, frequency=(25, 125)):
    from matplotlib import mlab
    import scipy
    import sys

    # Get the data
    rate, data = get_file_data(filename)
    raw_data_length = len(data)

    # Get the specgram
    pxx, freqs, bins = mlab.specgram(data, Fs=rate, sides='onesided', NFFT=256)

    # Get the data we actually want
    data = scipy.sum(pxx, axis=0)

    # Scale the data so threshold is maintained
    data, unused_info = peakutils.prepare.scale(data, new_range=(0.0, 1.0), eps=1e-9)

    # Get the scale for the peak indexes
    peak_index_scale = raw_data_length / len(data)

    # Get the peaks
    peaks_scaled = peakutils.indexes(data, thres=0.2, min_dist=round(rate * len(data) / (raw_data_length * max_per_sec)))

    # Scale the peaks back to the original rate
    peaks = []
    for peak in peaks_scaled:
        peaks.append(round(peak * raw_data_length / len(data)))

    return peaks

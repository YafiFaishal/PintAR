import cv2
import numpy as np
import sys

img = cv2.imread('public/marker.png', cv2.IMREAD_GRAYSCALE)
if img is None:
    print("Could not read image")
    sys.exit(1)

# Initialize FAST detector
fast = cv2.FastFeatureDetector_create()
kp = fast.detect(img, None)

print(f"Detected {len(kp)} feature points.")
if len(kp) < 100:
    print("POOR MARKER: Too few feature points!")
elif len(kp) > 5000:
    print("POOR MARKER: Too many repetitive features, might confuse the tracker.")
else:
    print("Marker seems to have a reasonable number of features.")

/**
 * Serializes and deserializes RLE (Run-Length Encoding) data.
 * * STRING FORMAT:
 * [0] width      - Image width in pixels
 * [1] height     - Image height in pixels
 * [2] below      - Hex color for values below threshold
 * [3] above      - Hex color for values above threshold
 * [4] runs       - Comma-separated integers representing run lengths
 * * EXAMPLE: "100|100|ff0000|0000ff|10,5,20"
 */
export const RLE_SCHEMA = [
  'width',
  'height',
  'belowThresholdColor',
  'aboveThresholdColor',
  'runs',
] as const;

/**
 * * Character used to delimit the main metadata segments of the RLE string.
 * Format: width|height|belowColor|aboveColor|runs
 */
export const RLE_SEPERATOR = '|';

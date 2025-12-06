/**
 * Application-wide constants.
 * Centralizes all magic numbers and configuration values for maintainability.
 */

// ============================================================================
// GUITAR CONFIGURATION
// ============================================================================

/**
 * Number of strings on a standard guitar
 */
export const GUITAR_STRING_COUNT = 6;

/**
 * Maximum fret number on the guitar neck
 * (24 frets is standard for electric guitars)
 */
export const MAX_FRET_NUMBER = 24;

/**
 * Fret range to display in Scale Explorer mode
 * Shows 4 frets at a time (e.g., frets 0-3, 1-4, etc.)
 */
export const FRET_RANGE_EXPLORER = 4;

/**
 * Fret range to display in Chord Builder mode
 * Shows 12 frets at a time for extended range
 */
export const FRET_RANGE_BUILDER = 12;

// ============================================================================
// MUSIC THEORY
// ============================================================================

/**
 * Number of semitones in an octave (chromatic scale)
 */
export const SEMITONES_PER_OCTAVE = 12;

/**
 * Number of notes in a diatonic scale
 */
export const DIATONIC_SCALE_LENGTH = 7;

/**
 * Valid octave range for musical notes
 */
export const MIN_OCTAVE = 0;
export const MAX_OCTAVE = 8;

/**
 * Note names in chromatic order (using sharps)
 */
export const CHROMATIC_NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Note names in chromatic order (using flats)
 */
export const CHROMATIC_NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Keys that traditionally use flat accidentals
 */
export const FLAT_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

// ============================================================================
// PIANO KEYBOARD CONFIGURATION
// ============================================================================

/**
 * Number of white keys to display in the piano keyboard window
 * Approximately 3 octaves
 */
export const PIANO_VISIBLE_WHITE_KEYS = 21;

/**
 * Lowest note on a standard guitar (low E string, open)
 */
export const GUITAR_LOWEST_NOTE = 'E2';

/**
 * Highest note on a standard guitar (high E string, 24th fret)
 */
export const GUITAR_HIGHEST_NOTE = 'E6';

/**
 * Width of a white piano key in pixels
 */
export const PIANO_WHITE_KEY_WIDTH = 40;

/**
 * Width of a black piano key in pixels
 */
export const PIANO_BLACK_KEY_WIDTH = 24;

// ============================================================================
// SHEET MUSIC CONFIGURATION
// ============================================================================

/**
 * Split point between treble and bass clefs
 * Notes at or above this pitch go to treble clef
 */
export const TREBLE_BASS_SPLIT_NOTE = 'B';
export const TREBLE_BASS_SPLIT_OCTAVE = 3;

// ============================================================================
// AUDIO SYNTHESIS
// ============================================================================

/**
 * Attack time for audio envelope (in seconds)
 * Time it takes for sound to reach maximum volume
 */
export const AUDIO_ATTACK_TIME = 0.05;

/**
 * Maximum gain (volume) for synthesized notes
 * Range: 0.0 to 1.0
 */
export const AUDIO_MAX_GAIN = 0.3;

/**
 * Duration for chord playback (in seconds)
 */
export const AUDIO_CHORD_DURATION = 1.5;

/**
 * Duration for arpeggio note playback (in seconds)
 */
export const AUDIO_ARPEGGIO_DURATION = 0.8;

/**
 * Time delay between arpeggio notes (in seconds)
 */
export const AUDIO_ARPEGGIO_DELAY = 0.15;

// ============================================================================
// UI CONFIGURATION
// ============================================================================

/**
 * Debounce time for chord identification (in milliseconds)
 * Prevents excessive recalculation while user is selecting notes
 */
export const CHORD_IDENTIFICATION_DEBOUNCE = 150;

/**
 * Number of top chord matches to display by default
 */
export const DEFAULT_CHORD_MATCHES_DISPLAY = 5;

// ============================================================================
// FRETBOARD VISUALIZATION
// ============================================================================

/**
 * SVG viewbox width offset for fretboard (in pixels)
 */
export const FRETBOARD_SVG_OFFSET = 80;

/**
 * Spacing between frets in SVG (in pixels)
 */
export const FRETBOARD_FRET_SPACING = 80;

/**
 * Padding for fretboard SVG (in pixels)
 */
export const FRETBOARD_SVG_PADDING = 20;

/**
 * Spacing between strings in SVG (in pixels)
 */
export const FRETBOARD_STRING_SPACING = 25;

/**
 * SVG y-offset for first string (in pixels)
 */
export const FRETBOARD_STRING_START_Y = 30;

// ============================================================================
// CHORD IDENTIFICATION
// ============================================================================

/**
 * Minimum confidence threshold for displaying chord matches
 * Range: 0.0 to 1.0
 */
export const MIN_CHORD_CONFIDENCE = 0.5;

/**
 * Penalty applied to confidence score for each extra note
 * Extra notes = notes selected that aren't in the chord
 */
export const CHORD_EXTRA_NOTE_PENALTY = 0.15;

/**
 * Confidence thresholds for labeling
 */
export const CONFIDENCE_EXACT_MATCH = 0.95;
export const CONFIDENCE_VERY_LIKELY = 0.8;
export const CONFIDENCE_LIKELY = 0.65;

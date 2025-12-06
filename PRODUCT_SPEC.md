# Guitar Chord Explorer - Functional Specification

## 1. Product Overview
Guitar Chord Explorer is an interactive web application designed to help musicians visualize, create, and understand guitar chords within the context of musical scales. It serves two primary use cases:
1.  **Exploration**: Discovering valid chords within a specific musical key.
2.  **Construction**: Reverse-engineering chords by placing fingers on a virtual fretboard.

The application must provide real-time visual feedback across three synchronized views: a guitar fretboard, a piano keyboard, and standard sheet music notation.

## 2. Core Logic & Data Rules

### 2.1 Music Theory Engine
The system must implement a robust music theory engine capable of:
*   **Note Representation**: Handling 12 chromatic pitches.
*   **Enharmonic Spelling**: Context-aware display of accidentals (e.g., displaying "F#" in G Major but "Gb" in Db Major).
*   **Scale Generation**:
    *   Supported Scales: Major, Natural Minor, Harmonic Minor, Melodic Minor.
    *   Logic: Generating scale notes based on root and interval patterns.
*   **Chord Construction**:
    *   Generating diatonic Triads (Root-3rd-5th) and 7th chords (Root-3rd-5th-7th) for any given scale.
    *   Assigning correct Roman Numeral analysis (e.g., I, ii, V7, vii°).
*   **Chord Identification**:
    *   Analyzing a set of arbitrary notes to determine the most likely chord name.
    *   Calculating confidence scores based on the presence of root, 3rd, 5th, and 7th.
    *   Identifying the chord's function in potential keys.

### 2.2 Guitar Logic
*   **Tuning**: Standard EADGBE tuning (E2, A2, D3, G3, B3, E4).
*   **Fretboard Mapping**: Mapping every string/fret coordinate to a specific musical note (Pitch + Octave).
*   **Physical Constraints**:
    *   **One Note Per String**: A physical string can only sound one note at a time. Selecting a new fret on a string must replace the previous selection on that string.
    *   **Muting**: Strings can be muted, silencing them completely.

## 3. User Interface & Interactions

### 3.1 Global Layout
The application is divided into two distinct modes, selectable via a toggle: **Scale Explorer** and **Chord Builder**.

### 3.2 Mode 1: Scale Explorer
**Goal**: Visualize pre-defined chords within a key.

**Inputs**:
*   **Root Note Selector**: Dropdown to select the key center (C through B).
*   **Scale Type Selector**: Dropdown to select the scale quality (Major, Minor, etc.).

**Display**:
*   **Chord Grid**: A list of all diatonic chords in the selected scale.
    *   Grouped by Triads and 7th Chords.
    *   Each item shows: Chord Name (e.g., "Dm") and Roman Numeral (e.g., "ii").
    *   **Interaction**: Clicking a chord loads it into the visualizations.
    *   **State**: The currently selected chord must be visually highlighted.

### 3.3 Mode 2: Chord Builder
**Goal**: Identify a chord constructed by the user.

**Inputs**:
*   **Interactive Fretboard**: (See Section 4.1) User clicks directly on the fretboard to place fingers.
*   **Reference Key (Optional)**: Selectors for Root and Scale Type to display "ghost notes" (visual guides) on the fretboard without selecting them.

**Display**:
*   **Identified Chords List**: A real-time list of potential chord names matching the selected notes.
    *   Ordered by confidence/likelihood.
    *   Shows: Chord Name, Confidence Label (e.g., "Exact Match", "Likely"), and intervals present.
    *   **Interaction**: Clicking a match highlights it but does *not* alter the fretboard selection (only updates ghost notes/info).

## 4. Visualization Components

### 4.1 Interactive Fretboard
A graphical representation of the guitar neck.

**Visuals**:
*   **Orientation**: Horizontal (Nut on the left).
*   **Range**:
    *   **Explorer Mode**: 4 frets visible (dynamic window).
    *   **Builder Mode**: 11 frets visible (extended range).
*   **Styling**: Realistic wood texture background, varying string gauges (low E thick, high E thin).

**Controls**:
*   **Nut Markers**: Interactive markers to the left of the nut.
    *   **"O" (Green)**: String is open/active.
    *   **"X" (Red)**: String is muted.
    *   **Interaction**: Click to toggle between Mute/Open. Double-clicking a string line also toggles mute.
*   **Navigation**: "Lower" and "Higher" buttons to shift the visible fret range up or down the neck.
*   **Toggle**: Button to switch note labels between **Note Names** (e.g., "C", "E") and **Scale Degrees** (e.g., "1", "b3").

**Note States**:
1.  **Ghost Note**: Semi-transparent marker indicating a note is part of the selected scale/chord but not currently played.
    *   *Visual*: Light Blue (or Gold for Root).
    *   *Interaction*: Click to select.
2.  **Selected Note**: A note currently "fingered" on the fretboard.
    *   *Visual*: Solid Blue circle with white text.
    *   *Logic*: If the note is not part of the identified chord/scale, it displays in Red (Error state).
    *   *Interaction*: Click to deselect (or select another note on the same string to replace).

### 4.2 Piano Keyboard
A dynamic keyboard visualization synchronized with the fretboard.

**Visuals**:
*   **Range**: Supports full guitar range (E2 to E6).
*   **Window**: Displays a sliding window of approximately 3 octaves (21 white keys).
*   **Keys**: Realistic black and white keys.

**Controls**:
*   **Navigation**: "Lower" and "Higher" buttons to shift the visible window by one white key at a time.
*   **Animation**: Keys must slide smoothly to their new positions when shifting.

**Feedback**:
*   **Highlighting**: Keys corresponding to active fretboard notes must light up.
    *   **Blue**: Natural notes (White keys).
    *   **Red**: Accidental notes (Black keys).
*   **Octave Accuracy**: Must distinguish between pitches (e.g., Low E vs High E). A generic "E" is not sufficient; the correct octave key must light up.

### 4.3 Sheet Music
Standard musical notation.

**Logic**:
*   **Clef**: Treble Clef.
*   **Key Signature**: Automatically calculated and rendered based on the selected Root/Scale.
*   **Notes**: Renders the specific voicing selected on the fretboard.
*   **Accidentals**: Automatically handles sharps/flats/naturals based on context.

### 4.4 Audio Playback
Synthesized audio feedback.

**Controls**:
*   **"Play Chord"**: Plays all active notes simultaneously (strum).
*   **"Play Arpeggio"**: Plays active notes sequentially from lowest pitch to highest pitch.

**Logic**:
*   **Muting**: Notes on muted strings must NOT be played.
*   **Synthesis**: Sounds should be generated in real-time (e.g., using oscillators) rather than pre-recorded samples, to allow for infinite flexibility.

## 5. User Flows

### Flow A: Exploring a Key
1.  User selects "Scale Explorer" mode.
2.  User selects "D" and "Minor".
3.  App calculates D Minor scale and chords.
4.  User clicks the "Gm (iv)" chord.
5.  **Fretboard** updates to show a standard voicing of Gm.
6.  **Piano** highlights the specific notes G, Bb, D in the correct octaves.
7.  **Sheet Music** draws the chord on the staff with a Bb key signature.
8.  User clicks "Play Arpeggio" to hear the chord.

### Flow B: Building a Chord
1.  User selects "Chord Builder" mode.
2.  User clicks the 3rd fret of the A string (C) and 2nd fret of the D string (E).
3.  **Identified Chords** list updates to show "C Major (no 5th)" as a match.
4.  User clicks the 3rd fret of the B string (D).
5.  **Identified Chords** updates to "Cadd9 (no 5th)".
6.  **Piano** updates in real-time to show C3, E3, D4.
7.  User clicks "Play Chord" to hear the dissonance/harmony.

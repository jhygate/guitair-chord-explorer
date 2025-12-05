# Guitar Chord Explorer - Product Specification

## 1. Overview

Guitar Chord Explorer is an interactive web application that helps musicians visualize, create, and understand guitar chords within musical scales. Users can select a scale, view its constituent chords, and create custom chord voicings on an interactive fretboard with corresponding sheet music notation.

## 2. Core Features (v1)

### 2.1 Scale Selection
- **Root Note Selection**: All 12 chromatic notes (C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B)
- **Accidental Display**: Context-dependent based on key (e.g., G Major uses F#, Db Major uses flats)
- **Scale Types** (v1):
  - Major
  - Natural Minor
  - Harmonic Minor
  - Melodic Minor

### 2.2 Chord Display
- **Chord Types**: Triads and 7th chords
- **Chord Labels**: Display both chord names (e.g., "Dm") and Roman numeral quality labels (e.g., "ii")
- **Example for C Major**: C (I), Dm (ii), Em (iii), F (IV), G (V), Am (vi), Bdim (vii°)
- **Chord Selection**: Click any chord button to load it into the fretboard view

### 2.3 Canvas Workspace (TODO - NOT YET IMPLEMENTED)
- **Free-form Canvas**: Users can position chord diagrams anywhere on an infinite canvas
- **Pan**: Click and drag to navigate around the canvas
- **Zoom**: Zoom in/out to scale all diagrams simultaneously
- **Multiple Diagrams**: Unlimited number of chord diagrams can be created and displayed

### 2.4 Chord Diagram Component

#### 2.4.1 Fretboard Visualization ✅ IMPLEMENTED
- **Orientation**: Horizontal layout (strings run left-to-right, frets are vertical lines)
- **Display**: 4 frets visible at a time
- **Navigation**: "← Lower" and "Higher →" buttons to move view up/down the fretboard
- **Position Label**: Shows current position ("Open" for frets 0-3, or fret number for higher positions)
- **Tuning**: Standard tuning (E-A-D-G-B-E) only in v1
- **Visual Design**:
  - Light brown/wood background
  - String lines (horizontal) - thickness varies by string
  - Fret lines (vertical)
  - Thick nut line when showing open position
  - Fret numbers displayed above fretboard

#### 2.4.2 String Markers ✅ IMPLEMENTED
- **Left Side Indicators**:
  - Green circle (**O**) = String is active/played
  - Red **✕** = String is muted
  - Click on O/X to toggle mute status
  - Large clickable hitbox (30x24px) for easy clicking
- **String Labels**: Show actual note names (E, B, G, D, A, E) instead of numbers
- **Visual Feedback**: Muted strings appear faded/grayed out

#### 2.4.3 Note Interaction ✅ IMPLEMENTED
- **Ghost Notes**: Semi-transparent circles showing all chord tone positions
  - Blue for regular chord tones
  - Yellow/gold for root notes
  - Only visible when not selected
- **Single Click on Position**: Select/deselect a note on that string
  - Clears any other selection on the same string
  - Unmutes the string if it was muted
- **Color Coding**:
  - Ghost notes (unselected chord tones): Light blue (opacity 0.4) or yellow for roots
  - Selected notes IN the chord: Solid blue (#2196f3) with white border + note name
  - Selected notes NOT in the chord: Solid red (#f44336) with white border + note name
  - Empty positions: Invisible but clickable
  - Muted strings: All positions on that string are hidden/inactive

#### 2.4.4 Sheet Music Display (TODO - NOT YET IMPLEMENTED)
- **Library**: VexFlow
- **Notation Type**: Standard guitar notation (treble clef with 8va)
- **Content**: Notes stacked as a chord, showing exactly what's selected on the fretboard
- **Chord Name**: Displayed at top of component (shared by fretboard and sheet music)

### 2.5 Current Workflow (v1 - Simplified)
1. User selects scale (root note + scale type) via dropdowns
2. Application displays all chords in that scale (triads and 7ths)
3. User clicks a chord button to load it into the fretboard view
4. Fretboard appears showing:
   - Ghost notes for all chord tone positions
   - All strings marked with green O (active)
   - Position controls for navigation
5. User interacts with fretboard:
   - Click notes to select them
   - Click O/X to mute/unmute strings
   - Use ← → buttons to navigate fretboard positions
6. Selected notes update in real-time

### 2.6 Workspace Actions (TODO - NOT YET IMPLEMENTED)
- **Add New**: Creates new chord diagram (with chord pre-selected)
- **Delete**: Removes individual diagram (button on each diagram)
- **Duplicate**: Creates copy of existing diagram (button on each diagram)
- **Change Chord**: Allows changing the chord of an existing diagram (dropdown/selector on each diagram)
- **Clear All**: Removes all diagrams from workspace
- **Drag Handle**: Top of each diagram for repositioning on canvas

## 3. Technical Architecture

### 3.1 Technology Stack ✅ IMPLEMENTED
- **Framework**: Angular 17 (using modern `@if`/`@for` control flow syntax)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Sheet Music**: VexFlow (not yet installed)
- **Canvas/Pan/Zoom**: TBD (for future canvas workspace)

### 3.2 Project Structure (CURRENT)
```
guitar-chord-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── fretboard/              ✅ IMPLEMENTED
│   │   │       ├── fretboard.component.ts
│   │   │       ├── fretboard.component.html
│   │   │       └── fretboard.component.scss
│   │   ├── models/                     ✅ IMPLEMENTED
│   │   │   ├── note.model.ts
│   │   │   ├── chord.model.ts
│   │   │   ├── scale.model.ts
│   │   │   ├── fretboard.model.ts
│   │   │   └── index.ts
│   │   ├── services/                   ✅ IMPLEMENTED
│   │   │   ├── music-theory.service.ts
│   │   │   └── fretboard.service.ts
│   │   ├── app.component.ts            ✅ IMPLEMENTED
│   │   ├── app.component.html          ✅ IMPLEMENTED
│   │   └── app.component.scss
│   └── styles.scss                     ✅ Tailwind configured
├── tailwind.config.js                  ✅ CONFIGURED
└── package.json
```

### 3.3 Data Models ✅ IMPLEMENTED

#### Note
```typescript
{
  pitch: string;        // 'C', 'D', 'E', etc.
  accidental: string;   // '', '#', 'b'
  octave?: number;      // Optional octave
}
```

#### Chord
```typescript
{
  root: Note;
  quality: ChordQuality;  // 'major', 'minor', 'diminished', etc.
  notes: Note[];
  romanNumeral: string;   // 'I', 'ii', 'V7', etc.
  displayName: string;    // 'Cmaj7', 'Dm', etc.
}
```

#### Scale
```typescript
{
  root: Note;
  type: ScaleType;        // 'major', 'natural_minor', etc.
  notes: Note[];
  chords: Chord[];
}
```

#### FretboardPosition
```typescript
{
  string: number;         // 1-6 (1 = high E, 6 = low E)
  fret: number;           // 0-24 (0 = open string)
  note: Note;
  isRoot: boolean;
  isInChord: boolean;
}
```

#### ChordVoicing
```typescript
{
  selectedPositions: FretboardPosition[];
  mutedStrings: number[];
  fretRangeStart: number;
}
```

### 3.4 Key Services ✅ IMPLEMENTED

#### MusicTheoryService
- Calculate notes in a scale
- Generate chords for a given scale (triads + 7ths)
- Determine chord quality and Roman numerals
- Handle accidental display logic based on key (sharps vs flats)
- **Location**: `src/app/services/music-theory.service.ts`

#### FretboardService
- Map chord notes to all fretboard positions within a range
- Calculate note at any fret on any string
- Determine if a note is in a chord (ignoring octave)
- Identify root notes
- **Location**: `src/app/services/fretboard.service.ts`

## 4. UI/UX Design

### 4.1 Color Scheme ✅ IMPLEMENTED
**Fretboard Colors:**
- Background: Light brown (#8B4513 at 30% opacity) - wood-like
- Strings: Dark gray (#333), varying thickness
- Frets: Medium gray (#666)
- Nut: Dark (#333), thick line

**Note Colors:**
- Ghost chord tones: Light blue (#90caf9) at 40% opacity
- Ghost root notes: Gold/yellow (#ffc107) at 40% opacity
- Selected correct: Blue (#2196f3) with white border
- Selected incorrect: Red (#f44336) with white border
- Muted string marker: Red (#dc3545)
- Active string marker: Green (#28a745)

**UI Colors (Tailwind):**
- Triad buttons: Blue 100/200 background
- 7th chord buttons: Purple 100/200 background
- Selected chord: Ring border (blue/purple)

### 4.2 Fretboard Layout ✅ IMPLEMENTED
```
[O] E  ─────┬────┬────┬────┬─
[O] B  ─────┬────┬────┬────┬─
[O] G  ─────┬────┬────┬────┬─
[O] D  ─────┬────┬────┬────┬─
[O] A  ─────┬────┬────┬────┬─
[O] E  ─────┬────┬────┬────┬─
           0    1    2    3
```

- O/X markers on far left (clickable)
- String note names next to markers
- Horizontal strings with notes as dots
- Fret numbers across top
- Position label and navigation buttons above

### 4.3 Interactions ✅ IMPLEMENTED
- **Click note position**: Select/deselect note on that string
- **Click O/X marker**: Toggle string mute/unmute
- **Click "← Lower"**: Move fretboard view down (lower frets)
- **Click "Higher →"**: Move fretboard view up (higher frets)
- **Click chord button**: Load chord into fretboard view
- **Change scale selector**: Updates available chords

## 5. Implementation Status

### ✅ Completed (v0.1)
1. Angular 17 project setup with Tailwind CSS
2. Music theory models (Note, Chord, Scale, Fretboard)
3. Music theory service (scale calculation, chord generation)
4. Fretboard service (position mapping, note calculation)
5. Scale selector UI (root note + scale type dropdowns)
6. Chord list UI (triads + 7ths with Roman numerals)
7. Interactive horizontal fretboard component
8. Ghost notes visualization (chord tones + root highlighting)
9. Note selection interaction
10. String mute/unmute with O/X markers
11. Fretboard position navigation
12. Modern Angular syntax (`@if`, `@for`)

### 🚧 In Progress
None currently

### 📋 TODO (v0.2 - Next Steps)
1. Install and configure VexFlow
2. Build sheet music component
3. Connect fretboard selections to sheet music display
4. Chord diagram container (wrapper for fretboard + sheet music)

### 📋 TODO (v0.3 - Canvas Workspace)
1. Implement canvas workspace with pan/zoom
2. Multiple chord diagram instances
3. Workspace actions (Add, Delete, Duplicate, Clear All)
4. Drag handles for diagram positioning
5. Change chord dropdown on diagrams

## 6. Future Enhancements (Post v1)

### 6.1 Additional Scales
- Modes (Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian)
- Pentatonic scales (Major Pentatonic, Minor Pentatonic)
- Blues scales
- Other exotic scales

### 6.2 Extended Chords
- 9th chords
- 11th chords
- 13th chords
- Sus chords
- Add chords

### 6.3 Alternate Tunings
- Drop D
- DADGAD
- Open tunings
- Custom tuning support

### 6.4 Audio Playback
- Play button on each diagram
- Options:
  - Play notes simultaneously (as chord)
  - Play notes as ascending arpeggio
  - Adjustable playback speed

### 6.5 Persistence
- Save workspace to localStorage (auto-save)
- Export workspace to JSON file
- Import workspace from JSON file
- Export individual diagrams as images

### 6.6 Sheet Music Options
- Toggle between guitar notation and grand staff (piano-style)
- Toggle TAB notation on/off
- Display TAB below standard notation when enabled

### 6.7 Additional Features
- Chord suggestions based on selected notes
- Finger position indicators (1, 2, 3, 4)
- Common chord shape library
- Chord progression builder
- Print/export functionality

## 7. Development Notes

### 7.1 Code Style
- Using Angular 17 modern syntax (`@if`, `@for` instead of `*ngIf`, `*ngFor`)
- Standalone components
- TypeScript strict mode
- Tailwind for all styling (no custom CSS except component-specific styles)
- SVG for fretboard rendering (better scalability and interactivity)

### 7.2 Performance Considerations
- Fretboard positions calculated on-demand
- Ghost notes only rendered for visible fret range
- Efficient change detection with OnPush (future optimization)

### 7.3 Known Limitations (v0.1)
- No sheet music yet (VexFlow not integrated)
- No canvas workspace (single chord view only)
- No persistence
- Standard tuning only
- Triads and 7th chords only

---

**Version**: 0.1
**Last Updated**: 2025-12-05
**Status**: Active Development
**Current Focus**: Fretboard interaction complete, next: Sheet music integration

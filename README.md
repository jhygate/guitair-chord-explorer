# Guitar Chord Explorer

An interactive web application for visualizing, creating, and understanding guitar chords within the context of musical scales.

## 🎸 Features

### Scale Explorer Mode
- Select any musical key (C through B) and scale type (Major, Natural Minor, Harmonic Minor, Melodic Minor)
- View all diatonic chords in the scale (triads and 7th chords)
- Interactive fretboard showing chord voicings
- Real-time visual feedback across synchronized views:
  - Guitar fretboard with ghost notes
  - Piano keyboard highlighting
  - Standard sheet music notation (treble + bass clefs)
- Audio playback (chord strumming or arpeggio)

### Chord Builder Mode
- Click notes on an interactive fretboard to build custom chords
- Real-time chord identification with confidence scoring
- See which keys your chord appears in
- Reference key selection for scale degree visualization
- Visual feedback showing chord tones vs. non-chord tones

## 🏗️ Architecture

### Project Structure

```
guitar-chord-app/
├── src/
│   └── app/
│       ├── core/                  # Core utilities and constants
│       │   └── constants.ts       # Application-wide constants
│       │
│       ├── models/                # Data models (pure TypeScript interfaces)
│       │   ├── note.model.ts      # Note representation + NoteFactory
│       │   ├── chord.model.ts     # Chord interface
│       │   ├── scale.model.ts     # Scale interface
│       │   ├── fretboard.model.ts # Fretboard position models
│       │   └── index.ts           # Barrel export
│       │
│       ├── services/              # Business logic (Angular services)
│       │   ├── music-theory.service.ts    # Scale/chord generation
│       │   ├── chord-identifier.service.ts # Chord matching algorithm
│       │   ├── fretboard.service.ts       # Fretboard calculations
│       │   └── audio.service.ts           # Web Audio synthesis
│       │
│       ├── components/            # UI components
│       │   ├── fretboard/         # Interactive guitar fretboard
│       │   ├── piano-keyboard/    # Piano visualization
│       │   ├── sheet-music/       # Musical notation (VexFlow)
│       │   ├── chord-identifier/  # Chord match display
│       │   └── playback-controls/ # Audio playback buttons
│       │
│       ├── app.component.ts       # Root component (mode orchestration)
│       └── app.config.ts          # Angular configuration
│
├── ARCHITECTURE_REVIEW.md         # Detailed code review & recommendations
└── PRODUCT_SPEC.md                # Product requirements
```

### Layered Architecture

```
┌─────────────────────────────────────┐
│   Presentation Layer               │
│   (Angular Components)             │
│   - Handles user interaction       │
│   - Renders UI                     │
│   - Delegates logic to services    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Business Logic Layer             │
│   (Angular Services)               │
│   - Music theory calculations      │
│   - Chord identification           │
│   - Fretboard position mapping     │
│   - Audio synthesis                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Data Layer                       │
│   (TypeScript Interfaces)          │
│   - Note, Chord, Scale models      │
│   - FretboardPosition              │
│   - No logic, pure data structures │
└─────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v17)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd guitair-chords/guitar-chord-app

# Install dependencies
npm install

# Start development server
npm start
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any source files.

### Building for Production

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

### Running Tests

```bash
npm test
```

## 📚 Key Concepts

### Note Representation

All notes in the system use a **standardized format**:

```typescript
interface Note {
  pitch: string;      // 'C', 'D', 'E', 'F', 'G', 'A', or 'B' (no accidentals)
  accidental: string; // '', '#', or 'b'
  octave?: number;    // Optional (0-8)
}
```

**ALWAYS use `NoteFactory` to create notes**:

```typescript
import { NoteFactory } from './models';

// Create a note
const cSharp4 = NoteFactory.create('C', '#', 4);

// Parse from string
const note = NoteFactory.fromString('Bb3');

// Normalize legacy format
const normalized = NoteFactory.normalize(legacyNote);
```

### Music Theory Engine

The `MusicTheoryService` implements core music theory:

- **Scale generation**: Applies interval formulas to create scale notes
- **Chord construction**: Builds triads (root-3rd-5th) and 7th chords (root-3rd-5th-7th)
- **Roman numeral analysis**: Assigns scale degree functions (I, ii, iii, IV, V, vi, vii°)

#### Scale Formulas (in semitones)

```typescript
major:           [0, 2, 4, 5, 7, 9, 11]  // W-W-H-W-W-W-H
natural_minor:   [0, 2, 3, 5, 7, 8, 10]  // W-H-W-W-H-W-W
harmonic_minor:  [0, 2, 3, 5, 7, 8, 11]  // W-H-W-W-H-1½-H
melodic_minor:   [0, 2, 3, 5, 7, 9, 11]  // W-H-W-W-W-W-H
```

### Chord Identification

The `ChordIdentifierService` uses a pattern-matching algorithm:

1. Try each selected note as a potential root
2. For each root, test all chord qualities (major, minor, diminished, etc.)
3. Calculate confidence based on:
   - Match ratio (how many chord notes are present)
   - Penalty for extra notes (notes not in the chord)
4. Sort by confidence and return top matches

### Fretboard Service

Maps guitar fret positions to musical notes:

- Uses `STANDARD_TUNING` constant (EADGBE)
- Calculates octave based on open string pitch + fret offset
- Supports both chord and scale contexts

## 🎯 Code Quality Standards

### TypeScript Usage

- ✅ **Strict type checking** enabled
- ✅ Use interfaces for all data models
- ✅ Avoid `any` type (use `unknown` if needed)
- ✅ Prefer `const` over `let`

### Service Design

- ✅ Services are **stateless** (no instance variables)
- ✅ Use `providedIn: 'root'` for singletons
- ✅ All public methods have JSDoc comments
- ✅ Pure functions where possible

### Component Design

- ✅ Use `OnChanges` lifecycle hook for input changes
- ✅ Emit events via `@Output` EventEmitters
- ✅ Keep logic minimal - delegate to services
- ✅ Use standalone components (modern Angular)

### Constants

All magic numbers are defined in `core/constants.ts`:

```typescript
import { GUITAR_STRING_COUNT, FRET_RANGE_EXPLORER } from './core/constants';
```

## 🔧 Development Guidelines

### Adding a New Feature

1. **Define data model** in `models/` if needed
2. **Implement business logic** in an existing or new service
3. **Add JSDoc** to all public methods
4. **Write unit tests** for the service
5. **Create/update component** to use the service
6. **Test manually** in both Explorer and Builder modes

### Making Changes to Note Handling

**ALWAYS use `NoteFactory`** when creating notes:

```typescript
// ❌ BAD - Inconsistent format
const note = { pitch: 'C#', accidental: '', octave: 4 };

// ✅ GOOD - Use factory
const note = NoteFactory.create('C', '#', 4);
```

### Debugging

- Use Angular DevTools extension
- Check browser console for warnings (deprecated formats, etc.)
- Use `console.log` with descriptive labels
- Verify state with Angular component inspector

## 📖 Additional Documentation

- **[ARCHITECTURE_REVIEW.md](./ARCHITECTURE_REVIEW.md)** - Comprehensive code review, architectural analysis, and improvement recommendations
- **[PRODUCT_SPEC.md](./PRODUCT_SPEC.md)** - Detailed product requirements and specifications

## 🤝 Contributing

### Code Style

- Follow the existing code style (enforced by Prettier/ESLint)
- Add JSDoc comments to all public methods
- Write descriptive variable names
- Keep functions small and focused (< 50 lines)

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Write/update tests
4. Ensure all tests pass: `npm test`
5. Build successfully: `npm run build`
6. Create a PR with a clear description

### Commit Messages

Follow conventional commits:

```
feat: add support for drop-D tuning
fix: correct octave calculation for low E string
docs: update README with deployment instructions
refactor: extract chord voicing logic to service
test: add unit tests for NoteFactory
```

## 🐛 Known Issues & Limitations

1. **Enharmonic spelling**: Currently uses sharps by default. Context-aware sharp/flat selection (based on key) is not yet implemented.

2. **Chord quality limitations**: Harmonic and melodic minor scales use approximated 7th chord qualities (comments acknowledge this in `music-theory.service.ts`).

3. **Single tuning**: Only standard tuning (EADGBE) is supported. Alternate tunings would require parameterizing `STANDARD_TUNING`.

4. **No persistence**: User selections are not saved. Refresh clears all state.

5. **Desktop-focused**: UI is optimized for desktop. Mobile support is minimal.

## 📈 Performance Considerations

- **Chord identification** runs on every note selection - can be expensive with many notes
- **Fretboard re-rendering** recalculates all positions on range change
- Consider debouncing chord identification for smoother UX
- VexFlow sheet music rendering can be slow with many notes

## 🎵 Music Theory Reference

### Interval Names

- **Unison**: 0 semitones
- **Minor 2nd**: 1 semitone
- **Major 2nd**: 2 semitones
- **Minor 3rd**: 3 semitones
- **Major 3rd**: 4 semitones
- **Perfect 4th**: 5 semitones
- **Tritone**: 6 semitones
- **Perfect 5th**: 7 semitones
- **Minor 6th**: 8 semitones
- **Major 6th**: 9 semitones
- **Minor 7th**: 10 semitones
- **Major 7th**: 11 semitones
- **Octave**: 12 semitones

### Chord Qualities

- **Major**: Root + Major 3rd + Perfect 5th (C-E-G)
- **Minor**: Root + Minor 3rd + Perfect 5th (C-Eb-G)
- **Diminished**: Root + Minor 3rd + Diminished 5th (C-Eb-Gb)
- **Augmented**: Root + Major 3rd + Augmented 5th (C-E-G#)
- **Dominant 7th**: Major triad + Minor 7th (C-E-G-Bb)
- **Major 7th**: Major triad + Major 7th (C-E-G-B)
- **Minor 7th**: Minor triad + Minor 7th (C-Eb-G-Bb)
- **Half-diminished 7th**: Diminished triad + Minor 7th (C-Eb-Gb-Bb)
- **Diminished 7th**: Diminished triad + Diminished 7th (C-Eb-Gb-Bbb)

## 📄 License

[Add license information]

## 👥 Authors

[Add author information]

## 🙏 Acknowledgments

- **VexFlow** - Music notation rendering
- **Angular** - Application framework
- **Web Audio API** - Sound synthesis

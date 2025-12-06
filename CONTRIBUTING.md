# Contributing to Guitar Chord Explorer

Thank you for your interest in contributing! This document provides guidelines and standards for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Architecture Guidelines](#architecture-guidelines)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Pull Request Process](#pull-request-process)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Angular CLI 17
- Git
- A code editor (VS Code recommended)

### Setting Up Your Development Environment

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/guitar-chord-explorer.git
   cd guitar-chord-explorer/guitar-chord-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run tests** (when available):
   ```bash
   npm test
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions/updates

Examples:
```
feature/alternate-tunings
fix/octave-calculation-bug
refactor/extract-voicing-service
docs/update-api-documentation
test/add-note-factory-tests
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semi-colons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(fretboard): add support for drop-D tuning

Implements alternate tuning system allowing users to select
from predefined tunings including drop-D, DADGAD, and open-G.

Closes #42
```

```
fix(audio): correct frequency calculation for flat notes

The getFrequency method was not properly handling flat notes,
causing incorrect pitch playback. Updated NOTE_FREQUENCIES
map to include both sharp and flat note names.
```

## Code Standards

### TypeScript Guidelines

#### Type Safety

```typescript
// ❌ BAD - Avoid 'any'
function processNote(note: any) {
  return note.pitch + note.accidental;
}

// ✅ GOOD - Use specific types
function processNote(note: Note): string {
  return note.pitch + note.accidental;
}
```

#### Interfaces vs Types

```typescript
// ✅ Use interfaces for object shapes
interface FretboardPosition {
  string: number;
  fret: number;
  note: Note;
}

// ✅ Use types for unions/intersections
type AppMode = 'explorer' | 'builder';
type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented';
```

#### Constants

```typescript
// ❌ BAD - Magic numbers
if (stringNum >= 1 && stringNum <= 6) { }

// ✅ GOOD - Use constants from constants.ts
import { GUITAR_STRING_COUNT } from './core/constants';
if (stringNum >= 1 && stringNum <= GUITAR_STRING_COUNT) { }
```

### Note Creation Standard

**ALWAYS use `NoteFactory` to create notes**:

```typescript
// ❌ BAD - Direct object creation (inconsistent format)
const note = { pitch: 'C#', accidental: '', octave: 4 };

// ✅ GOOD - Use factory for consistency
import { NoteFactory } from './models';
const note = NoteFactory.create('C', '#', 4);

// ✅ GOOD - Parse from string
const note = NoteFactory.fromString('C#4');

// ✅ GOOD - Normalize legacy format
const normalized = NoteFactory.normalize(legacyNote);
```

### Service Design

```typescript
@Injectable({
  providedIn: 'root'  // ✅ Singleton services
})
export class MusicTheoryService {
  // ❌ BAD - Avoid instance state in services
  private currentScale: Scale;

  // ✅ GOOD - Pure, stateless methods
  getScale(root: Note, type: ScaleType): Scale {
    // Calculate and return
  }
}
```

### Component Design

```typescript
@Component({
  selector: 'app-fretboard',
  standalone: true,  // ✅ Use standalone components
  imports: [CommonModule]
})
export class FretboardComponent implements OnChanges {
  // ✅ Use @Input/@Output for communication
  @Input() chord: Chord | null = null;
  @Output() selectionChange = new EventEmitter<FretboardPosition[]>();

  // ✅ Delegate business logic to services
  constructor(private fretboardService: FretboardService) {}

  // ❌ BAD - Business logic in component
  calculateNoteAtFret(string: number, fret: number): Note {
    // Complex calculation...
  }

  // ✅ GOOD - Delegate to service
  getNoteAtFret(string: number, fret: number): Note {
    return this.fretboardService.getNoteAtPosition(string, fret);
  }
}
```

## Architecture Guidelines

### Layering

Follow the established 3-layer architecture:

```
Components (Presentation)
    ↓
Services (Business Logic)
    ↓
Models (Data Structures)
```

**Rules**:
- Components should NOT import from other components (except for composition)
- Services should NOT import from components
- Models should NOT import from services or components
- All business logic belongs in services

### File Organization

```
app/
├── core/                 # App-wide utilities
│   └── constants.ts      # All constants
├── models/               # Data interfaces
│   ├── note.model.ts
│   └── index.ts         # Barrel export
├── services/             # Business logic
│   └── *.service.ts
└── components/           # UI components
    └── */
        ├── *.component.ts
        ├── *.component.html
        └── *.component.scss
```

### Dependency Injection

```typescript
// ✅ Constructor injection
constructor(
  private musicTheory: MusicTheoryService,
  private fretboard: FretboardService
) {}

// ❌ Direct instantiation
const service = new MusicTheoryService();
```

## Testing Requirements

### Unit Tests

All new services MUST have unit tests:

```typescript
describe('NoteFactory', () => {
  describe('create', () => {
    it('should create a note with separated format', () => {
      const note = NoteFactory.create('C', '#', 4);
      expect(note).toEqual({ pitch: 'C', accidental: '#', octave: 4 });
    });

    it('should throw error for invalid pitch', () => {
      expect(() => NoteFactory.create('H', '', 4)).toThrow();
    });
  });

  describe('normalize', () => {
    it('should normalize combined format to separated', () => {
      const legacy = { pitch: 'C#', accidental: '', octave: 4 };
      const normalized = NoteFactory.normalize(legacy);
      expect(normalized).toEqual({ pitch: 'C', accidental: '#', octave: 4 });
    });
  });
});
```

### Test Coverage Goals

- **Services**: 80%+ coverage
- **Models**: 100% coverage (they're small and critical)
- **Components**: 60%+ coverage

### Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --code-coverage
```

## Documentation Standards

### JSDoc Requirements

All **public methods** in services must have JSDoc comments:

```typescript
/**
 * Generates a complete musical scale with all diatonic chords.
 *
 * Applies interval formulas to create scale notes, then builds triads
 * and seventh chords from each scale degree with proper Roman numeral
 * analysis.
 *
 * @param root - The tonic note of the scale (e.g., C for C Major)
 * @param scaleType - Type of scale (major, natural_minor, etc.)
 * @returns Scale object containing:
 *   - 7 scale notes (pitch classes, no octaves)
 *   - 14 chords (7 triads + 7 seventh chords)
 *
 * @example
 * const cMajor = musicTheory.getScale(
 *   NoteFactory.create('C'),
 *   'major'
 * );
 * console.log(cMajor.notes); // [C, D, E, F, G, A, B]
 * console.log(cMajor.chords[0].displayName); // "C"
 */
getScale(root: Note, scaleType: ScaleType): Scale {
  // Implementation...
}
```

### Component Documentation

Document all `@Input` and `@Output` properties:

```typescript
export class FretboardComponent {
  /**
   * The chord to display on the fretboard.
   * If null, fretboard shows empty or scale context.
   */
  @Input() chord: Chord | null = null;

  /**
   * Whether to show expanded view (12 frets) or compact view (4 frets).
   * Default: false (compact)
   */
  @Input() expandedView: boolean = false;

  /**
   * Emits whenever the user selects/deselects fretboard positions.
   * Emitted array includes only positions on unmuted strings.
   */
  @Output() selectionChange = new EventEmitter<FretboardPosition[]>();
}
```

### Inline Comments

```typescript
// ✅ GOOD - Explain WHY, not WHAT
// Use flats for keys in the circle of fifths flat side
const useFlats = FLAT_KEYS.includes(rootName);

// ❌ BAD - Obvious comments
// Increment i by 1
i++;
```

## Pull Request Process

### Before Submitting

1. **Run the build**: `npm run build` (must succeed)
2. **Run tests**: `npm test` (all must pass)
3. **Run linter**: `npm run lint` (no errors)
4. **Update documentation** if you changed public APIs
5. **Add tests** for new functionality
6. **Rebase on main** to avoid merge conflicts

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation update
- [ ] Test addition

## Changes Made
- Bullet point list of specific changes
- Include file paths for significant changes

## Testing
- Describe how you tested the changes
- List any manual testing steps

## Screenshots (if applicable)
For UI changes, include before/after screenshots

## Checklist
- [ ] Code follows the project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No console errors
```

### Review Process

1. **Automated checks** must pass (build, tests, lint)
2. **Code review** by at least one maintainer
3. **Address feedback** - make requested changes or discuss
4. **Final approval** - maintainer will merge

### After Merge

- Delete your feature branch
- Pull the updated main branch
- Celebrate! 🎉

## Style Guide

### Naming Conventions

```typescript
// Classes: PascalCase
class MusicTheoryService { }

// Interfaces: PascalCase
interface Note { }

// Constants: SCREAMING_SNAKE_CASE
const MAX_FRET_NUMBER = 24;

// Variables/functions: camelCase
const rootNote = getNoteAtFret(1, 0);

// Private methods: camelCase with leading underscore (optional)
private _calculateOctave() { }

// Boolean variables: Use is/has/should prefixes
const isValid = true;
const hasChord = false;
const shouldRender = true;
```

### File Naming

```
feature.component.ts     # Component
feature.service.ts       # Service
feature.model.ts         # Model/interface
feature.component.spec.ts  # Tests
```

### Import Organization

```typescript
// 1. Angular imports
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// 2. Third-party imports
import { Renderer, Stave } from 'vexflow';

// 3. Local imports - models
import { Note, Chord } from './models';

// 4. Local imports - services
import { MusicTheoryService } from './services/music-theory.service';

// 5. Local imports - constants
import { GUITAR_STRING_COUNT } from './core/constants';
```

## Common Pitfalls to Avoid

### 1. Creating Notes Incorrectly

```typescript
// ❌ WRONG
const note = { pitch: 'C#', accidental: '' };

// ✅ RIGHT
const note = NoteFactory.create('C', '#');
```

### 2. Magic Numbers

```typescript
// ❌ WRONG
if (fret >= 0 && fret <= 24) { }

// ✅ RIGHT
import { MAX_FRET_NUMBER } from './core/constants';
if (fret >= 0 && fret <= MAX_FRET_NUMBER) { }
```

### 3. Business Logic in Components

```typescript
// ❌ WRONG - Complex calculation in component
calculateChordVoicing(): FretboardPosition[] {
  // 50 lines of music theory...
}

// ✅ RIGHT - Delegate to service
getChordVoicing(): FretboardPosition[] {
  return this.fretboardService.getStandardVoicing(this.chord);
}
```

### 4. Not Handling Null/Undefined

```typescript
// ❌ WRONG
const notes = chord.notes.map(n => n.pitch);

// ✅ RIGHT
const notes = chord?.notes?.map(n => n.pitch) ?? [];
```

## Questions?

- Open an issue for discussion
- Tag maintainers in your PR
- Check existing issues/PRs for similar topics

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help each other learn and grow

Thank you for contributing! 🎸

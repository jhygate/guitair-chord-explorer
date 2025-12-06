import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chord, FretboardPosition, Scale } from '../../models';
import { FretboardService } from '../../services/fretboard.service';

interface StringPosition {
  string: number;
  positions: FretboardPosition[];
  isMuted: boolean;
}

@Component({
  selector: 'app-fretboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fretboard.component.html',
  styleUrl: './fretboard.component.scss'
})
export class FretboardComponent implements OnChanges {
  @Input() chord: Chord | null = null;
  @Input() scale: Scale | null = null;
  @Input() expandedView: boolean = false;
  @Input() autoSelectChord: boolean = true;
  @Output() selectionChange = new EventEmitter<FretboardPosition[]>();

  fretStart = 0;
  fretEnd = 3;
  frets: number[] = [];
  strings: StringPosition[] = [];
  selectedPositions: Set<string> = new Set();
  mutedStrings: Set<number> = new Set([1, 2, 3, 4, 5, 6]); // Start with all strings muted
  showScaleDegrees = true; // Toggle between scale degrees and note names
  previousChordName: string | null = null; // Track previous chord to detect changes

  constructor(private fretboardService: FretboardService) {
    this.updateFretRange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chord']) {
      this.updateFretboard();
    }
    if (changes['scale']) {
      this.updateFretboard();
    }
    if (changes['expandedView']) {
      // Adjust fret range based on expanded view
      this.fretEnd = this.expandedView ? this.fretStart + 11 : this.fretStart + 3;
      this.updateFretRange();
      this.updateFretboard();
    }
  }

  updateFretRange(): void {
    this.frets = [];
    for (let i = this.fretStart; i <= this.fretEnd; i++) {
      this.frets.push(i);
    }
  }

  updateFretboard(): void {
    // If we have a chord, show chord-based positions
    if (this.chord) {
      // Only clear selections and auto-select if this is a NEW chord (not just fret range change)
      const isNewChord = this.previousChordName !== this.chord.displayName;
      
      if (isNewChord && this.autoSelectChord) {
        // Clear muted strings and selections when loading a new chord
        this.mutedStrings.clear();
        this.selectedPositions.clear();
      }
      
      this.previousChordName = this.chord.displayName;
      
      const positions = this.fretboardService.getFretboardPositions(
        this.chord,
        this.fretStart,
        this.fretEnd
      );

      // Group positions by string
      this.strings = [];
      for (let stringNum = 1; stringNum <= 6; stringNum++) {
        const stringPositions = positions.filter(p => p.string === stringNum);
        this.strings.push({
          string: stringNum,
          positions: stringPositions,
          isMuted: this.mutedStrings.has(stringNum)
        });
        
        // Auto-select the first chord tone on each unmuted string ONLY for new chords AND if auto-select is enabled
        if (isNewChord && this.autoSelectChord && !this.mutedStrings.has(stringNum)) {
          const firstChordTone = stringPositions.find(p => p.isInChord);
          if (firstChordTone) {
            this.selectedPositions.add(`${stringNum}-${firstChordTone.fret}`);
          }
        }
      }
      
      // Emit the selection (only on new chord to set initial state)
      if (isNewChord && this.autoSelectChord) {
        this.emitSelectionChange();
      }
    } 
    // If we have a scale (builder mode), show scale-based positions
    else if (this.scale) {
      // Don't clear muted strings in builder mode - user controls them
      
      const positions = this.fretboardService.getScaleFretboardPositions(
        this.scale,
        this.fretStart,
        this.fretEnd
      );

      // Group positions by string
      this.strings = [];
      for (let stringNum = 1; stringNum <= 6; stringNum++) {
        const stringPositions = positions.filter(p => p.string === stringNum);
        this.strings.push({
          string: stringNum,
          positions: stringPositions,
          isMuted: this.mutedStrings.has(stringNum)
        });
      }
    }
    // No chord or scale - show empty fretboard with all positions clickable and ALL STRINGS MUTED
    else {
      // Start with all strings muted
      this.mutedStrings = new Set([1, 2, 3, 4, 5, 6]);
      
      this.strings = [];
      for (let stringNum = 1; stringNum <= 6; stringNum++) {
        const stringPositions: FretboardPosition[] = [];
        for (let fret = this.fretStart; fret <= this.fretEnd; fret++) {
          const note = this.fretboardService.getNoteAtPosition(stringNum, fret);
          stringPositions.push({
            string: stringNum,
            fret,
            note,
            isInChord: false,
            isRoot: false
          });
        }
        this.strings.push({
          string: stringNum,
          positions: stringPositions,
          isMuted: true  // All strings start muted
        });
      }
    }
  }

  moveUp(): void {
    if (this.fretStart > 0) {
      this.fretStart--;
      this.fretEnd--;
      this.updateFretRange();
      this.updateFretboard();
    }
  }

  moveDown(): void {
    if (this.fretEnd < 24) {
      this.fretStart++;
      this.fretEnd++;
      this.updateFretRange();
      this.updateFretboard();
    }
  }

  onPositionClick(position: FretboardPosition): void {
    const posKey = `${position.string}-${position.fret}`;
    
    // Clear any other selection on this string (only one note per string)
    for (let fret = 0; fret <= 24; fret++) {
      this.selectedPositions.delete(`${position.string}-${fret}`);
    }
    
    // Add the new selection
    this.selectedPositions.add(posKey);
    
    // Unmute the string if it was muted
    if (this.mutedStrings.has(position.string)) {
      this.mutedStrings.delete(position.string);
    }
    
    this.emitSelectionChange();
  }

  onStringDoubleClick(stringNum: number): void {
    // Toggle mute for this string (but preserve selected notes)
    if (this.mutedStrings.has(stringNum)) {
      // Unmuting the string
      this.mutedStrings.delete(stringNum);
      
      // Check if this string has any selected note
      let hasSelection = false;
      for (let fret = 0; fret <= 24; fret++) {
        if (this.selectedPositions.has(`${stringNum}-${fret}`)) {
          hasSelection = true;
          break;
        }
      }
      
      // If no note selected, default to open string (fret 0)
      if (!hasSelection) {
        this.selectedPositions.add(`${stringNum}-0`);
      }
    } else {
      // Muting the string - just set the mute flag
      this.mutedStrings.add(stringNum);
      // Don't clear selections - just mute the string
    }
    this.emitSelectionChange();
  }

  isPositionSelected(position: FretboardPosition): boolean {
    return this.selectedPositions.has(`${position.string}-${position.fret}`);
  }

  isStringMuted(stringNum: number): boolean {
    return this.mutedStrings.has(stringNum);
  }

  getPositionClass(position: FretboardPosition): string {
    const isSelected = this.isPositionSelected(position);
    const isMuted = this.isStringMuted(position.string);

    if (isMuted) {
      return 'muted';
    }

    if (isSelected) {
      return position.isInChord ? 'selected-in-chord' : 'selected-out-of-chord';
    }

    if (position.isInChord) {
      return position.isRoot ? 'ghost-root' : 'ghost-note';
    }

    return 'empty';
  }

  getPositionLabel(): string {
    if (this.fretStart === 0) {
      return 'Open';
    }
    return `${this.fretStart}`;
  }

  getNoteDisplay(position: FretboardPosition): string {
    return this.fretboardService.getNoteDisplayName(position.note);
  }

  getStringNoteName(stringNum: number): string {
    const stringNotes = ['E', 'B', 'G', 'D', 'A', 'E']; // High to low
    return stringNotes[stringNum - 1];
  }

  private emitSelectionChange(): void {
    const positions: FretboardPosition[] = [];
    
    // Only include positions that are NOT on muted strings
    this.selectedPositions.forEach(posKey => {
      const [stringNum, fret] = posKey.split('-').map(Number);
      
      // Skip if this string is muted
      if (this.mutedStrings.has(stringNum)) {
        return;
      }
      
      // Try to find the position from the current strings array
      const stringData = this.strings.find(s => s.string === stringNum);
      let position: FretboardPosition | undefined;
      
      if (stringData) {
        position = stringData.positions.find(p => p.fret === fret);
      }
      
      // If not found (e.g., fret is outside visible range), reconstruct it
      if (!position) {
        const note = this.fretboardService.getNoteAtPosition(stringNum, fret);
        position = {
          string: stringNum,
          fret: fret,
          note: note,
          isInChord: false, // We don't know if it's in chord when outside range, but that's ok for sheet music
          isRoot: false
        };
      }
      
      positions.push(position);
    });
    
    this.selectionChange.emit(positions);
  }

  getViewBoxWidth(): number {
    // Base width: 80px offset + (number of frets * 80px spacing) + 20px padding
    return 80 + (this.frets.length * 80) + 20;
  }

  getViewBox(): string {
    const width = this.getViewBoxWidth();
    return `0 0 ${width} 180`;
  }

  toggleScaleDegrees(): void {
    this.showScaleDegrees = !this.showScaleDegrees;
  }
}

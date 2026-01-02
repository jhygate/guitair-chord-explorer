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
  @Input() showScaleDegrees: boolean = true;
  @Input() set selectedPositions(positions: FretboardPosition[]) {
    this._selectedPositionsInput = positions;
    this.updateSelectedPositionsSet();
  }
  @Output() selectionChange = new EventEmitter<FretboardPosition[]>();

  private _selectedPositionsInput: FretboardPosition[] = [];
  
  fretStart = 0;
  fretEnd = 3;
  frets: number[] = [];
  strings: StringPosition[] = [];
  selectedPositionsSet: Set<string> = new Set();
  mutedStrings: Set<number> = new Set([1, 2, 3, 4, 5, 6]); // Start with all strings muted
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

  private updateSelectedPositionsSet(): void {
    this.selectedPositionsSet.clear();
    if (this._selectedPositionsInput) {
      this._selectedPositionsInput.forEach(pos => {
        this.selectedPositionsSet.add(`${pos.string}-${pos.fret}`);
      });
    }
    // If we have external input, we might want to unmute strings that have selections
    // But be careful not to override user muting if not intended.
    // For now, just sync the set.
  }

  updateFretRange(): void {
    this.frets = [];
    for (let i = this.fretStart; i <= this.fretEnd; i++) {
      this.frets.push(i);
    }
  }

  updateFretboard(): void {
    if (!this.chord && !this.scale) {
      // If no chord or scale, show empty fretboard
      this.strings = [1, 2, 3, 4, 5, 6].map(stringNum => ({
        string: stringNum,
        positions: [],
        isMuted: this.mutedStrings.has(stringNum)
      }));
      return;
    }

    // Check if we're loading a new chord (to handle auto-selection)
    // Only relevant if we have a chord
    if (this.chord) {
      // Only clear selections and auto-select if this is a NEW chord (not just fret range change)
      const isNewChord = this.previousChordName !== this.chord.displayName;
      
      if (isNewChord && this.autoSelectChord) {
        // Clear muted strings and selections when loading a new chord
        this.mutedStrings.clear();
        this.selectedPositionsSet.clear();
        this.previousChordName = this.chord.displayName;
      }

      this.strings = [1, 2, 3, 4, 5, 6].map(stringNum => {
        const stringPositions = this.fretboardService.getFretboardPositions(
          this.chord!, 
          this.fretStart, 
          this.fretEnd
        ).filter(pos => pos.string === stringNum);

        // Auto-select the first chord tone on each unmuted string ONLY for new chords AND if auto-select is enabled
        if (isNewChord && this.autoSelectChord && !this.mutedStrings.has(stringNum)) {
          const firstChordTone = stringPositions.find(p => p.isInChord);
          if (firstChordTone) {
            this.selectedPositionsSet.add(`${stringNum}-${firstChordTone.fret}`);
          }
        }

        return {
          string: stringNum,
          positions: stringPositions,
          isMuted: this.mutedStrings.has(stringNum)
        };
      });
      
      // Emit initial selection if we auto-selected notes
      if (isNewChord && this.autoSelectChord) {
        setTimeout(() => this.emitSelectionChange(), 0);
      }
    } else if (this.scale) {
      // Scale mode
      this.strings = [1, 2, 3, 4, 5, 6].map(stringNum => {
        const stringPositions = this.fretboardService.getScaleFretboardPositions( // Changed from getScalePositions to getScaleFretboardPositions
          this.scale!,
          this.fretStart,
          this.fretEnd
        ).filter(pos => pos.string === stringNum);
        
        return {
          string: stringNum,
          positions: stringPositions,
          isMuted: this.mutedStrings.has(stringNum)
        };
      });
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
    const key = `${position.string}-${position.fret}`;
    
    // If string is muted, unmute it first
    if (this.mutedStrings.has(position.string)) {
      this.mutedStrings.delete(position.string);
    }
    
    // Enforce one note per string:
    // Remove any other selected notes on this string
    const stringPrefix = `${position.string}-`;
    const positionsToRemove: string[] = [];
    
    this.selectedPositionsSet.forEach(posKey => {
      if (posKey.startsWith(stringPrefix) && posKey !== key) {
        positionsToRemove.push(posKey);
      }
    });
    
    positionsToRemove.forEach(p => this.selectedPositionsSet.delete(p));
    
    // Select the new note (always select, never toggle off by clicking same note)
    // To deselect, user must mute the string
    this.selectedPositionsSet.add(key);
    
    this.emitSelectionChange();
  }

  onStringDoubleClick(stringNum: number): void {
    if (this.mutedStrings.has(stringNum)) {
      this.mutedStrings.delete(stringNum);
      
      // Auto-select fret 0 (open string) if no note is selected on this string
      const stringPrefix = `${stringNum}-`;
      let hasSelection = false;
      this.selectedPositionsSet.forEach(posKey => {
        if (posKey.startsWith(stringPrefix)) {
          hasSelection = true;
        }
      });
      
      if (!hasSelection) {
        this.selectedPositionsSet.add(`${stringNum}-0`);
        this.emitSelectionChange();
      }
    } else {
      this.mutedStrings.add(stringNum);
      // We keep the selection in the set, but it won't be emitted because of the filter in emitSelectionChange
    }
    this.emitSelectionChange();
  }

  isPositionSelected(position: FretboardPosition): boolean {
    return this.selectedPositionsSet.has(`${position.string}-${position.fret}`);
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
    this.selectedPositionsSet.forEach(posKey => {
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
    // When fretStart === 0, we don't count fret 0 as taking up space (just the nut)
    const fretCount = this.fretStart === 0 ? this.frets.length : this.frets.length + 1;
    return 80 + (fretCount * 80) + 20;
  }

  getViewBox(): string {
    const width = this.getViewBoxWidth();
    return `0 0 ${width} 180`;
  }

  toggleScaleDegrees(): void {
    this.showScaleDegrees = !this.showScaleDegrees;
  }
}

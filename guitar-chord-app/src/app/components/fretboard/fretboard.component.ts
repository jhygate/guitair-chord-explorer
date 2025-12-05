import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chord, FretboardPosition } from '../../models';
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
  @Input() expandedView: boolean = false;
  @Output() selectionChange = new EventEmitter<FretboardPosition[]>();

  fretStart = 0;
  fretEnd = 3;
  frets: number[] = [];
  strings: StringPosition[] = [];
  selectedPositions: Set<string> = new Set();
  mutedStrings: Set<number> = new Set();

  constructor(private fretboardService: FretboardService) {
    this.updateFretRange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chord'] && this.chord) {
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
    if (!this.chord) return;

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

    if (this.selectedPositions.has(key)) {
      this.selectedPositions.delete(key);
    } else {
      // Clear other selections on this string
      for (let fret = 0; fret <= 24; fret++) {
        this.selectedPositions.delete(`${position.string}-${fret}`);
      }
      this.selectedPositions.add(key);
      // Unmute the string if it was muted
      this.mutedStrings.delete(position.string);
    }
    this.emitSelectionChange();
  }

  onStringDoubleClick(stringNum: number): void {
    // Toggle mute for this string
    if (this.mutedStrings.has(stringNum)) {
      this.mutedStrings.delete(stringNum);
    } else {
      this.mutedStrings.add(stringNum);
      // Clear any selections on this string
      for (let fret = 0; fret <= 24; fret++) {
        this.selectedPositions.delete(`${stringNum}-${fret}`);
      }
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
    const selectedPositionsList: FretboardPosition[] = [];

    // Iterate through all strings and their positions to find selected ones
    for (const stringData of this.strings) {
      for (const position of stringData.positions) {
        if (this.isPositionSelected(position)) {
          selectedPositionsList.push(position);
        }
      }
    }

    this.selectionChange.emit(selectedPositionsList);
  }

  getViewBoxWidth(): number {
    // Base width: 80px offset + (number of frets * 80px spacing) + 20px padding
    return 80 + (this.frets.length * 80) + 20;
  }

  getViewBox(): string {
    const width = this.getViewBoxWidth();
    return `0 0 ${width} 180`;
  }
}

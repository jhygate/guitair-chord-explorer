import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FretboardPosition } from '../../models';
import { ChordIdentifierService, ChordMatch } from '../../services/chord-identifier.service';

@Component({
  selector: 'app-chord-identifier',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chord-identifier.component.html',
  styleUrl: './chord-identifier.component.scss'
})
export class ChordIdentifierComponent implements OnChanges {
  @Input() selectedPositions: FretboardPosition[] = [];

  chordMatches: ChordMatch[] = [];
  selectedMatch: ChordMatch | null = null;
  showTopFive: boolean = true;

  constructor(private chordIdentifier: ChordIdentifierService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedPositions']) {
      this.identifyChords();
    }
  }

  identifyChords(): void {
    if (this.selectedPositions.length === 0) {
      this.chordMatches = [];
      this.selectedMatch = null;
      return;
    }

    const notes = this.selectedPositions.map(pos => pos.note);
    const allMatches = this.chordIdentifier.identifyChords(notes);
    this.chordMatches = allMatches;
    this.selectedMatch = null;
  }

  getDisplayMatches(): ChordMatch[] {
    return this.showTopFive ? this.chordMatches.slice(0, 5) : this.chordMatches;
  }

  onChordClick(match: ChordMatch): void {
    this.selectedMatch = this.selectedMatch === match ? null : match;
  }

  getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.95) return 'Exact match';
    if (confidence >= 0.8) return 'Very likely';
    if (confidence >= 0.65) return 'Likely';
    return 'Possible';
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.95) return 'bg-green-100 text-green-800';
    if (confidence >= 0.8) return 'bg-blue-100 text-blue-800';
    if (confidence >= 0.65) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  }
}

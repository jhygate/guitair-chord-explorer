import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MusicTheoryService } from './services/music-theory.service';
import { Note, Scale, ScaleType, SCALE_TYPE_LABELS, Chord, FretboardPosition } from './models';
import { FretboardComponent } from './components/fretboard/fretboard.component';
import { SheetMusicComponent } from './components/sheet-music/sheet-music.component';
import { ChordIdentifierComponent } from './components/chord-identifier/chord-identifier.component';

type AppMode = 'explorer' | 'builder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, FretboardComponent, SheetMusicComponent, ChordIdentifierComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  rootNotes: Note[] = [];
  scaleTypes: { value: ScaleType, label: string }[] = [];

  selectedRoot: Note | null = null;
  selectedScaleType: ScaleType = 'major';
  currentScale: Scale | null = null;
  selectedChord: Chord | null = null;
  selectedFretboardPositions: FretboardPosition[] = [];
  showSheetMusic: boolean = true;

  // Mode selection
  appMode: AppMode = 'explorer';
  builderSelectedPositions: FretboardPosition[] = [];

  constructor(private musicTheory: MusicTheoryService) {
    this.rootNotes = this.musicTheory.getAllRootNotes();
    this.scaleTypes = Object.entries(SCALE_TYPE_LABELS).map(([value, label]) => ({
      value: value as ScaleType,
      label
    }));

    // Set default selection
    this.selectedRoot = this.rootNotes[0]; // C
    this.updateScale();
  }

  updateScale() {
    if (this.selectedRoot) {
      this.currentScale = this.musicTheory.getScale(this.selectedRoot, this.selectedScaleType);
    }
  }

  onRootChange(index: number) {
    this.selectedRoot = this.rootNotes[index];
    this.updateScale();
  }

  onScaleTypeChange(type: ScaleType) {
    this.selectedScaleType = type;
    this.updateScale();
  }

  getScaleTypeLabel(type: ScaleType): string {
    return SCALE_TYPE_LABELS[type];
  }

  onChordClick(chord: Chord): void {
    this.selectedChord = chord;
    this.selectedFretboardPositions = [];
  }

  onFretboardSelectionChange(positions: FretboardPosition[]): void {
    this.selectedFretboardPositions = positions;
  }

  toggleSheetMusic(): void {
    this.showSheetMusic = !this.showSheetMusic;
  }

  setMode(mode: AppMode): void {
    this.appMode = mode;
    this.builderSelectedPositions = [];
  }

  onBuilderSelectionChange(positions: FretboardPosition[]): void {
    this.builderSelectedPositions = positions;
  }
}

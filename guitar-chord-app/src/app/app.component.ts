import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MusicTheoryService } from './services/music-theory.service';
import { FretboardService } from './services/fretboard.service';
import { Note, Scale, ScaleType, SCALE_TYPE_LABELS, Chord, FretboardPosition } from './models';
import { ChordMatch } from './services/chord-identifier.service';
import { FretboardComponent } from './components/fretboard/fretboard.component';
import { SheetMusicComponent } from './components/sheet-music/sheet-music.component';
import { PianoKeyboardComponent } from './components/piano-keyboard/piano-keyboard.component';
import { ChordIdentifierComponent } from './components/chord-identifier/chord-identifier.component';

type AppMode = 'explorer' | 'builder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, FretboardComponent, SheetMusicComponent, PianoKeyboardComponent, ChordIdentifierComponent],
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
  
  // Builder mode scale selection
  builderSelectedRoot: Note | null = null;
  builderSelectedScaleType: ScaleType = 'major';
  builderScale: Scale | null = null;
  selectedBuilderChord: Chord | null = null;
  selectedBuilderChordPositions: FretboardPosition[] = [];

  constructor(
    private musicTheory: MusicTheoryService,
    private fretboardService: FretboardService
  ) {
    this.rootNotes = this.musicTheory.getAllRootNotes();
    this.scaleTypes = Object.entries(SCALE_TYPE_LABELS).map(([value, label]) => ({
      value: value as ScaleType,
      label
    }));

    // Set default selection
    this.selectedRoot = this.rootNotes[0]; // C
    this.updateScale();
    
    // Set default builder selection
    this.builderSelectedRoot = this.rootNotes[0]; // C
    this.updateBuilderScale();
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

  updateBuilderScale(): void {
    if (this.builderSelectedRoot) {
      this.builderScale = this.musicTheory.getScale(this.builderSelectedRoot, this.builderSelectedScaleType);
    }
  }

  onBuilderRootChange(index: number): void {
    this.builderSelectedRoot = this.rootNotes[index];
    this.updateBuilderScale();
  }

  onBuilderScaleTypeChange(type: ScaleType): void {
    this.builderSelectedScaleType = type;
    this.updateBuilderScale();
  }

  onBuilderChordSelected(chordMatch: ChordMatch | null): void {
    if (chordMatch) {
      this.selectedBuilderChord = chordMatch.chord;
      
      // Generate positions for sheet music (standard voicing)
      // We use a standard range (0-12) and pick the first available note on each string
      const allPositions = this.fretboardService.getFretboardPositions(this.selectedBuilderChord, 0, 12);
      
      this.selectedBuilderChordPositions = [];
      
      // Group by string and pick the first chord tone
      for (let stringNum = 1; stringNum <= 6; stringNum++) {
        const stringPositions = allPositions.filter(p => p.string === stringNum);
        // Find the first position that is a chord tone
        const chordTone = stringPositions.find(p => p.isInChord);
        
        if (chordTone) {
          this.selectedBuilderChordPositions.push(chordTone);
        }
      }
    } else {
      this.selectedBuilderChord = null;
      this.selectedBuilderChordPositions = [];
    }
  }
}

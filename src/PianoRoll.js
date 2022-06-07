// Credit to https://raw.githubusercontent.com/kevinsqi/react-piano/master/demo/src/SoundfontProvider.js
import React from 'react';
import Soundfont from 'soundfont-player';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';

class PianoRoll extends React.Component {
  constructor(props) {
    super(props)

    const keyboardShortcuts = KeyboardShortcuts.create({
      firstNote: props.config.noteRange.first,
      lastNote: props.config.noteRange.last,
      keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });

    this.state = {keyboardShortcuts: keyboardShortcuts}
  }

  render() {
    return (
      <div className="Piano">
        <Piano
          noteRange={this.props.config.noteRange}
          keyboardShortcuts={this.state.keyboardShortcuts}
          playNote={this.props.playNote}
          activeNotes={this.props.activeNotes}
          stopNote={this.props.stopNote}
          disabled={!this.props.instrument}
          width={this.props.config.pianoWidth}
          onPlayNoteInput={this.props.onPlayNoteInput}
          onStopNoteInput={this.props.onStopNoteInput}
        />
      </div>
    )
  }
}

export default PianoRoll;

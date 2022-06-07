// Credit to https://raw.githubusercontent.com/kevinsqi/react-piano/master/demo/src/SoundfontProvider.js
import React from 'react';
import Soundfont from 'soundfont-player';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';

class SoundfontPianoRoll extends React.Component {
  static defaultProps = {
    format: 'mp3',
    soundfont: 'MusyngKite',
    instrumentName: 'acoustic_grand_piano',
  };

  constructor(props) {
    super(props);
    this.state = {
      activeAudioNodes: {},
      instrument: null,
    };
  }

  componentDidMount() {
    this.loadInstrument(this.props.instrumentName);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.instrumentName !== this.props.instrumentName) {
      this.loadInstrument(this.props.instrumentName);
    }

    if (prevState.instrument !== this.state.instrument) {
      if (!this.props.onLoad) {
        return;
      }
      this.props.onLoad({
        playNote: this.playNote,
        stopNote: this.stopNote,
        stopAllNotes: this.stopAllNotes,
      });
    }
  }

  loadInstrument = (instrumentName) => {
    // Re-trigger loading state
    this.setState({
      instrument: null,
    });
    Soundfont.instrument(this.props.audioContext, instrumentName, {
      format: this.props.format,
      soundfont: this.props.soundfont,
      nameToUrl: (name, soundfont, format) => {
        return `${this.props.hostname}/${soundfont}/${name}-${format}.js`;
      },
    }).then((instrument) => {
      this.setState({
        instrument,
      });
    });
  };

  playNote = (midiNumber) => {
    this.resumeAudio().then(() => {
      const audioNode = this.state.instrument.play(midiNumber);
      this.setState({
        activeAudioNodes: Object.assign({}, this.state.activeAudioNodes, {
          [midiNumber]: audioNode,
        }),
      });
    });
  };

  stopNote = (midiNumber) => {
    this.resumeAudio().then(() => {
      if (!this.state.activeAudioNodes[midiNumber]) {
        return;
      }
      const audioNode = this.state.activeAudioNodes[midiNumber];
      audioNode.stop();
      this.setState({
        activeAudioNodes: Object.assign({}, this.state.activeAudioNodes, { [midiNumber]: null }),
      });
    });
  };

  resumeAudio = () => {
    if (this.props.audioContext.state === 'suspended') {
      return this.props.audioContext.resume();
    } else {
      return Promise.resolve();
    }
  };

  // Clear any residual notes that don't get called with stopNote
  stopAllNotes = () => {
    this.props.audioContext.resume().then(() => {
      const activeAudioNodes = Object.values(this.state.activeAudioNodes);
      activeAudioNodes.forEach((node) => {
        if (node) {
          node.stop();
        }
      });
      this.setState({
        activeAudioNodes: {},
      });
    });
  };

  render() {
    return (
      <div className="Roll">
        <Piano
          noteRange={this.props.noteRange}
          keyboardShortcuts={this.props.keyboardShortcuts}
          playNote={this.playNote}
          stopNote={this.stopNote}
          disabled={!this.state.instrument}
          width={this.props.width}
          onPlayNoteInput={this.props.onPlayNoteInput}
          onStopNoteInput={this.props.onStopNoteInput}
        />
      </div>
    )
  }
}

export default SoundfontPianoRoll;

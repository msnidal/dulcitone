// Credit for the soundfont pianoroll code to https://raw.githubusercontent.com/kevinsqi/react-piano/master/demo/src/SoundfontProvider.js
import React from 'react';
import Soundfont from 'soundfont-player';
import './App.css';
import Dulcitone from './components/Dulcitone'

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const config = {
  soundfontHostname: 'https://d1pzp51pvbm36p.cloudfront.net',
  instrumentName: 'acoustic_grand_piano',
  soundfont: 'MusyngKite',
  format: 'mp3',
  noteRange: {
    first: 48, // middle C
    last: 59 // B above
  },
  maxNotes: 20,
  pianoWidth: 500,
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: config,
      audioContext: audioContext,
      activeAudioNodes: {},
      instrument: null,
    };
  }

  componentDidMount() {
    this.loadInstrument(this.state.config.instrumentName);
  }

  loadInstrument = (instrumentName) => {
    Soundfont.instrument(this.state.audioContext, this.state.config.instrumentName, {
      format: this.state.config.format,
      soundfont: this.state.config.soundfont,
      nameToUrl: (name, soundfont, format) => {
        return `${this.state.config.soundfontHostname}/${soundfont}/${name}-${format}.js`;
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
    if (this.state.audioContext.state === 'suspended') {
      return this.state.audioContext.resume();
    } else {
      return Promise.resolve();
    }
  };

  // Clear any residual notes that don't get called with stopNote
  stopAllNotes = () => {
    this.state.audioContext.resume().then(() => {
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
      <div className="App">
        <Dulcitone 
          audioContext={this.state.audioContext}
          instrument={this.state.instrument}
          playNote={this.playNote}
          stopNote={this.stopNote}
          soundfontHostname={this.state.config.soundfontHostname}
          config={this.state.config}
        />
      </div>
    );
  }
}

export default App;
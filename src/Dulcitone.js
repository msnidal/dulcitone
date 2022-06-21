import React from 'react';
import { Box, Button, Stack, HStack, VStack, Radio, RadioGroup, Text, Center, Grid, GridItem, Select } from '@chakra-ui/react'
import { CopyBlock, dracula } from "react-code-blocks";
import { KeyboardShortcuts, MidiNumbers } from 'react-piano';

import PianoRoll from './PianoRoll';
import SheetScore from './SheetScore';
import ConfigurationPanel from './ConfigurationPanel';

const sharpScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const flatScale = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const naturalKey = "C"
const sharpKeys = ["G", "D", "A", "E", "B"];
const flatKeys = ["F", "Bb", "Eb", "Ab", "Db"];
const validKeys = [naturalKey].concat(sharpKeys).concat(flatKeys)

const sharps = ["F", "C", "G", "D", "A", "E", "B"];
const flats = sharps.slice().reverse();

const restIndex = -1;



class Dulcitone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clef: 'treble',
      key: 'C',
      keyType: 'natural',
      keyModulations: [],
      hasRecorded: false,
      notes: [],
      noteTimers: {},
      activeNote: {
        note: [],
        startTime: null,
      },
      isPlaying: false,
    };
  }

  startPlayingNote = (midiNumber) => {
    if (Object.keys(this.state.noteTimers).indexOf(midiNumber) === -1 || this.state.noteTimers[midiNumber] === null) {
      const now = new Date()
      this.setState(prevState => ({
        hasRecorded: false,
        noteTimers: {...prevState.noteTimers, [midiNumber]: now}
      }));
    } else {
      this.setState({
        hasRecorded: false
      });
    }
  };

  stopPlayingNote = (midiNumber) => {
    if (this.state.hasRecorded === false && this.state.notes.length < this.props.config.maxNotes) {
      const now = new Date();
      this.setState(prevState => ({
        hasRecorded: true,
        notes: prevState.noteTimers[midiNumber] != null ? [...prevState.notes, {"note": midiNumber, "time": now - prevState.noteTimers[midiNumber]}] : prevState.notes,
        noteTimers: {...prevState.noteTimers, [midiNumber]: null}
      }));
    }
  };

  insertRest = () => {
    if (this.state.notes.length < this.props.config.maxNotes) {
      this.setState(prevState => ({
        notes: [...prevState.notes, {"note": restIndex, "time": 0}]
      }))
    }
  };

  mapNoteToKey = (note) => {
    //48 = middle C, 49 = c# 59 = B
    if (note >= 48 && note < 60) {
      const index = note - 48;
      var noteName = '';
      var accidental = ''

      if (this.state.keyType === 'flat') {
        noteName = flatScale[index]
      } else {
        noteName = sharpScale[index]
      }

      if (this.state.keyModulations.includes(noteName[0])) {
        if (noteName.length > 1) {
          accidental = ''
        } else {
          accidental = '='
        }
      } else if (noteName.length > 1) {
        accidental = this.state.keyType === 'flat' ? '_' : '^'
      }

      const pitch = noteName[0]

      return `${accidental}${pitch}`
    }
  };

  buildScore = (notes) => {
    var scoreText = `X: 1\nM: 4/4\nL: 1/4\nK: ${this.state.key} clef=${this.state.clef}\n                                                                                           \n|`
    for (let i = 0; i < notes.length; i++) {
      const prefix = i % 4 === 0 && i !== 0 ? ' |' : '';
      if (notes[i].note === restIndex) {
        scoreText += `${prefix} z`
      } else {
        const suffix = this.state.clef === 'treble' ? '' : ',';
        const noteNotation = this.mapNoteToKey(notes[i].note)

        scoreText += `${prefix} ${noteNotation}${suffix}`;
      }
    }

    return scoreText
  };

  setClef = (value) => {
    this.setState({
      clef: value
    })
  };

  setKey = (event) => {
    if (event.target.type === 'select-one' && validKeys.includes(event.target.selectedOptions[0].value)) {
      const key = event.target.selectedOptions[0].value;

      var keyType = 'natural'
      var keyModulations = []
      if (flatKeys.includes(key)) {
        keyType = 'flat';
        keyModulations = flats.slice(0, flatKeys.indexOf(key) + 1)
      } else if (sharpKeys.includes(key)) {
        keyType = 'sharp';
        keyModulations = sharps.slice(0, sharpKeys.indexOf(key) + 1)
      }

      this.setState({
        key: key,
        keyType: keyType,
        keyModulations: keyModulations
      })
   }
  };

  resetScore = () =>{
    this.setState({
      notes: []
    });
  };

  onNoteEvent = (event) => {
    if (!event) {
      return
    }

    event.notes.forEach(
      (note) => {
        const midiNumber = MidiNumbers.fromNote(note.name)
        const now = new Date()

        this.setState({activeNote: {note: [midiNumber], startTime: now}})

        setTimeout(
          () => {
            this.setState((previousState) => {
              if (previousState.activeNote.startTime === now) {
                return {
                  activeNote: {note: [], startTime: null}
                }
              }
            })
          },
          note.duration * 900
        )
      }
    )
  }

  onLineEnd = (event) => {
    if (!event || event.milliseconds === 0) {
      return
    }

    this.setState({activeNote: {note: [], startTime: null}, isPlaying: false})
  }

  replay = () => {
    this.setState({isPlaying: true})
  }

  render() {
    const scoreText = this.buildScore(this.state.notes);

    return (
      <Center>
      <Box borderWidth='1px' borderRadius='lg'>
        <Grid templateRows={'200px 250px 100px'} gap={6}>
          <GridItem>
            <SheetScore
              scoreText={scoreText} 
              isPlaying={this.state.isPlaying}
              onEvent={this.onNoteEvent}
              onLineEnd={this.onLineEnd}
            />
          </GridItem>
          <GridItem>
            <HStack spacing={10}>
              <PianoRoll
                config={this.props.config}
                instrument={this.props.instrument}
                onPlayNoteInput={this.startPlayingNote}
                onStopNoteInput={this.stopPlayingNote}
                activeNotes={this.state.activeNote.note}
                playNote={this.props.playNote}
                stopNote={this.props.stopNote}
              />
              <Button onClick={this.insertRest}>Rest</Button>
              <CopyBlock
                text={scoreText}
                theme={dracula}
                language={'text'}
              />
            </HStack>
          </GridItem>
          <GridItem>
            <ConfigurationPanel 
              validKeys={validKeys} 
              config={this.props.config} 
              setClef={this.setClef} 
              setKey={this.setKey} 
              resetScore={this.resetScore} 
              replay={this.replay} 
              submit={this.props.submit} 
            />
          </GridItem>
        </Grid>
      </Box>
      </Center>
    );
  }
}

export default Dulcitone;
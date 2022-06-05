import React from 'react';
import { Box, Stack, HStack, VStack, Flex, Spacer, Radio, RadioGroup, Text, Heading, Center, Grid, GridItem, Select } from '@chakra-ui/react'
import { CopyBlock, dracula } from "react-code-blocks";
import { Piano, KeyboardShortcuts } from 'react-piano';
import { Button, ButtonGroup } from '@chakra-ui/react'

import SoundfontPianoRoll from './SoundfrontPianoRoll';
import SheetScore from './SheetScore';

const sharpScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const flatScale = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const naturalKey = "C"
const sharpKeys = ["G", "D", "A", "E", "B"];
const flatKeys = ["F", "Bb", "Eb", "Ab", "Db"];
const validKeys = [naturalKey].concat(sharpKeys).concat(flatKeys)

const sharps = ["F", "C", "G", "D", "A", "E", "B"];
const flats = sharps.slice().reverse();

class Score extends React.Component {
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
      config: {
        instrumentName: 'acoustic_grand_piano',
        noteRange: {
          first: 48, // middle C
          last: 59 // B above
        },
        keyboardShortcutOffset: 0,
        maxNotes: 20,
        pianoWidth: 500,
      },
    };

    this.startPlayingNote = this.startPlayingNote.bind(this);
    this.stopPlayingNote = this.stopPlayingNote.bind(this);
    this.resetScore = this.resetScore.bind(this);
    this.setClef = this.setClef.bind(this);
    this.setKey = this.setKey.bind(this);
    this.mapNoteToKey = this.mapNoteToKey.bind(this);
  }

  startPlayingNote = midiNumber => {
    if (Object.keys(this.state.noteTimers).indexOf(midiNumber) == -1 || this.state.noteTimers[midiNumber] == null) {
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

  stopPlayingNote = midiNumber => {
    if (this.state.hasRecorded === false && this.state.notes.length < this.state.config.maxNotes) {
      const now = new Date();
      this.setState(prevState => ({
        hasRecorded: true,
        notes: prevState.noteTimers[midiNumber] != null ? [...prevState.notes, {"note": midiNumber, "time": now - prevState.noteTimers[midiNumber]}] : prevState.notes,
        noteTimers: {...prevState.noteTimers, [midiNumber]: null}
      }));
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
      const prefix = i % 4 == 0 && i != 0 ? ' |' : '';
      const suffix = this.state.clef == 'treble' ? '' : ',';
      const noteNotation = this.mapNoteToKey(notes[i].note)

      scoreText += `${prefix} ${noteNotation}${suffix}`;
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

  resetScore() {
    this.setState({
      notes: []
    });
  };

  render() {
    const keyboardShortcuts = KeyboardShortcuts.create({
      firstNote: this.state.config.noteRange.first + this.state.config.keyboardShortcutOffset,
      lastNote: this.state.config.noteRange.last + this.state.config.keyboardShortcutOffset,
      keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });
    const scoreText = this.buildScore(this.state.notes);

    return (
      <Center>
      <Box borderWidth='1px' borderRadius='lg'>
        <Grid templateRows={'200px 100px 1fr'} gap={6}>
          <GridItem>
            <SheetScore scoreText={scoreText} />
          </GridItem>
          <GridItem>
            <Grid templateColumns={'1fr 1fr 1fr'} gap={10}>
              <GridItem>
                <VStack>
                  <Text fontSize='md'>Select a key:</Text>
                  <Select onChange={this.setKey}>
                    {validKeys.map((object, i) => <option value={object}>{object}</option>)}
                  </Select>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack>
                  <Text fontSize='md'>Select a clef:</Text>
                  <RadioGroup defaultValue='treble' onChange={this.setClef}>
                    <Stack>
                      <Radio value='treble'>Treble</Radio>
                      <Radio value='bass'>Bass</Radio>
                    </Stack>
                  </RadioGroup>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack>
                  <Button onClick={this.resetScore}>Reset</Button>
                  <Button onClick={this.props.submit}>Submit</Button>
                </VStack>
              </GridItem>
            </Grid>
          </GridItem>
          <GridItem>
            <HStack spacing={24}>
              <SoundfontPianoRoll
                audioContext={this.props.audioContext}
                hostname={this.props.soundfontHostname}
                instrumentName={this.state.config.instrumentName}
                noteRange={this.state.config.noteRange}
                width={this.state.config.pianoWidth}
                onPlayNoteInput={this.startPlayingNote}
                onStopNoteInput={this.stopPlayingNote}
                keyboardShortcuts={keyboardShortcuts}
              />
              <CopyBlock
                text={scoreText}
                theme={dracula}
              />
            </HStack>
          </GridItem>
        </Grid>
      </Box>
      </Center>
    );
  }
}

export default Score;
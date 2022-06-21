import { Box, Button, Stack, HStack, VStack, Radio, RadioGroup, Text, Center, Grid, GridItem, Select } from '@chakra-ui/react'
import validKeys from './Dulcitone'

function ConfigurationPanel(props) {
  return (
    <Grid templateColumns={'1fr 1fr 1fr'} gap={10}>
      <GridItem>
        <VStack>
          <Text fontSize='md'>Select a key:</Text>
          <Select onChange={props.setKey}>
            {props.validKeys.map((object, i) => <option value={object} key={i}>{object}</option>)}
          </Select>
        </VStack>
      </GridItem>
      <GridItem>
        <VStack>
          <Text fontSize='md'>Select a clef:</Text>
          <RadioGroup defaultValue='treble' onChange={props.setClef}>
            <Stack>
              <Radio value='treble'>Treble</Radio>
              <Radio value='bass'>Bass</Radio>
            </Stack>
          </RadioGroup>
        </VStack>
      </GridItem>
      <GridItem>
        <VStack>
          <Button onClick={props.replay}>Replay!</Button>
          <Button onClick={props.resetScore}>Clear Notes</Button>
        </VStack>
      </GridItem>
    </Grid>
  )
}

export default ConfigurationPanel
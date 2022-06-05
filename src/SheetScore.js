import { Box, Heading } from '@chakra-ui/react'
import SheetMusic from '@slnsw/react-sheet-music';

function SheetScore(props) {
  return (
    <Box>
      <Heading>Dulcitone</Heading>
      <SheetMusic
        notation={props.scoreText}
      />
    </Box>
  );
}

export default SheetScore;

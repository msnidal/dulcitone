import { Box, Button, Stack, HStack, VStack, Radio, RadioGroup, Text, Center, Grid, GridItem, Select, SkeletonText } from '@chakra-ui/react'

function PredictDisplay(props) {
  const predictText = props.predictText 

  if (predictText == null) {
    return (<SkeletonText />)
  } else {
    return (<Text fontSize='lg'>{props.predictText}</Text>)
  }
}

export default PredictDisplay

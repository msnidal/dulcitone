import { Text, SkeletonText } from '@chakra-ui/react'

function PredictDisplay(props) {
  const predictText = props.predictText 

  if (predictText == null) {
    return (<SkeletonText />)
  } else {
    return (<Text fontSize='lg'>{props.predictText}</Text>)
  }
}

export default PredictDisplay

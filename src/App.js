import './App.css';
import Score from './Score.js'

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

function App() {
  return (
    <div className="App">
      <Score 
        audioContext={audioContext}
        soundfontHostname={soundfontHostname}
        submit={() => console.log("Hello")}
      />
    </div>
  );
}

export default App;

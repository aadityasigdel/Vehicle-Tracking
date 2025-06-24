import './App.css'
import { GoogleMap, LoadScript } from '@react-google-maps/api'
import MapComponent from './components/MapComponent'
import FetchData from './utils/api'

function App() {

  return(
    <>
    <FetchData/>
    <MapComponent/>
    </>
  )
}

export default App;

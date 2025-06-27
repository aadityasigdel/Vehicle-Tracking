import './App.css'
import { GoogleMap, LoadScript } from '@react-google-maps/api'
import MapComponent from './components/MapComponent'
import FetchData from './utils/api'

function App() {

  return (
    <>
<div className="flex flex-col h-screen w-full max-w-screen-xl mx-auto p-8 ">
  <FetchData />
  <div className="flex-grow">
    <MapComponent />
  </div>
</div>

    </>
  )
}

export default App;

import { GoogleMap, LoadScript } from "@react-google-maps/api";
import {contextData} from '../ContextApi/Context'
import { useContext } from "react";

export default function MapComponent() {
  const {apidata, setapidata} = useContext(contextData);

  const DefaultStyle = {
    width: "100%",
    height: "80vh"
  }

  const defaultCenter = {
    lat: 27.7172,
    lng: 85.3240
  }

     console.log("Fetched Data:", apidata);

  return (
    <>
      <LoadScript googleMapsApiKey="AIzaSyAmhPPLqzBFkyrkmaimjjKnFFLRd2SqzZI">
        <GoogleMap
          center={defaultCenter}
          mapContainerStyle={DefaultStyle}
          zoom={15}
        />
      </LoadScript>

    </>
  );
}

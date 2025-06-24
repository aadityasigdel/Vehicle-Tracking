import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { contextData } from '../ContextApi/Context'
import { useContext } from "react";

export default function MapComponent() {
  const { apidata, setapidata } = useContext(contextData);

  const DefaultStyle = {
    width: "100%",
    height: "80vh"
  }

  const defaultCenter = apidata.length > 0
    ? {
      lat: parseFloat(apidata[0].latitude),
      lng: parseFloat(apidata[0].longitude)
    }
    : {
      lat: 27.7172,
      lng: 85.3240
    };

  console.log("Fetched Data:", apidata);



  return (
    <>
      <div className="felx border-3 border-black rounded-xl ">
        <LoadScript googleMapsApiKey="AIzaSyAmhPPLqzBFkyrkmaimjjKnFFLRd2SqzZI">
          <GoogleMap
            center={defaultCenter}
            mapContainerStyle={DefaultStyle}
            zoom={15}


          >
            {apidata.map((item) => (
              <Marker
                key={item.riderId}
                position={{ lat: item.latitude, lng: item.longitude }}
                label={{
                  text: item.name,
                  color: 'white',
                  fontWeight: "bold",
                  fontSize: "14px"

                }
                }
                icon={{
                  url: "https://www.svgrepo.com/show/122485/car-placeholder.svg",
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
            ))}
          </GoogleMap>


        </LoadScript>
      </div>
    </>
  );
}

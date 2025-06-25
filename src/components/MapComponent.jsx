import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import { contextData } from '../ContextApi/Context';
import { useContext } from "react";
import Bike from "../assets/Bike.jpg";
import Car from '../assets/car.jpg';
import { useState, useEffect } from "react";

export default function MapComponent() {

  //Access Data from Api
  const { apidata, setapidata } = useContext(contextData);

  //Stores location data for prolyline
  const [LocationData, setLocationData] = useState([]);

  // Map Height and Width
  const DefaultStyle = {
    width: "100%",
    height: "80vh"
  }

  //Map centred according to Api Location (Adjust to KTM if no Data found)
  const defaultCenter = apidata.length > 0
    ? {
      lat: parseFloat(apidata[0].latitude),
      lng: parseFloat(apidata[0].longitude)
    }
    : {
      lat: 27.7172,
      lng: 85.3240
    };

  //Stores location data and Rider data from api to create ProlyLine
  useEffect(() => {
    if (apidata.length > 0) {
      setLocationData((prev) => {
        const updated = { ...prev };

        apidata.forEach((rider) => {
          const newPoint = {
            lat: parseFloat(rider.latitude),
            lng: parseFloat(rider.longitude),
          };

          const id = rider.riderId;

          if (!updated[id]) {
            updated[id] = [];
          }

          updated[id].push(newPoint);
        });
        return updated;
      });
    }
  }, [apidata]);


  console.log("Fetched Data:", apidata);



  return (
    <>
      <div className="flex border-t-3 border-r-3 border-l-3 border-black rounded-t-xl ">

        {/*Loads the Google Map Component */}
        <LoadScript googleMapsApiKey="AIzaSyAmhPPLqzBFkyrkmaimjjKnFFLRd2SqzZI">
          <GoogleMap
            center={defaultCenter}
            mapContainerStyle={DefaultStyle}
            zoom={15}


          >
            {/*Loads Marker Data from Api*/}
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
                  url: item.categoryId === 1
                    ? { Bike }
                    : { Car },
                  scaledSize: new window.google.maps.Size(60, 60),
                }}

              />
            ))}

          {/*Creates ProlyLine from stored data */}
            {Object.entries(LocationData).map(([riderId, path]) => (
              <Polyline
                key={riderId}
                path={path}
                options={{
                  strokeColor: "#FF0000",
                  strokeOpacity: 1.0,
                  strokeWeight: 2,
                }}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
      <div className="bg-gray-100 p-4 text-sm  border-b-3 border-r-3 border-l-3 border-black rounded-b-xl">
        <h3 className="font-semibold mb-2">Live Vehicle Info</h3>
        <ul className="space-y-1">

        </ul>
      </div>
    </>
  );
}

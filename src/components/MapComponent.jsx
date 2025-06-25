import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import { useContext, useEffect, useState } from "react";
import Bike from "../assets/Bike.jpg";
import Car from '../assets/car.jpg';
import { contextData } from '../ContextApi/Context';

export default function MapComponent() {

  //Access Data from Api
  const { apidata, setapidata } = useContext(contextData);

  //Stores Selected RiderId 
  const [selectedRiderId, setSelectedRiderId] = useState(null);

  //Stores location data for prolyline
  const [LocationData, setLocationData] = useState({});

  // Map Height and Width
  const DefaultStyle = {
    width: "100%",
    height: "65vh"
  }

  const selectedRider = apidata.find(rider => rider.riderId === selectedRiderId);

  //Map centred according to Api Location (Adjust to KTM if no Data found)
  const defaultCenter = {
      lat: 27.7172,
      lng: 85.3240
    };

      const mapCenter = selectedRider
    ? { lat: parseFloat(selectedRider.latitude), lng: parseFloat(selectedRider.longitude) }
    : defaultCenter;



  //Stores location data and Rider data from api to create ProlyLine
  useEffect(() => {
    if (apidata.length > 0) {
      // Build new LocationData from scratch to avoid duplicates
      const updated = {};

      apidata.forEach((rider) => {
        const id = rider.riderId;
        const newPoint = {
          lat: parseFloat(rider.latitude),
          lng: parseFloat(rider.longitude),
        };

        if (!updated[id]) {
          updated[id] = [];
        }


        if (LocationData[id]) {
          updated[id] = [...LocationData[id]];
        }


        updated[id].push(newPoint);

        if (updated[id].length > 40) {
          updated[id].shift();
        }
      });

      setLocationData(updated);
    }
  }, [apidata]);


  console.log("Fetched Data:", apidata);



  return (
    <>
      <div className="flex flex-col m-h-screen">
        <header className=" text-black p-4 font-bold text-xl flex justify-center items-center  border-t-3 border-r-3 border-l-3 border-black rounded-t-xl">
          <div>Live Vehicle Tracking Dashboard</div>
        </header>

        <div className="flex  border-r-3 border-l-3 border-black  ">

          {/*Loads the Google Map Component */}
          <LoadScript googleMapsApiKey="AIzaSyAmhPPLqzBFkyrkmaimjjKnFFLRd2SqzZI">
            <GoogleMap
              center={mapCenter}
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
                    color: 'black',
                    fontWeight: "bold",
                    fontSize: "14px"

                  }
                  }
                  icon={{
                    url: item.categoryId === 1
                      ? Bike
                      : Car,
                    scaledSize: new window.google.maps.Size(40, 40),
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

        {/*Choose Vehicle Ro follow */}
        <div className="bg-gray-100 p-4 text-sm border-b-3 border-r-3 border-l-3 border-black rounded-b-xl">
          <h3 className="font-semibold mb-2">Live Vehicle Info</h3>
          <h1 className="mb-2 text-lg font-semibold">Choose Vehicle to follow</h1>
          <div className="flex flex-col space-y-2">
            {apidata.map((data) => (
              <button
                key={data.riderId}
                className="px-4 py-2 bg-amber-600 rounded-xl border-2 border-gray-300 text-white "
                onClick={() => setSelectedRiderId(data.riderId)}
              >
                {data.name}
              </button>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

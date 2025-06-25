import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import { useContext, useEffect, useState } from "react";
import Bike from "../assets/Bike.jpg";
import Car from '../assets/car.jpg';
import { contextData } from '../ContextApi/Context';

const libraries = ["geometry"];

export default function MapComponent() {

  //Access Data from Api
  const { apidata, setapidata } = useContext(contextData);

  //Stores Selected RiderId 
  const [selectedRiderId, setSelectedRiderId] = useState(null);

  //Stores location data for prolyline
  const [LocationData, setLocationData] = useState({});

  //Stores Vehicle speed
  const [speeds, setSpeeds] = useState({});


  //Loading Fix
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAmhPPLqzBFkyrkmaimjjKnFFLRd2SqzZI",
    libraries: libraries,
  });

  // Map Height and Width
  const DefaultStyle = {
    width: "100%",
    height: "55vh"
  }

  const selectedRider = apidata.find(rider => rider.riderId === selectedRiderId);

  //Map centred to Adjust to KTM if no Data found
  const defaultCenter = {
    lat: 27.7172,
    lng: 85.3240
  };

  //centre map according to User
  const mapCenter = selectedRider
    ? { lat: parseFloat(selectedRider.latitude), lng: parseFloat(selectedRider.longitude) }
    : defaultCenter;



  //Stores location data and Rider data from api to create ProlyLine
  useEffect(() => {
    if (!isLoaded) return;

    if (apidata.length > 0) {
      const updated = {};
      const newSpeeds = {};

      apidata.forEach((rider) => {
        const id = rider.riderId;
        const newPoint = {
          lat: parseFloat(rider.latitude),
          lng: parseFloat(rider.longitude),
        };

        if (!updated[id]) updated[id] = [];
        if (LocationData[id]) updated[id] = [...LocationData[id]];

        updated[id].push(newPoint);

        if (updated[id].length > 40) updated[id].shift();


        // Speed calculation 
        const len = updated[id].length;
        if (len > 1) {
          const prevPoint = updated[id][len - 2];
          const currPoint = updated[id][len - 1];

          //Calculate Distance
          const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
            prevPoint,
            currPoint
          );

          //calculate Speed
          const distanceInKm = distanceInMeters / 1000;
          const timeInHours = 5 / 3600;
          const speed = distanceInKm / timeInHours;

          newSpeeds[id] = speed.toFixed(2);
        }
      });

      setLocationData(updated);
      setSpeeds(newSpeeds);
    }
  }, [apidata]);

  console.log(apidata)

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <>
      <div className="flex flex-col m-h-screen">
        <header className="bg-white text-black p-4 font-bold text-xl text-center border-x-2 border-t-2 border-gray-700 shadow-md rounded-t-xl">
          <div>Live Vehicle Tracking </div>
        </header>
        <div className="flex border-x-2 border-gray-700 shadow-inner">

          {/*Loads the Google Map Component */}

          <GoogleMap
            center={mapCenter}
            mapContainerStyle={DefaultStyle}
            zoom={15}


          >
            {/*Loads Marker Data from Api*/}
            {apidata.map((item) => (
              <Marker
                key={item.riderId}
                position={{ lat: parseFloat(item.latitude), lng: parseFloat(item.longitude) }}
                label={{
                  text: item.name,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  fontFamily: 'Roboto',
                }}
                icon={
                  window.google && window.google.maps
                    ? {
                      url: item.categoryId === 1 ? Bike : Car,
                      scaledSize: new window.google.maps.Size(60, 60),
                      labelOrigin: new window.google.maps.Point(30, 70)
                    }
                    : undefined
                }
              />
            ))}

            {/*Creates ProlyLine from stored data */}
            {Object.entries(LocationData).map(([riderId, path]) => (
              <Polyline
                key={riderId}
                path={path}
                options={{
                  strokeColor: "blue",
                  strokeOpacity: 1.0,
                  strokeWeight: 2,
                }}
              />
            ))}
          </GoogleMap>
        </div>

        {/* Choose Vehicle to Follow */}
        <div className="bg-gray-200 p-4 text-sm border-x-2 border-b-2 border-gray-700 rounded-b-xl shadow-md">
          <h3 className="font-semibold mb-2 text-amber-800">Live Vehicle Info</h3>
          <div className="flex flex-wrap gap-3">
            {apidata.map((data) => (
              <div key={data.riderId} className="relative group">
                <button
                  className="bg-white border-amber-300 px-3 py-1 rounded-md border-2 text-amber-800 hover:border-amber-400"
                  onClick={() => setSelectedRiderId(data.riderId)}
                >
                  {data.name}
                  <p>
                    Speed: {speeds[data.riderId] ? `${speeds[data.riderId]} km/h` : 'Calculating...'}
                  </p>
                </button>

                {/* Tooltip on hover */}
                <div className="absolute z-10 hidden group-hover:block bg-white text-xs text-gray-800 border border-gray-300 rounded shadow-md p-2 w-60 top-full left-1/2 transform -translate-x-1/2 mt-1">
                  <p><span className="font-semibold">Branch:</span> {data.branchName}</p>
                  <p><span className="font-semibold">Mobile:</span> {data.mobileNo}</p>
                  <p><span className="font-semibold">Vehicle No:</span> {data.vehicleNumber}</p>
                  <p><span className="font-semibold">Brand:</span> {data.vehicleBrand}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

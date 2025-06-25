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

  //Stores Vehicle speed
  const [speeds, setSpeeds] = useState({});


  // Map Height and Width
  const DefaultStyle = {
    width: "100%",
    height: "65vh"
  }

  const selectedRider = apidata.find(rider => rider.riderId === selectedRiderId);

  // Haversine formula to calculate distance between two lat/lng in kilometers
  function calculateDistance(lat1, lon1, lat2, lon2) {

    // Radius of Earth in km
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }


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
        const timeArr = rider.timestamp;
        const currentTime = new Date(...timeArr);

        const prevIndex = updated[id].length - 2;
        const currIndex = updated[id].length - 1;

        if (prevIndex >= 0) {
          const prevPoint = updated[id][prevIndex];
          const currPoint = updated[id][currIndex];

          const prevTime = new Date(currentTime.getTime() - 5000);

          const distance = calculateDistance(
            prevPoint.lat,
            prevPoint.lng,
            currPoint.lat,
            currPoint.lng
          );

          const timeInHours = 5 / 3600;
          const speed = distance / timeInHours;

          newSpeeds[id] = speed.toFixed(2);
        }
      });

      setLocationData(updated);
      setSpeeds(newSpeeds);
    }
  }, [apidata]);


  console.log("Fetched Data:", apidata);



  return (
    <>
      <div className="flex flex-col m-h-screen">
        <header className="bg-white text-black p-4 font-bold text-xl text-center border-x-2 border-t-2 border-gray-700 shadow-md rounded-t-xl">
          <div>Live Vehicle Tracking </div>
        </header>
        <div className="flex border-x-2 border-gray-700 shadow-inner">

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
                    color: item.categoryId = 'black',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    fontFamily: 'Roboto',
                  }}
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

        {/*Choose Vehicle to follow */}
        <div className="bg-gray-200 p-4 text-sm border-x-2 border-b-2 border-gray-700 rounded-b-xl shadow-md">
          <h3 className="font-semibold mb-2 text-amber-800">Live Vehicle Info</h3>
          <div className="flex flex-wrap gap-3">
            {apidata.map((data) => (
              <button
                key={data.riderId}
                className='bg-white border-amber-300 px-3 rounded-md border-2 text-amber-800 hover:border-amber-400'

                onClick={() => setSelectedRiderId(data.riderId)}
              >
                {data.name}
                <p>
                  Speed: {speeds[data.riderId] ? `${speeds[data.riderId]} km/h` : 'Calculating...'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

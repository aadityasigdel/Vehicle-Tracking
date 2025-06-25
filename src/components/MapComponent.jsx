import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from "@react-google-maps/api";
import { useContext, useEffect, useState } from "react";
import Bike from "../assets/Bike.svg";
import Car from '../assets/car.png';
import { contextData } from '../ContextApi/Context';

const libraries = ["geometry"];

export default function MapComponent() {

  const { apidata, setapidata } = useContext(contextData);

  const [selectedRiderId, setSelectedRiderId] = useState(null);
  const [LocationData, setLocationData] = useState({});
  const [speeds, setSpeeds] = useState({});

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAmhPPLqzBFkyrkmaimjjKnFFLRd2SqzZI",
    libraries: libraries,
  });

  const DefaultStyle = { width: "100%", height: "55vh" };

  const selectedRider = apidata.find(rider => rider.riderId === selectedRiderId);

  const defaultCenter = { lat: 27.7172, lng: 85.3240 };
  const mapCenter = selectedRider
    ? { lat: parseFloat(selectedRider.latitude), lng: parseFloat(selectedRider.longitude) }
    : defaultCenter;

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

        const len = updated[id].length;
        if (len > 1) {
          const prevPoint = updated[id][len - 2];
          const currPoint = updated[id][len - 1];

          const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
            prevPoint,
            currPoint
          );

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

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="flex flex-col m-h-screen">
      <header className="bg-white text-black p-4 font-bold text-xl text-center border-x-2 border-t-2 border-gray-700 shadow-md rounded-t-xl">
        <div>Live Vehicle Tracking</div>
      </header>

      <div className="flex border-x-2 border-gray-700 shadow-inner">
        <GoogleMap
          center={mapCenter}
          mapContainerStyle={DefaultStyle}
          zoom={15}
        >
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
                    scaledSize: new window.google.maps.Size(80, 80),
                    labelOrigin: new window.google.maps.Point(30, 70)
                  }
                  : undefined
              }
              onClick={() => setSelectedRiderId(item.riderId)}
            />
          ))}

         

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
      <div key={data.riderId} className="w-60">
        <button
          className="w-full bg-white border-amber-300 px-3 py-1 rounded-md border-2 text-amber-800 hover:border-amber-400 text-left"
          onClick={() =>
            setSelectedRiderId(selectedRiderId === data.riderId ? null : data.riderId)
          }
        >
          {data.name}
          <p className="text-sm">
            Speed: {speeds[data.riderId] ? `${speeds[data.riderId]} km/h` : 'Calculating...'}
          </p>
        </button>

        {selectedRiderId === data.riderId && (
          <div className="bg-white border border-amber-300 rounded-b-md p-3 text-xs mt-1 shadow-inner">
            <p><strong>Branch:</strong> {data.branchName}</p>
            <p><strong>Mobile:</strong> {data.mobileNo}</p>
            <p><strong>Vehicle No:</strong> {data.vehicleNumber}</p>
            <p><strong>Brand:</strong> {data.vehicleBrand}</p>
          </div>
        )}
      </div>
    ))}
  </div>
</div>

    </div>
  );
}

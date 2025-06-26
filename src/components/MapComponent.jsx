import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from "@react-google-maps/api";
import { useContext, useEffect, useState, useRef } from "react";
import Bike from "../assets/Bike.svg";
import Car from '../assets/car.png';
import { contextData } from '../ContextApi/Context';
const libraries = ["geometry"];

export default function MapComponent() {

  //province
  const provinces = [
    "Koshi Province",
    "Madhesh Province",
    "Bagamati Province",
    "Gandaki Province",
    "Lumbini Province",
    "Karnali Province",
    "Sudurpashchim Province"
  ];

  //Province
  const { selectedProvince, setSelectedProvince } = useContext(contextData)

  //Stores Location for static center the Map
  const defaultCenter = { lat: 27.7172, lng: 85.3240 };

  // Access Data from Api
  const { apidata } = useContext(contextData);

  //Stores Map center
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  //For search 
  const [searchTerm, setSearchTerm] = useState("");

  //Stores Selected Rider ID
  const [selectedRiderId, setSelectedRiderId] = useState(null);

  //Stores  Location data from Api
  const [LocationData, setLocationData] = useState({});

  //Stores Vehicle Speed
  const [speeds, setSpeeds] = useState({});


  // Ref to track if initial centering is done
  const initialCenterDone = useRef(false);


  const [mapRef, setMapRef] = useState(null);

  // Load Google Maps JS API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAmhPPLqzBFkyrkmaimjjKnFFLRd2SqzZI",
    libraries: libraries,
  });

  //Filtere Searched Users
  const filteredUsers = apidata.filter(user =>
    user.mobileNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get Selected Rider
  const selectedRider = apidata.find(rider => rider.riderId === selectedRiderId);

  useEffect(() => {
    if (!initialCenterDone.current && selectedRiderId === null && apidata.length > 0) {
      const first = apidata[0];
      setMapCenter({ lat: first.latitude, lng: first.longitude });
      initialCenterDone.current = true;

      if (mapRef) {
        mapRef.panTo({ lat: first.latitude, lng: first.longitude });
      }
    }
  }, [apidata, selectedRiderId, mapRef]);


  //Center Point With Most Vehicles
  function calculateCentroid(vehicles) {
    if (vehicles.length === 0) return defaultCenter;
    let latSum = 0;
    let lngSum = 0;
    vehicles.forEach(v => {
      latSum += parseFloat(v.latitude);
      lngSum += parseFloat(v.longitude);
    });
    return {
      lat: latSum / vehicles.length,
      lng: lngSum / vehicles.length,
    };
  }






  // Store locations and calculate speed
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
        if (len > 1 && window.google?.maps?.geometry) {
          const prev = new window.google.maps.LatLng(updated[id][len - 2]);
          const curr = new window.google.maps.LatLng(updated[id][len - 1]);

          const distance = window.google.maps.geometry.spherical.computeDistanceBetween(prev, curr);
          const speed = (distance / 1000) / (5 / 3600);
          newSpeeds[id] = speed.toFixed(2);
        }
      });

      setLocationData(updated);
      setSpeeds(newSpeeds);
    }
  }, [apidata]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className=" overflow-hidden border-2  border-gray-700 rounded-2xl">

      {/* Application Name */}
      <header className="bg-white text-black p-4 font-bold text-xl flex justify-between items-center">
        <div>Live Vehicle Tracking</div>
      </header>


      <div className="py-2 bg-white border-b-2 border-gray-700 flex items-center justify-center space-x-3">
        <label
          htmlFor="province-select"
          className="text-gray-700 font-semibold"
        >
          Select Province:
        </label>
        <select
          id="province-select"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>


      <div className="flex flex-grow">

        {/* Scrollable User List Sidebar */}
        <div className="w-[300px] bg-gray-100 p-4 overflow-y-auto border-r-2 border-gray-400 h-[80vh]">

          <h3 className=" text-2xl mb-2 font-bold text-amber-800">Live Vehicles</h3>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 rounded border border-gray-300 focus:outline-amber-400"
          />
          <p className="font-bold">Active Vehicles :  {filteredUsers.length}</p>
          <div className="flex flex-col gap-3">
            {filteredUsers.length === 0 ? (
              <div className="text-gray-500 text-sm">No vehicles found.</div>
            ) : (
              filteredUsers.map((data) => (
                <div key={data.riderId}>
                  <button
                    className={`w-full bg-white px-3 py-2 rounded-md border-2 text-left text-amber-800 hover:border-amber-400 ${selectedRiderId === data.riderId ? "border-amber-500" : "border-amber-300"
                      }`}
                    onClick={() => {
                      setSelectedRiderId(selectedRiderId === data.riderId ? null : data.riderId);
                      if (mapRef) {
                        mapRef.panTo({ lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) });
                      }
                    }}
                  >
                    <div className="font-bold">{data.name}</div>
                    <div className="text-sm">
                      Speed: {speeds[data.riderId] ? `${speeds[data.riderId]} km/h` : 'Calculating...'}
                    </div>
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
              ))
            )}
          </div>
        </div>

        {/* Google Map Container */}
        <div className="flex-grow">
          <GoogleMap
            center={mapCenter}
            mapContainerStyle={{ width: "100%", height: "80vh" }}
            zoom={15}
            onLoad={(map) => setMapRef(map)}
          >
            {/* Show Marker for Each Vehicle */}
            {apidata.map((item) => (
              <Marker
                key={item.riderId}
                position={{
                  lat: parseFloat(item.latitude),
                  lng: parseFloat(item.longitude),
                }}
                label={{
                  text: item.name,
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
                icon={{
                  url: item.categoryId === 1 ? Bike : Car,
                  scaledSize: new window.google.maps.Size(50, 50),
                  labelOrigin: new window.google.maps.Point(25, 45),
                }}
                onClick={() => setSelectedRiderId(item.riderId)}
              />
            ))}

            {/* Draw Polyline for Movement History */}
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

            {/* Info Window on Selected Marker */}
            {selectedRider && (
              <InfoWindow
                position={{
                  lat: parseFloat(selectedRider.latitude),
                  lng: parseFloat(selectedRider.longitude),
                }}
                onCloseClick={() => setSelectedRiderId(null)}
              >
                <div className="text-sm">
                  <strong>{selectedRider.name}</strong><br />
                  Speed: {speeds[selectedRiderId]} km/h<br />
                  Vehicle No: {selectedRider.vehicleNumber}<br />
                  Mobile: {selectedRider.mobileNo}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

      </div>
    </div>
  );
}

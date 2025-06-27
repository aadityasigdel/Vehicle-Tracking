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

  //Filtered Searched Users
  const filteredUsers = apidata.filter(user =>
    user.mobileNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset Filtered Searched Users
  const handleClear = () => {
    setSearchTerm("");
    setSelectedRiderId(null);

    if (apidata.length > 0 && mapRef) {
      const first = apidata[0];
      const lat = parseFloat(first.latitude);
      const lng = parseFloat(first.longitude);
      mapRef.panTo({ lat, lng });
      setMapCenter({ lat, lng });
    }
  };



  // Get Selected Rider
  const selectedRider = apidata.find(rider => rider.riderId === selectedRiderId);

  // Reset initial centering when province changes
  useEffect(() => {
    initialCenterDone.current = false;
  }, [selectedProvince]);

  // Initial center (fast, on first load)
  useEffect(() => {
    if (!initialCenterDone.current && selectedRiderId === null && apidata.length > 0 && mapRef) {
      const delay = selectedProvince ? 500 : 0;
      const timer = setTimeout(() => {
        const { latitude, longitude } = apidata[0];
        const lat = parseFloat(latitude), lng = parseFloat(longitude);
        mapRef.panTo({ lat, lng });
        setMapCenter({ lat, lng });
        initialCenterDone.current = true;
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [selectedProvince, apidata, selectedRiderId, mapRef]);



  //Follows Searched Users
  useEffect(() => {
    if (searchTerm.trim() !== "" && filteredUsers.length > 0 && mapRef) {
      const user = filteredUsers[0];
      const lat = parseFloat(user.latitude);
      const lng = parseFloat(user.longitude);
      mapRef.panTo({ lat, lng });
      setMapCenter({ lat, lng });
      setSelectedRiderId(user.riderId);

    } else {
    }
  }, [searchTerm, filteredUsers, mapRef]);

  useEffect(() => {
    if (selectedRiderId !== null && mapRef) {
      const rider = apidata.find(r => r.riderId === selectedRiderId);
      if (rider) {
        const lat = parseFloat(rider.latitude);
        const lng = parseFloat(rider.longitude);
        mapRef.panTo({ lat, lng });
        setMapCenter({ lat, lng });
      }
    }
  }, [selectedRiderId, mapRef, apidata]);


  // Store locations and calculate speed
  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.geometry || !apidata.length) return;

    const updated = {};
    const newSpeeds = {};

    apidata.forEach(rider => {
      const id = rider.riderId;
      const point = { lat: +rider.latitude, lng: +rider.longitude };
      updated[id] = LocationData[id] ? [...LocationData[id], point] : [point];
      if (updated[id].length > 40) updated[id].shift();

      if (updated[id].length > 1) {
        const prev = new window.google.maps.LatLng(updated[id].at(-2));
        const curr = new window.google.maps.LatLng(updated[id].at(-1));
        const dist = window.google.maps.geometry.spherical.computeDistanceBetween(prev, curr);
        newSpeeds[id] = ((dist / 1000) / (5 / 3600)).toFixed(2);
      }
    });

    setLocationData(updated);
    setSpeeds(newSpeeds);
  }, [apidata, isLoaded]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className=" overflow-hidden border-2  border-gray-700 rounded-2xl">

      {/* Application Name */}
      <header className="bg-white text-black p-4 font-bold text-xl flex justify-center items-center">
        <div>Live Vehicles</div>
      </header>




      <div className="py-2 bg-white border-b-2 border-gray-700 flex items-center justify-around space-x-3">
        <div>
          <label
            htmlFor="province-select"
            className="text-black font-semibold px-2 "
          >
            Select Province:
          </label>
          <select
            id="province-select"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg p-2 hover:shadow focus:ring-amber-400"

          >
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>


        {/* Search Input */}
        <div className="p-4 bg-white  border-gray-300 flex justify-center">
          <label className=" font-bold text-2xl px-2">
            Search
          </label>
          <input
            type="text"
            placeholder="🔍 phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            onClick={handleClear}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-2 px-4 rounded mx-2 shadow"
          >
            Clear
          </button>
        </div>
        <p className="font-bold">Active Vehicles :  {filteredUsers.length}</p>
      </div>



      {/* Google Map Container */}
      <div className="flex-grow">
        <GoogleMap
          center={mapCenter}
          mapContainerStyle={{ width: "100%", height: "70vh" }}
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
              icon={{
                url: item.categoryId === 1 ? Bike : Car,
                scaledSize: new window.google.maps.Size(50, 50),
                labelOrigin: new window.google.maps.Point(25, 45),
              }}
              onClick={() => setSelectedRiderId(item.riderId)}
            />
          ))}

          {/* Draw Polyline for Movement History */}
          {selectedRiderId && LocationData[selectedRiderId] && (
            <Polyline
              path={LocationData[selectedRiderId]}
              options={{
                strokeColor: "blue",
                strokeOpacity: 1.0,
                strokeWeight: 2,
              }}
            />
          )}



          {/* Info Window on Selected Marker */}
          {selectedRider && (
            <InfoWindow
              position={{
                lat: parseFloat(selectedRider.latitude),
                lng: parseFloat(selectedRider.longitude),
              }}
              onCloseClick={() => setSelectedRiderId(null)}
            >

              <div className="text-sm space-y-1">
                <p className="font-bold text-lg">{selectedRider.name}</p>
                <p>🚗 Vehicle No: <strong>{selectedRider.vehicleNumber}</strong></p>
                <p>📱 Mobile: {selectedRider.mobileNo}</p>
                <p>💨 Speed: {speeds[selectedRiderId]} km/h</p>
              </div>


            </InfoWindow>
          )}
        </GoogleMap>
      </div>


    </div>
  );
}

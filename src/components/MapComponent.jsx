import { GoogleMap, LoadScript } from "@react-google-maps/api";

export default function MapComponent() {
  const DefaultStyle = {
    width: "100%",
    height: "80vh"
  }

  const defaultCenter = {
    lat: 27.7172,
    lng: 85.3240
  }

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

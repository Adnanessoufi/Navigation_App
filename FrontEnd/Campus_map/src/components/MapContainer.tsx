import { GoogleMap, Marker, useLoadScript  } from "@react-google-maps/api";
import {useMemo  } from "react";
const DEFAULT_CENTER = { lat: 47.5316, lng: 21.6273 };

export default function MapContainer({lat,lng}: {lat?:number;lng?:number}) {
    
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const center = useMemo(() => {
    if (lat && lng) {
      return { lat, lng };
    }
    return DEFAULT_CENTER;
  }, [lat, lng]);
  
    const options = useMemo(() => ({
        disableDefaultUI: true,
        zoomControl: true,
    }), []); 
    
    


    if (!isLoaded) return <div>Loading...</div>;
    return (
        <div className="h-[calc(100vh-64px-32px)] w-full rounded-2xl shadow-sm overflow-hidden">
            <GoogleMap
                zoom={15}
                key={`${center.lat},${center.lng}`}
                center={center}
                mapContainerClassName="w-3/5 h-3/5 mx-auto rounded-2xl m-10"
                options={options}
            >
              {lat && lng && (
                <Marker position={center}
                        icon={"http://maps.google.com/mapfiles/ms/icons/red-dot.png"}
                        animation={google.maps.Animation.DROP}
                />
              )}  
            </GoogleMap>
        </div>
    );


}

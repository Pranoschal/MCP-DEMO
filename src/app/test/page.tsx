'use client'
import React from 'react';
import { 
  GoogleMap, 
  Marker, 
  Polyline, 
  useLoadScript 
} from '@react-google-maps/api';

// Typescript interface for location
interface Location {
  name?: string;
  latitude: number;
  longitude: number;
}

export default function MapRoutePage() {
  // Updated locations with precise coordinates from the image
  const locations: Location[] = [
    { name: 'A', latitude: -30.303, longitude: 153.139 }, // Coffs Harbour
    { name: 'B', latitude: -30.454, longitude: 153.037 }, // Near Bellinger
    { name: 'C', latitude: -30.587, longitude: 153.015 }, // Near Urunga
    { name: 'D', latitude: -30.710, longitude: 153.005 }, // Near Macksville
    { name: 'E', latitude: -30.745, longitude: 153.000 }, // Near Stuart Point
    { name: 'F', latitude: -30.850, longitude: 152.970 }  // Near Kempsey
  ];

  // Map configuration
  const mapContainerStyle = {
    width: '100%',
    height: '600px'
  };

  const center = {
    lat: -30.600,
    lng: 153.000
  };

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  // Error handling
  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Coastal Route Map</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={9}
          center={center}
        >
          {/* Markers for each location */}
          {locations.map((loc, index) => (
            <Marker
              key={index}
              position={{ 
                lat: loc.latitude, 
                lng: loc.longitude 
              }}
              label={{
                text: loc.name || '',
                color: 'white',
                fontWeight: 'bold'
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#FF0000',
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 2
              }}
            />
          ))}

          {/* Polyline to connect the route */}
          <Polyline
            path={locations.map(loc => ({ 
              lat: loc.latitude, 
              lng: loc.longitude 
            }))}
            options={{
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              strokeWeight: 5,
              geodesic: true  // This ensures the line follows the curvature of the Earth
            }}
          />
        </GoogleMap>
      </div>

      {/* Location List */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Route Locations</h2>
        <ul className="list-disc pl-5">
          {locations.map((loc, index) => (
            <li key={index}>
              {loc.name}: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
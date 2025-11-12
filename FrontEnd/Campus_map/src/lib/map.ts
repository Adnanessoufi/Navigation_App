export function googleMapsUrl(lat: number, lng: number, name?: string) {
  // Web URL that works on all devices and opens the app if available
  const q = name ? `${encodeURIComponent(name)}@${lat},${lng}` : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

// Optional: directions from current location
export function googleDirectionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
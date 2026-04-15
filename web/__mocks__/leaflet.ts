const leaflet = {
  map: jest.fn(() => ({
    setView: jest.fn().mockReturnThis(),
    addLayer: jest.fn(),
    on: jest.fn(),
    remove: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({ addTo: jest.fn() })),
  circleMarker: jest.fn(() => ({ addTo: jest.fn().mockReturnThis(), bindPopup: jest.fn().mockReturnThis() })),
  icon: jest.fn(() => ({})),
  Marker: { prototype: { options: { icon: null } } },
};

export default leaflet;
export const { map, tileLayer, circleMarker, icon, Marker } = leaflet;

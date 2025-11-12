
export type PlaceType =  "LIBRARY" | "PRAYER ROOM" | "FOOD COURT" | "EDUCATIONAL OFFICES";

export const FILTERS: { key: PlaceType; label: string }[] = [
    { key: "LIBRARY",  label: "Libraries" },
    { key: "PRAYER ROOM", label: "Prayer Rooms" },
    { key: "FOOD COURT", label: "Food Courts" },
    { key: "EDUCATIONAL OFFICES", label: "Educational Offices" },

];

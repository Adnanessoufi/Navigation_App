type Item = {
  name: string;
  abbr?: string;        // optional abbreviation
  type?: string;  
  lat : number;
  lng : number;
  // only set if it's a library
};

const items : Item[] = [
  {name: "Main Building",lat: 47.554081817547456, lng: 21.62146904182801,},
  {name: "Life science Building", type:"Library", abbr: "LSB", lat: 47.555902, lng: 21.621131,},
  {name: "Kenézy Life Sciences Library", type:"Library", abbr: "LSB", lat: 47.555902, lng: 21.621131,},
  {name: "Teokj Building", abbr: "Teokj", lat: 47.54470026620749, lng: 21.64101309265243, },
  {name: "Chemistry Building", abbr: "CHEM", lat: 47.55529970678091, lng: 21.62014026157559 },
  {name: "Learning center", type:"Library", abbr: "LC", lat: 47.555026095050465, lng: 21.618302320760666},
  {name: "Informatik kar", abbr: "IK", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "Veres Péter Kollégium", abbr: "Veres Peter", type:"Dormitory", lat:47.55067393296942, lng:21.608648537188003 },
  {name: "Sports Dormitory Kollegium DEAC", abbr:"Sport Dormitory",lat : 47.557285498617304,lng: 21.61634705720212 },
  // IK BUILDING
  {name: "Informatik kar", abbr: "IK", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room F0 (Ground Floor)", abbr: "IK-F0", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room F01 (Ground Floor)", abbr: "IK-F01", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room F02 (Ground Floor)", abbr: "IK-F02", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room F03 (Ground Floor)", abbr: "IK-F03", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room F05 (Ground Floor)", abbr: "IK-F05", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room F09 (Ground Floor)", abbr: "IK-F09", lat: 47.54235887184139, lng: 21.63992259672122},

  {name: "IK Building, room I330 (3rd Floor)", abbr: "IK-I330", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room Notebook (Ground Floor)", abbr: "IK-Notebook", lat: 47.54235887184139, lng: 21.63992259672122},

  {name: "IK Building, room 102 (1st Floor)", abbr: "IK-102", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 103 (1st Floor)", abbr: "IK-103", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 104 (1st Floor)", abbr: "IK-104", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 105 (1st Floor)", abbr: "IK-105", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 106 (1st Floor)", abbr: "IK-106", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 107 (1st Floor)", abbr: "IK-107", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 108 (1st Floor)", abbr: "IK-108", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 132 (1st Floor)", abbr: "IK-132", lat: 47.54235887184139, lng: 21.63992259672122},

  {name: "IK Building, room 201 (2nd Floor)", abbr: "IK-201", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 202 (2nd Floor)", abbr: "IK-202", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 203 (2nd Floor)", abbr: "IK-203", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 204 (2nd Floor)", abbr: "IK-204", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 205 (2nd Floor)", abbr: "IK-205", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 206 (2nd Floor)", abbr: "IK-206", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 207 (2nd Floor)", abbr: "IK-207", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 232 (2nd Floor)", abbr: "IK-232", lat: 47.54235887184139, lng: 21.63992259672122},

  {name: "IK Building, room 310 (3rd Floor)", abbr: "IK-310", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 311 (3rd Floor)", abbr: "IK-311", lat: 47.54235887184139, lng: 21.63992259672122},
  {name: "IK Building, room 321 (3rd Floor)", abbr: "IK-321", lat: 47.54235887184139, lng: 21.63992259672122},


  // TEOKJ BUILDING (already correctly formatted)
  {name: "TEOKJ Building, room 108 Ground Floor (IV.ea.)", abbr: "IK-TEOKJ fszt. 108. (IV.ea.)", lat: 47.54470026620749, lng: 21.64101309265243},
  {name: "TEOKJ Building, room 106 (2nd Floor)", abbr: "IK-TEOKJ II. em. 106", lat: 47.54470026620749, lng: 21.64101309265243},
  {name: "TEOKJ Building, room 107 (2nd Floor)", abbr: "IK-TEOKJ II. em. 107", lat: 47.54470026620749, lng: 21.64101309265243},
  {name: "TEOKJ Building, room 108 (2nd Floor)", abbr: "IK-TEOKJ II. em. 108", lat: 47.54470026620749, lng: 21.64101309265243},
  {name: "TEOKJ Building, room 109 (2nd Floor)", abbr: "IK-TEOKJ II. em. 109", lat: 47.54470026620749, lng: 21.64101309265243},
  {name: "TEOKJ Building, room 111 (2nd Floor)", abbr: "IK-TEOKJ II. em. 111", lat: 47.54470026620749, lng: 21.64101309265243},
  {name: "TEOKJ Building, room 112 (2nd Floor)", abbr: "IK-TEOKJ II. em. 112", lat: 47.54470026620749, lng: 21.64101309265243},

  
  
] as const;

export default items;
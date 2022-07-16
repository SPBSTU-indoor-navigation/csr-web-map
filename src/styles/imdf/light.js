// StyleConstructorOptions {
//   strokeColor: 'rgb(0, 122, 255)',
//   strokeOpacity: 1,
//   strokeStart: 0,
//   strokeEnd: 1,
//   lineWidth: 2,
//   lineCap: 'butt' | 'round' | 'square',
//   lineJoin: 'miter' | 'round' | 'bevel',
//   lineDash: [10, 5],
//   lineDashOffset: 1,
//   lineGradient: new mapkit.LineGradient({
//     0: "blue",
//     1: "red"
//   }),
//   fillColor: 'rgb(0, 122, 255)',
//   fillOpacity: 1,
//   fillRule: 0,
// }

export default {
  venue: {
    fillColor: '#F6F4EC'
  },
  'building.footprint': {
    fillColor: '#DDDDDD',
    strokeColor: '#A1A1A1',
    strokeOpacity: 1,
    lineWidth: 1
  },
  environment: {
    grass: {
      fillColor: '#C4ED9D',
    },
    'grass.stadion': {
      fillColor: '#C4ED9C',
    },
    forest: {
      fillColor: '#ABDB7B',
    },
    tree: {
      fillColor: '#B9E28A',
    },
    'road.main': {
      fillColor: '#8E9194',
    },
    'road.dirt': {
      fillColor: '#F1EDC8',
    },
    'road.pedestrian.main': {
      fillColor: '#FDFDFD',
    },
    'road.pedestrian.second': {
      fillColor: '#F6F6F1',
    },
    'road.pedestrian.treadmill': {
      fillColor: '#D6AAA3',
    },
    water: {
      fillColor: '#9BD5F1',
    },
    sand: {
      fillColor: '#F9F4DA',
    },

    crosswalk: {
      strokeColor: "#E9E9EA",
      strokeOpacity: 1,
      lineWidth: 2
    },
    'fence.main': {
      strokeColor: "#212121",
      strokeOpacity: 1,
      lineWidth: 1
    },
    'frnce.height': {
      strokeColor: "#797979",
      strokeOpacity: 1,
      lineWidth: 2
    },
    'stadion.grass.marking': {
      strokeColor: "#FFFFFF",
      strokeOpacity: 1,
      lineWidth: 0.5

    },
    'steps': {
      strokeColor: "#CBCBCB",
      strokeOpacity: 0.5,
      lineWidth: 1

    },
    'treadmill.marking': {
      strokeColor: '#FFFFFF',
      strokeOpacity: 1,
      lineWidth: 0.5
    },
    'road.marking.main': {
      strokeColor: '#FFFFFF',
      strokeOpacity: 1,
      lineWidth: 0.5
    },
    'parking.marking': {
      strokeColor: '#FFFFFF',
      strokeOpacity: 1,
      lineWidth: 0.5,
    },
    'parking.big': {
      strokeColor: '#FFFFFF',
      strokeOpacity: 1,
      lineWidth: 1
    },
    'fence.heigth': {
      strokeColor: '#797979',
      strokeOpacity: 1,
      lineWidth: 1
    }
  }
}
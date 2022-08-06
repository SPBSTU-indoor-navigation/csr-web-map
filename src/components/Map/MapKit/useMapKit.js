import * as T from './mapkit_5.72.108.js';

export default async function useMapKit(tokenUrl) {
  T
  mapkit.init({
    authorizationCallback: function (done) {
      fetch(tokenUrl)
        .then((res) => res.text())
        .then((token) => done(token))
        .catch((error) => { });
    },
  });
}

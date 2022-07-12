export default async function useMapKit(tokenUrl) {

  await new Promise((resolve) => {
    const element = document.createElement('script');
    element.addEventListener('load', () => {
      resolve();
    });
    element.src = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js';
    document.head.appendChild(element);
  });

  mapkit.init({
    authorizationCallback: function (done) {
      fetch(tokenUrl)
        .then((res) => res.text())
        .then((token) => done(token))
        .catch((error) => { });
    },
  });
}
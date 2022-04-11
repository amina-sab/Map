'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map,mapEvent;
if (navigator.geolocation)
  //pour recuper la position courante
  navigator.geolocation.getCurrentPosition(
    //premier calllback (succes)
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(`https://www.google.com/maps/@${latitude},@${longitude}`);

      const coords = [latitude, longitude];
      //j'ai utilise une librairie leaflet, j'ai copié le script heberge en ligne par quelqu'un dans le .html
      //dans la libraire open source leaflet il ya ce bloc de script pour ajouter un marquer et du texte sur la position courante
       map = L.map('map').setView(coords, 13);
      //console.log(map);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
    //   L.marker(coords)
    //     .addTo(map)
    //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //     .openPopup();

      //gerer les clicks sur la map

      map.on('click', function(mapE){
          mapEvent=mapE;
      form.classList.remove('hidden');
      inputDistance.focus();



//afficher le marquer
       // console.log(mapEvent);
// const {lat, lng}=mapEvent.latlng;
// L.marker([lat,lng])
//         .addTo(map)
//         .bindPopup(L.popup({
//             maxWidth:250,
//             minWidth:100,
//             autoClose:false,//pour ne pas fermer le popup
//             closeOnClick:false,
//             className:'running-popup',
            
//         }
//         ))
//         .setPopupContent('Workout')
//         .openPopup();
      }
      );


    }, //dexieme callback echec (erreur)
    function () {
      alert('could not get tour position');
    }
  );
form.addEventListener('submit',function(e){

e.preventDefault();
 
//supprimer lees entrees remplies
inputDistance.value=inputDuration.value=inputCadence.value=inputElevation.value='';

//afficher le marquer
const {lat, lng}=mapEvent.latlng;
L.marker([lat,lng])
        .addTo(map)
        .bindPopup(L.popup({
            maxWidth:250,
            minWidth:100,
            autoClose:false,//pour ne pas fermer le popup
            closeOnClick:false,
            className:'running-popup',
            
        }
        ))
        .setPopupContent('Workout')
        .openPopup();
});
inputType.addEventListener('change',function(){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');

});

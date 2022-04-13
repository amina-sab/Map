'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks=0;
  constructor(coords, distance, duration) {
    //this.date=...
    //this.id=...
    this.coords = coords; //[lat,lng]
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(
      1)} on ${months[this.date.getMonth()]} ${this.date.getDate()} `;
  }
  click(){
    this.clicks++;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    //this.type='cycling'
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    //km/h
    this.speed = this.distance / this.duration / 60;
    return this.speed;
  }
}

// const run1=new Running([39,-12],5.2,24,178);
// const cycle1=new Cycling([39,-12],27,95,523);
// console.log(run1,cycle1);

///////////////////////////////////////////
//APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {


  #map;
  #mapZoomLevel=13;
  #mapEvent;
  #workouts = [];

  constructor() {
    //recuperer la position de l'utilisateur
    this._getPostion();
//recuperer les donnnes du stockage local 
this._getLocalStorage();
//lier les gestionnaires d evenement
    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  
    containerWorkouts.addEventListener('click',this._moveToPopup.bind(this));

  }

  _getPostion() {
    if (navigator.geolocation)
      //pour recuper la position courante
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get tour position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.com/maps/@${latitude},@${longitude}`);

    const coords = [latitude, longitude];
    //j'ai utilise une librairie leaflet, j'ai copié le script heberge en ligne par quelqu'un dans le .html
    //dans la libraire open source leaflet il ya ce bloc de script pour ajouter un marquer et du texte sur la position courante
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    //console.log(map);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work=>
    this._renderWorkoutMarker(work));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm(){
    //entrees vides
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
      form.style.display='none';
      form.classList.add('hidden');
      setTimeout(()=>(form.style.display='grid'),1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    //get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //if activity runing , create runing object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //check if data is valid
      if (
        //!Number.isFinite(distance)||
        // !Number.isFinite(duration)||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //if activity rcycling , create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    //add new object to workout array
    this.#workouts.push(workout);
    //render workout on map as marker
    this._renderWorkoutMarker(workout);
    //render workout on list
    this._renderWorkout(workout);
    //cacher le form et supprimer lees entrees remplies

    this._hideForm();

    // set local storage to all workouts
    this._setLocalStorage();
  
  }
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false, //pour ne pas fermer le popup
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${
        workout.type === 'running' ?'🏃‍♂️' : '🚴‍♀️' }${workout.description}`)
      .openPopup();
  }
  _renderWorkout(workout) {
    let html = `
   <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;
    if (workout.type == 'running')
      html += ` <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;

    if (workout.type == 'cycling')
      html += `<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.speed.toFixed(1)}</span>
    <span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⛰</span>
    <span class="workout__value">${workout.elevationGain}</span>
    <span class="workout__unit">m</span>
  </div>
</li>`;
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e){
   const workoutEl=e.target.closest('.workout');
  //  console.log(workoutEl);
 
   if(!workoutEl)return ;

   const workout=this.#workouts.find(work=>work.id===workoutEl.dataset.id);
  //  console.log(workoutEl);

   this.#map.setView(workout.coords,this.#mapZoomLevel,{
     animate:true,
     pan:{
       duration:1,
     }
   });
   //using the public interface

  //  workout.click();
  }

  _setLocalStorage(){
    
    localStorage.setItem('workouts',JSON.stringify(this.#workouts));

  }
  _getLocalStorage(){

    const data =JSON.parse( localStorage.getItem('workouts'));
    // console.log(data);
  
   if(!data)return;
   this.#workouts=data;
   this.#workouts.forEach(work=>
    {this._renderWorkout(work);
    });
    
  }
  reset(){
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();

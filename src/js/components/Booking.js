import { select, settings, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';

class Booking {
  constructor(element) {
    // console.log('element', element);
    this.render(element);
    this.initWidgets();
    this.getData();
    this.tableSelect();

  }

  render(element) {
    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();
    /* create element using utils.createElementFromHTML */
    this.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const bookingContainer = document.querySelector(select.containerOf.booking);
    /* add element to menu */
    bookingContainer.appendChild(this.element);

    this.dom = {};
    this.dom.wrapper = element;
    this.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    this.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    this.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    this.dom.tables = element.querySelectorAll(select.booking.tables);
    this.dom.sendButton = element.querySelector(select.booking.formSubmit);
    this.dom.phoneElem = element.querySelector(select.booking.phone);
    this.dom.addressElem = element.querySelector(select.booking.address);
    this.dom.starters = element.querySelector(select.booking.starter);

    this.starters = [];
  }


  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerElem.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerElem.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        // startDateParam,
        endDateParam,
      ],

    };
    // console.log('params', params);

    const urls = {
      booking: settings.db.url +'/' +settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    // console.log(urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),

    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),

        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat ]){
        // console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerElem.minDate;
    const maxDate = thisBooking.datePickerElem.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      //console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePickerElem.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerElem.value);

    let allAvailable = false;

    const tables = thisBooking.element.querySelectorAll(select.booking.tables);
    for(let table of tables ){
      table.classList.remove(classNames.booking.tableClicked);
    }

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) >= 1
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  initWidgets() {
    this.peopleAmountElem = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmountElem = new AmountWidget(this.dom.hoursAmount);
    this.datePickerElem = new DatePicker(this.dom.datePicker);
    this.hourPickerElem = new HourPicker(this.dom.hourPicker);

    this.dom.wrapper.addEventListener('updated', () => {
      this.updateDOM();
    });

    this.dom.sendButton.addEventListener('submit', function(event){
      event.preventDefault();
      this.sendBooking();
    });

    this.element.addEventListener('click', function(event){
      const starter = event.target;

      if(starter.getAttribute('type') === 'checkbox' && starter.getAttribute('name') === 'starter'){
        if(starter.checked){
          this.starters.push(starter.value);
          console.log(this.starters);
        } else if (!starter.checked){
          const starterId = this.starters.indexOf(starter.value);
          this.starters.splice(starterId, 1);
          console.log(this.starters);

        }

      }

    });

  }

  tableSelect(){
    const thisBooking = this;

    thisBooking.element.addEventListener('click', function(event){
      //event.preventDefault();

      const clickedElement = event.target;
      const table = clickedElement.getAttribute(settings.booking.tableIdAttribute);
      console.log(table);
      let tableId = '';
      //console.log(table);
      thisBooking.tableId = tableId;
      if(table != null){

        if(!clickedElement.classList.contains(classNames.booking.tableBooked)){
          console.log('table available');
          const tables = thisBooking.element.querySelectorAll(select.booking.tables);
          console.log(tables);

          //console.log(tableId);
          if(!clickedElement.classList.contains(classNames.booking.tableClicked)){
            for(let table of tables ){
              table.classList.remove(classNames.booking.tableClicked);
              tableId = '';
            }
            clickedElement.classList.add(classNames.booking.tableClicked);
            const clickedElementId = clickedElement.getAttribute('data-table');
            tableId = clickedElementId;
            thisBooking.tableId = parseInt(tableId);
          } else if (clickedElement.classList.contains(classNames.booking.tableClicked)){
            clickedElement.classList.remove(classNames.booking.tableClicked);
          }

        } else {
          alert('Stolik niedostępny');
        }
      }
    });


  }
  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.datePickerElem.value,
      hour: thisBooking.hourPickerElem.value,
      table: thisBooking.tableId,
      duration: parseInt(this.hoursAmountElem.value),
      ppl: parseInt(this.peopleAmountElem.value),
      phone: thisBooking.dom.phoneElem.value,
      address: thisBooking.dom.addressElem.value,
      starters: thisBooking.starters
    };

    thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);

    console.log(payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);

    thisBooking.updateDOM();


  }
}
export default Booking;

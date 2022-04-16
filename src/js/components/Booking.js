import { select, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';

class Booking {
  constructor(element) {
    // console.log('element', element);
    this.render(element);
    this.initWidgets();
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
    this.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper)
  }

  initWidgets() {

    this.peopleAmountElem = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmountElem = new AmountWidget(this.dom.hoursAmount);
    this.datePickerElem = new DatePicker(this.dom.datePicker);
    this.hourPicker = new HourPicker(this.dom.hourPicker);
  }
}
export default Booking;
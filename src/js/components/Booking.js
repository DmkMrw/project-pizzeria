import { select, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
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
  }

  initWidgets() {

    this.peopleAmountElem = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmountElem = new AmountWidget(this.dom.hoursAmount);
  }
}
export default Booking;
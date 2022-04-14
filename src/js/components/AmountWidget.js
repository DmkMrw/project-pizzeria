import { settings, select } from '../settings.js';


class AmountWidget {
  constructor(element) {
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();

    // console.log('AmountWidget', thisWidget);
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.linkIncrease = thisWidget.element.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    thisWidget.value = newValue;
    thisWidget.input.value = thisWidget.value;

    /* TODO: Add validation */
    if (thisWidget.value !== newValue && !isNaN(newValue)) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }

    if (thisWidget.input.value >= settings.amountWidget.defaultMax) {
      thisWidget.value = settings.amountWidget.defaultMax;
      thisWidget.input.value = settings.amountWidget.defaultMax;
      thisWidget.announce();
    }

    if (thisWidget.input.value < settings.amountWidget.defaultMin) {
      thisWidget.value = 0;
      thisWidget.input.value = 0;
      thisWidget.announce();
    }

    // console.log(thisWidget.value);
    // console.log(thisWidget.input.value);
    // console.log(newValue);////////////
  }

  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.value);
      thisWidget.announce();
    });

    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      // if (thisWidget.value >= settings.amountWidget.defaultMin) {
      thisWidget.setValue((thisWidget.value -= 1));
      thisWidget.announce();
      // }
    });

    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      // if (thisWidget.value <= settings.amountWidget.defaultMax) {
      thisWidget.setValue((thisWidget.value += 1));
      thisWidget.announce();
      // }
    });
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
// 1. Constants and DOM Elements
const BAGGAGE_FORM_ID = 'baggageForm';
const FLIGHT_INPUT_ID = 'flight';
const TOTAL_INPUT_ID = 'total';

const baggageForm = document.getElementById(BAGGAGE_FORM_ID);
const flightInput = document.getElementById(FLIGHT_INPUT_ID);
const totalInput = document.getElementById(TOTAL_INPUT_ID);
const outputMessage = document.getElementById('outputMessage');
const copyStatus = document.getElementById('copyStatus');
const resetBtn = document.getElementById('resetBtn');
const sendBtn = document.getElementById('sendBtn');
const flightDestinationEl = document.getElementById('destino');
const flightLogoEl = document.querySelector('.flight-logo');

const categoryInputs = Array.from(document.querySelectorAll('.form-group input')).filter(
  (input) => ![FLIGHT_INPUT_ID, TOTAL_INPUT_ID].includes(input.id)
);

const allInputs = [flightInput, ...categoryInputs];

// 2. Data and Configuration
const FLIGHT_DESTINATIONS = {
  // LATAM
  "2004": "LIM", "2006": "LIM", "2010": "LIM", "2328": "AQP", "2188": "LIM",
  "2366": "SCL", "2018": "LIM", "2129": "LIM", "2008": "LIM", "2142": "LIM",
  "2320": "PEM", "2029": "LIM", "2025": "LIM", "2016": "LIM", "2151": "LIM",
  "2133": "PEM", "2046": "LIM", "2022": "LIM", "2042": "LIM", "2121": "LIM",
  "2277": "LIM", "2325": "AQP", "2026": "LIM", "2031": "LIM", "2106": "LIM",
  "2034": "LIM", "2218": "LIM", "2044": "LIM", "2040": "LIM", "2363": "LIM",
  "2064": "LIM", "2224": "LIM", "2201": "LIM", "2226": "LIM",
  // AVIANCA
  "80": "BOG", "104": "BOG", "105": "LPB"
};

const AIRLINE_CONFIG = {
  '2': { name: 'LA', logo: 'assets/icons/latam.webp' },
  '5': { name: 'Sky', logo: 'assets/icons/sky.webp' },
  '7': { name: 'JetSmart', logo: 'assets/icons/jetsmart.webp' },
  'AV': { name: 'AV', logo: 'assets/icons/avianca.webp' }
};

const AVIANCA_FLIGHTS = ["80", "104", "105"];

const STORAGE_KEY = 'baggageFormData';
const STORAGE_EXP_KEY = 'baggageFormDataExpiration';
const STORAGE_EXPIRATION_MS = 24 * 60 * 60 * 1000;

let currentAirlineName = '';

// 3. Utility Functions
const getNumericValue = (input) => {
  const value = input.value.trim();
  return value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);
};

const getAirlineInfo = (flightNumber) => {
  if (AVIANCA_FLIGHTS.includes(flightNumber)) {
    return AIRLINE_CONFIG['AV'];
  }
  if (/^\d{4}$/.test(flightNumber)) {
    const firstDigit = flightNumber.charAt(0);
    return AIRLINE_CONFIG[firstDigit] || null;
  }
  return null;
};

const getDestinationInfo = (flightNumber) => {
    const destCode = FLIGHT_DESTINATIONS[flightNumber];
    if (!destCode) return '';

    let flag = '';
    if (destCode === 'BOG') flag = ' 🇨🇴';
    else if (destCode === 'LPB') flag = ' 🇧🇴';

    return ` ${destCode}${flag}`;
};

// 4. UI Update Functions
const updateFlightDetails = () => {
  const flightNumber = flightInput.value.trim();
  const airlineInfo = getAirlineInfo(flightNumber);

  flightDestinationEl.textContent = FLIGHT_DESTINATIONS[flightNumber] || '';

  if (airlineInfo) {
    flightLogoEl.src = airlineInfo.logo;
    flightLogoEl.style.display = 'block';
    currentAirlineName = airlineInfo.name;
  } else {
    flightLogoEl.style.display = 'none';
    currentAirlineName = '';
  }
  updateSummaryMessage();
};

const updateSummaryMessage = () => {
  const flightNumber = flightInput.value.trim();
  if (!flightNumber) {
    totalInput.value = '';
    outputMessage.value = '';
    return;
  }

  const categories = categoryInputs
    .map(input => ({
      name: input.id === 'standby' ? 'stand by' : input.id,
      count: getNumericValue(input)
    }))
    .filter(cat => cat.count > 0);

  const totalBags = categories.reduce((sum, cat) => sum + cat.count, 0);
  totalInput.value = totalBags > 0 ? totalBags : '';

  // Per original functionality, destination in message is only for Avianca
  const isAviancaFlight = AVIANCA_FLIGHTS.includes(flightNumber);
  const destinationInfo = isAviancaFlight ? getDestinationInfo(flightNumber) : '';
  const flightHeader = `Vuelo ${currentAirlineName || ''} ${flightNumber}${destinationInfo}`;

  if (totalBags === 0) {
      outputMessage.value = flightHeader.trim();
      return;
  }

  const padWidth = Math.max(...categories.map(c => String(c.count).length), 2);
  const categoriesText = categories
    .map(c => `${String(c.count).padStart(padWidth, '0')} ${c.name}`)
    .join('\n');

  const totalFooter = `total: ${totalBags} bags`;

  outputMessage.value = `${flightHeader}\n${categoriesText}\n${totalFooter}`.trim();
};

const updateButtonStates = () => {
  const isFlightFilled = flightInput.value.trim() !== '';
  const areAnyCategoriesFilled = categoryInputs.some(input => input.value.trim() !== '');
  const isEnabled = isFlightFilled || areAnyCategoriesFilled;

  sendBtn.disabled = !isEnabled;
  resetBtn.disabled = !isEnabled;
};

const updateInputStyles = () => {
  const isFlightFilled = flightInput.value.trim() !== '';
  const activeElement = document.activeElement;

  categoryInputs.forEach(input => {
    const label = input.parentElement.querySelector('label');
    const isInFocus = activeElement === input;
    const isEmpty = !input.value;
    // Style as 'inactive' if flight is filled, input is empty, and not in focus.
    const shouldBeInactive = isFlightFilled && isEmpty && !isInFocus;

    input.classList.toggle('inactive', shouldBeInactive);
    label.classList.toggle('inactive', shouldBeInactive);
  });
};

// 5. Local Storage Functions
const saveFormDataToStorage = () => {
  const data = allInputs.reduce((acc, input) => {
    acc[input.id] = input.value;
    return acc;
  }, {});
  data.total = totalInput.value;
  data.output = outputMessage.value;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem(STORAGE_EXP_KEY, Date.now().toString());
};

const loadFormDataFromStorage = () => {
  const expiration = parseInt(localStorage.getItem(STORAGE_EXP_KEY), 10);
  if (!expiration || (Date.now() - expiration) > STORAGE_EXPIRATION_MS) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_EXP_KEY);
    return;
  }

  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (Object.keys(data).length === 0) return;

  allInputs.forEach(input => {
    if (data[input.id]) input.value = data[input.id];
  });
  if (data.total) totalInput.value = data.total;
  if (data.output) outputMessage.value = data.output;

  updateFlightDetails();
  updateButtonStates();
  updateInputStyles();
};

// 6. Event Handlers
const handleFormReset = () => {
  baggageForm.reset();
  outputMessage.value = '';
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_EXP_KEY);
  updateFlightDetails();
  updateButtonStates();
  updateInputStyles();
};

const handleSend = () => {
  const message = outputMessage.value.trim();
  if (message) {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  }
};

const handleCopyToClipboard = () => {
  const message = outputMessage.value.trim();
  if (!message) return;

  navigator.clipboard.writeText(message).then(() => {
    copyStatus.innerHTML = 'Texto<br>copiado ✔';
    copyStatus.classList.add('show');
    setTimeout(() => copyStatus.classList.remove('show'), 1500);
  });
};

const handleButtonPressEffect = (event) => {
    const btn = event.currentTarget;
    const pressEvents = ['touchstart', 'mousedown'];
    if (pressEvents.includes(event.type)) {
        btn.classList.add('pressed');
    } else {
        btn.classList.remove('pressed');
    }
};

const handleInputInteraction = (event) => {
    const input = event.target;
    const label = input.parentElement.querySelector('label');

    if (event.type === 'focus') {
        label.classList.add('active');
    } else if (event.type === 'blur') {
        label.classList.remove('active');
    }
    updateInputStyles();
};

// 7. Event Listeners Setup
const setupEventListeners = () => {
  window.addEventListener('DOMContentLoaded', loadFormDataFromStorage);

  flightInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
    updateFlightDetails();
    updateButtonStates();
    updateInputStyles();
    saveFormDataToStorage();
  });

  categoryInputs.forEach(input => {
    input.addEventListener('input', () => {
      updateSummaryMessage();
      updateButtonStates();
      updateInputStyles();
      saveFormDataToStorage();
    });
    input.addEventListener('focus', handleInputInteraction);
    input.addEventListener('blur', handleInputInteraction);
  });

  resetBtn.addEventListener('click', handleFormReset);
  sendBtn.addEventListener('click', handleSend);
  outputMessage.addEventListener('click', handleCopyToClipboard);

  [sendBtn, resetBtn].forEach(btn => {
      ['touchstart', 'mousedown', 'touchend', 'touchcancel', 'mouseup', 'mouseleave'].forEach(evt => {
          btn.addEventListener(evt, handleButtonPressEffect);
      });
  });
};

// 8. Initialization
setupEventListeners();
updateButtonStates();
updateInputStyles();
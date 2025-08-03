// Selección de elementos
const form = document.getElementById('baggageForm');
const flightInput = document.getElementById('flight');
const categoryInputs = Array.from(document.querySelectorAll('.form-group input')).filter(input => !['flight', 'total'].includes(input.id));
const normalesInput = document.getElementById('normales');
const conexionesInput = document.getElementById('conexiones');
const prioritariosInput = document.getElementById('prioritarios');
const standbyInput = document.getElementById('standby');
const vipInput = document.getElementById('vip');
const totalInput = document.getElementById('total');
const outputMessage = document.getElementById('outputMessage');
const copyStatus = document.getElementById('copyStatus');
const resetBtn = document.getElementById('resetBtn');
const sendBtn = document.getElementById('sendBtn');

function addPressed(btn) {
  btn.classList.add('pressed');
}
function removePressed(btn) {
  btn.classList.remove('pressed');
}
['touchstart', 'mousedown'].forEach(evt => {
  sendBtn.addEventListener(evt, () => addPressed(sendBtn));
  resetBtn.addEventListener(evt, () => addPressed(resetBtn));
});
['touchend', 'touchcancel', 'mouseup', 'mouseleave'].forEach(evt => {
  sendBtn.addEventListener(evt, () => removePressed(sendBtn));
  resetBtn.addEventListener(evt, () => removePressed(resetBtn));
});

// Validación: solo números positivos o vacío
function getValidNumber(input) {
  const val = input.value.trim();
  return val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0);
}

// Actualiza el total y el mensaje generado en tiempo real
function updateMessage() {
  const vuelo = flightInput.value.trim();
  const normales = getValidNumber(normalesInput);
  const conexiones = getValidNumber(conexionesInput);
  const prioritarios = getValidNumber(prioritariosInput);
  const standby = getValidNumber(standbyInput);
  const vip = getValidNumber(vipInput);

  // Si el código de vuelo está vacío, no mostrar total ni mensaje
  if (!vuelo) {
    totalInput.value = '';
    outputMessage.value = '';
    return;
  }

  const total = normales + conexiones + prioritarios + standby + vip;
  totalInput.value = (normales || conexiones || prioritarios || standby || vip) ? total : '';

  let msg = '';
  msg += `Vuelo LA ${vuelo}\n`;
  if (normales > 0) msg += `normales: ${normales}\n`;
  if (conexiones > 0) msg += `conexiones: ${conexiones}\n`;
  if (prioritarios > 0) msg += `prioritarios: ${prioritarios}\n`;
  if (standby > 0) msg += `stand by: ${standby}\n`;
  if (vip > 0) msg += `vip: ${vip}\n`;
  if (normales || conexiones || prioritarios || standby || vip) {
    msg += `total: ${total} bags`;
  }
  outputMessage.value = msg.trim();
}

// Eventos para inputs
[flightInput, normalesInput, conexionesInput, prioritariosInput, standbyInput, vipInput].forEach(input => {
  input.addEventListener('input', updateMessage);
});

// Copiado al tocar el textarea
outputMessage.addEventListener('click', () => {
  if (!outputMessage.value || outputMessage.value.trim() === '') return;
  navigator.clipboard.writeText(outputMessage.value).then(() => {
    copyStatus.innerHTML = 'Mensaje<br> copiado ✔';
    copyStatus.classList.add('show');
    setTimeout(() => copyStatus.classList.remove('show'), 1500);
  });
});

// Reiniciar formulario y mensaje
resetBtn.addEventListener('click', function () {
  document.getElementById('baggageForm').reset();
  outputMessage.value = '';
  flightDestino.textContent = '';
  updateButtonState(); // Vuelve a deshabilitar los botones
  updateInactiveEffects(); // Vuelve a aplicar opacidad y efectos visuales
});

// Enviar mensaje por WhatsApp (mensaje generado dinámicamente)
sendBtn.addEventListener('click', () => {
  const mensaje = outputMessage.value.trim();
  if (mensaje) {
    const encoded = encodeURIComponent(mensaje);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  }
});

// Inicializa mensaje y total
updateMessage();

// --- Vuelos destino abreviado ---
const vuelos = {
  "2004": "LIM",
  "2006": "LIM",
  "2010": "LIM",
  "2328": "AQP",
  "2188": "LIM",
  "2366": "SCL",
  "2018": "LIM",
  "2129": "LIM",
  "2008": "LIM",
  "2142": "LIM",
  "2320": "PEM",
  "2029": "LIM",
  "2025": "LIM",
  "2016": "LIM",
  "2151": "LIM",
  "2133": "PEM",
  "2046": "LIM",
  "2022": "LIM",
  "2042": "LIM",
  "2121": "LIM",
  "2277": "LIM",
  "2325": "AQP",
  "2026": "LIM",
  "2031": "LIM",
  "2106": "LIM",
  "2034": "LIM",
  "2218": "LIM",
  "2044": "LIM",
  "2040": "LIM",
  "2363": "LIM",
  "2064": "LIM",
  "2224": "LIM",
  "2201": "LIM",
  "2226": "LIM"
};
const flightDestino = document.getElementById('destino');
flightInput.addEventListener('input', function (e) {
  // Solo permitir números
  this.value = this.value.replace(/\D/g, '');
  // Mostrar destino solo si hay match exacto
  flightDestino.textContent = vuelos[this.value] || '';
});

function updateInactiveEffects() {
  const flightFilled = flightInput.value.trim() !== '';
  const anyCategoryFocused = categoryInputs.some(input => document.activeElement === input);
  if (flightFilled && anyCategoryFocused) {
    categoryInputs.forEach(input => {
      const label = input.parentElement.querySelector('label');
      if (!input.value && document.activeElement !== input) {
        input.classList.add('inactive');
        label.classList.add('inactive');
      } else {
        input.classList.remove('inactive');
        label.classList.remove('inactive');
      }
    });
  } else {
    categoryInputs.forEach(input => {
      input.classList.remove('inactive');
      input.parentElement.querySelector('label').classList.remove('inactive');
    });
  }
}

flightInput.addEventListener('input', updateInactiveEffects);
categoryInputs.forEach(input => {
  input.addEventListener('focus', updateInactiveEffects);
  input.addEventListener('blur', updateInactiveEffects);
  input.addEventListener('input', updateInactiveEffects);
});

document.querySelectorAll('.form-group input').forEach(input => {
  const label = input.parentElement.querySelector('label');
  if (input.id === 'flight' || input.id === 'total') return;
  input.addEventListener('focus', function () {
    label.classList.add('active');
    input.classList.remove('inactive');
    label.classList.remove('inactive');
  });
  input.addEventListener('blur', function () {
    label.classList.remove('active');
    if (!input.value) {
      input.classList.add('inactive');
      label.classList.add('inactive');
    }
  });
  input.addEventListener('input', function () {
    if (input.value) {
      input.classList.remove('inactive');
      label.classList.remove('inactive');
    } else if (document.activeElement !== input) {
      input.classList.add('inactive');
      label.classList.add('inactive');
    }
  });
});

function updateButtonState() {
  const flightFilled = flightInput.value.trim() !== '';
  const anyCategoryFilled = categoryInputs.some(input => input.value.trim() !== '');
  const enable = flightFilled || anyCategoryFilled;
  sendBtn.disabled = !enable;
  resetBtn.disabled = !enable;
}
flightInput.addEventListener('input', updateButtonState);
categoryInputs.forEach(input => {
  input.addEventListener('input', updateButtonState);
});
updateButtonState();

// --- Persistencia con localStorage (expira en 24h) ---
const STORAGE_KEY = 'conciliaFormData';
const STORAGE_EXP_KEY = 'conciliaFormDataExp';

function saveFormData() {
  const data = {
    flight: flightInput.value,
    normales: normalesInput.value,
    conexiones: conexionesInput.value,
    prioritarios: prioritariosInput.value,
    standby: standbyInput.value,
    vip: vipInput.value,
    total: totalInput.value,
    output: outputMessage.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem(STORAGE_EXP_KEY, Date.now().toString());
}

function loadFormData() {
  const exp = parseInt(localStorage.getItem(STORAGE_EXP_KEY), 10);
  if (!exp || (Date.now() - exp) > 24 * 60 * 60 * 1000) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_EXP_KEY);
    return;
  }
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (data.flight) flightInput.value = data.flight;
  if (data.normales) normalesInput.value = data.normales;
  if (data.conexiones) conexionesInput.value = data.conexiones;
  if (data.prioritarios) prioritariosInput.value = data.prioritarios;
  if (data.standby) standbyInput.value = data.standby;
  if (data.vip) vipInput.value = data.vip;
  if (data.total) totalInput.value = data.total;
  if (data.output) outputMessage.value = data.output;
  // Actualizar destino visual
  flightDestino.textContent = vuelos[flightInput.value] || '';
  updateButtonState(); // <-- Actualiza el estado de los botones tras restaurar
}

// Guardar datos al cambiar cualquier input relevante
[flightInput, normalesInput, conexionesInput, prioritariosInput, standbyInput, vipInput].forEach(input => {
  input.addEventListener('input', saveFormData);
});
// Guardar también al generar mensaje
outputMessage.addEventListener('input', saveFormData);

// Limpiar storage al reiniciar
resetBtn.addEventListener('click', function () {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_EXP_KEY);
});

// Cargar datos al iniciar
window.addEventListener('DOMContentLoaded', loadFormData);

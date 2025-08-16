// Registro simple del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration.scope);
        
        // Detectar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible - actualizar automáticamente
              console.log('🔄 Nueva versión instalada, recargando...');
              window.location.reload();
            }
          });
        });
      })
      .catch(error => {
        console.error('❌ Error registrando Service Worker:', error);
      });
  });
} else {
  console.log('⚠️ Service Worker no soportado');
}
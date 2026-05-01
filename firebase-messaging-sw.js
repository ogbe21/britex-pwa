// Importar los scripts necesarios de Firebase (versión 9.6.10)
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

// Configuración del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyD6B3E2uI1H0cEfp-a8niVcNmPD7ncMDPw",
  authDomain: "notificaciones-britex.firebaseapp.com",
  projectId: "notificaciones-britex",
  storageBucket: "notificaciones-britex.firebasestorage.app",
  messagingSenderId: "144577395628",
  appId: "1:144577395628:web:6aac2ed96e5f4417b41809"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Recuperar instancia de messaging
const messaging = firebase.messaging();

// Manejador para cuando la web está en segundo plano o cerrada
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/favicon.ico', // Asegúrate de tener un icono en tu raíz o cambia la ruta
    data: { url: payload.notification.click_action || '/' } // Opcional: link al hacer clic
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

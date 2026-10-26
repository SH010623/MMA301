
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyD726409dZY00pbdIdyHEaRBL_U2q0hKCU",
  authDomain: "b6-he195074.firebaseapp.com",
  projectId: "b6-he195074",
  storageBucket: "b6-he195074.firebasestorage.app",
  messagingSenderId: "1092557700920",
  appId: "1:1092557700920:web:f6188454508ecb0d1f4bcd",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "MMA301 Firebase";
  const options = {
    body: payload.notification?.body || "Bạn có thông báo mới.",
    icon: "/vite.svg",
  };

  self.registration.showNotification(title, options);
});

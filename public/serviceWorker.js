// serviceWorker.js
self.addEventListener('push', event => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: 'https://img.icons8.com/?size=100&id=eMfeVHKyTnkc&format=png&color=000000', // Set a suitable icon
    });
  });
  
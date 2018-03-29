const subscribeBtn = document.getElementById('subscribe');
const formContainer = document.getElementById('form-container');
const form = document.getElementById('form');

firebase.initializeApp({
  messagingSenderId: '29128917026'
});

if ('Notification' in window) {
  var messaging = firebase.messaging();

  messaging.getToken()
    .then(currentToken => {
      if (currentToken) {
        // show form and hide "enable notification" button
        subscribeBtn.classList.remove('visible');
        formContainer.classList.add('visible');
      } else {
        console.warn('Cannot get token');
        // hide form and show "enable notification" button
        subscribeBtn.classList.add('visible');
        formContainer.classList.remove('visible');
      }
    })
    .catch(err => console.warn('An error has occurred while getting token:', err));

  // if user has already allowed to get notifications subscribe to it
  if (Notification.permission === 'granted') {
    subscribe();
  }

  // Subscribe to notification when button is clicked
  subscribeBtn.addEventListener('click', function () {
    subscribe();
  });

  // Send message
  form.addEventListener('submit', e => {
    e.preventDefault();

    const formObject = e.target.elements;

    const notification = {
      title: formObject.title.value,
      body: formObject.body.value,
      icon: formObject.icon.value,
      click_action: formObject.click_action.value
    };

    console.log('Sending message to server...')

    fetch('/push-notification/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({notification})
    }).then(response => {
      if (response.status == 200) {
        console.log('Message has been successfully sent');
      } else {
        console.error('An error has occurred while sending message: ', response.statusText);
      }
    }).catch(err => {
      console.error('Am error has occurred while sending message to server: ', err);
    });
  });

  // Receiving message
  messaging.onMessage(function(payload) {
    console.log('Message received. ', payload);
    new Notification(payload.notification.title, payload.notification);
  });
}

function subscribe() {
  // request permission to get notifications
  messaging.requestPermission()
    .then(function () {
      // get device ID
      messaging.getToken()
        .then(function (currentToken) {
          console.log(currentToken);

          if (currentToken) {
            sendTokenToServer(currentToken);
          } else {
            console.warn('Cannot get token');
            setTokenSentToServer(false);
          }
        })
        .catch(function (err) {
          console.warn('An error has occurred while getting token:', err);
          setTokenSentToServer(false);
        });
    })
    .catch(function (err) {
      console.warn('Cannot get permission to receive notifications:', err);
    });
}

// Send device ID to server
function sendTokenToServer(currentToken) {
  if (!isTokenSentToServer(currentToken)) {
    console.log('Sending token to server...');

    fetch('/push-notification/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: currentToken })
    }).then(response => {
      if (response.status == 200) {
        console.log('Token has successfully sent');
        return response.json();
      } else {
        console.error('An error has occurred while sending token to server: ', response.statusText);
      }
    }).then(data => {
      console.log(data);
      subscribeBtn.classList.remove('visible');
      formContainer.classList.add('visible');
      setTokenSentToServer(currentToken);
    });
  } else {
    console.log('Token has already sent to server');
  }
}

// use localStorage to mark that user has already subscribed to messages
function isTokenSentToServer(currentToken) {
  return window.localStorage.getItem('sentFirebaseMessagingToken') == currentToken;
}

function setTokenSentToServer(currentToken) {
  window.localStorage.setItem(
    'sentFirebaseMessagingToken',
    currentToken ? currentToken : ''
  );
}
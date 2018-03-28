const subscribeBtn = document.getElementById('subscribe');
const sendMsgBtn = document.getElementById('send-message');

firebase.initializeApp({
  messagingSenderId: '29128917026'
});

// браузер поддерживает уведомления
// вообще, эту проверку должна делать библиотека Firebase, но она этого не делает
if ('Notification' in window) {
  var messaging = firebase.messaging();

  // Показываем/скрываем кнопки
  messaging.getToken()
  .then(function (currentToken) {
    if (currentToken) {
      subscribeBtn.classList.add('hidden');
      sendMsgBtn.classList.remove('hidden');
    } else {
      console.warn('Не удалось получить токен.');
      subscribeBtn.classList.remove('hidden');
      sendMsgBtn.classList.add('hidden');
    }
  })
  .catch(function (err) {
    console.warn('При получении токена произошла ошибка.', err);
  });

  // пользователь уже разрешил получение уведомлений
  // подписываем на уведомления если ещё не подписали
  if (Notification.permission === 'granted') {
    subscribe();
  }

  // по клику, запрашиваем у пользователя разрешение на уведомления
  // и подписываем его
  subscribeBtn.addEventListener('click', function () {
    subscribe();
  });

  // отправка сообщения
  sendMsgBtn.addEventListener('click', function() {
    const notification = {
      title: 'Title',
      body: 'Body',
      icon: 'http://eralash.ru.rsz.io/sites/all/themes/eralash_v5/logo.png?width=192&height=192',
      click_action: 'http://eralash.ru/'
    };

    fetch('/push-notification/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({notification})
    }).then(response => {
      if (response.status == 200) {
        return response.json();
      } else {
        console.error('An error has occurred: ', response.statusText);
      }
    }).then(data => {
      console.log('Message has been successfully sent');
      console.log(data);
    }).catch(err => {

    });
  });

  // Получение сообщения
  messaging.onMessage(function(payload) {
    console.log('Message received. ', payload);
    new Notification(payload.notification.title, payload.notification);
  });
}

function subscribe() {
  // запрашиваем разрешение на получение уведомлений
  messaging.requestPermission()
    .then(function () {
      // получаем ID устройства
      messaging.getToken()
        .then(function (currentToken) {
          console.log(currentToken);

          if (currentToken) {
            sendTokenToServer(currentToken);
          } else {
            console.warn('Не удалось получить токен.');
            setTokenSentToServer(false);
          }
        })
        .catch(function (err) {
          console.warn('При получении токена произошла ошибка.', err);
          setTokenSentToServer(false);
        });
    })
    .catch(function (err) {
      console.warn('Не удалось получить разрешение на показ уведомлений.', err);
    });
}

// отправка ID на сервер
function sendTokenToServer(currentToken) {
  if (!isTokenSentToServer(currentToken)) {
    console.log('Отправка токена на сервер...');

    var url = '/push-notification/register'; // адрес скрипта на сервере который сохраняет ID устройства
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: currentToken })
    }).then(response => {
      if (response.status == 200) {
        return response.json();
      } else {
        console.error('An error has occurred: ', response.statusText);
      }
    }).then(data => {
      console.log(data);
      subscribeBtn.classList.add('hidden');
      sendMsgBtn.classList.remove('hidden');
      setTokenSentToServer(currentToken);
    });
  } else {
    console.log('Токен уже отправлен на сервер.');
  }
}

// используем localStorage для отметки того,
// что пользователь уже подписался на уведомления
function isTokenSentToServer(currentToken) {
  return window.localStorage.getItem('sentFirebaseMessagingToken') == currentToken;
}

function setTokenSentToServer(currentToken) {
  window.localStorage.setItem(
    'sentFirebaseMessagingToken',
    currentToken ? currentToken : ''
  );
}
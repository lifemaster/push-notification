const request = require('request');

module.exports = app => {
  const registration_ids = [];

  // new users registration
  app.post('/push-notification/register', (req, res, next) => {
    const token = req.body.token;

    registration_ids.push(token);
    res.json({ token });
  });

  app.post('/push-notification/send', (req, res, next) => {
    const notification = req.body.notification; // { title, body, icon, click_action }
    const data = { notification, registration_ids };

    request({
      url: 'https://fcm.googleapis.com/fcm/send',
      method: 'POST',
      headers: {
        'Authorization': 'key=AAAABsg4ACI:APA91bGcJRjB9foQf3Z82MAPjH7aD_eEWnEiHXudNKOP4CuQffPLVKUWQ0nlJYlNS59JOz41-AGo41Z9WqeicRYr0INK8f2ZUVVgeQyHX59FjRstm92S_yaW0BjF1MdiGXtRKtTFMs3K',
        'Content-Type': 'application/json'
      },
      json: true,
      body: data
    }, (err, response, body) => {
      if (err) {
        next(err);
      } else {
        console.log('Message has been successfully sent. Data: ', data);
        res.json({ message: 'OK' });
      }
    });
  });
}
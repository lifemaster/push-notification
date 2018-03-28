const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('./public'));
app.use(bodyParser.json());

require('./routes')(app);

app.listen(8080, () => console.log('Server is listening on port 8080'));
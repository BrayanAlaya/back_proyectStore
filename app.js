const express = require("express");
const cors = require('cors');
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const allowedOrigins = ['https://storeproyect.brayanalaya.dev'];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (por ejemplo, desde Postman) o desde los dominios permitidos
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors());

const routes = require("./routes/index");
app.use("/api", routes);

module.exports = app;
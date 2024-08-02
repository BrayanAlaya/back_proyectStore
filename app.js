const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {

    res.header('Access-Control-Allow-Origin', "*"); // Permite solicitudes desde orígenes específicos
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE'); // Métodos permitidos
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Cabeceras permitidas

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});
const routes = require("./routes/index");
app.use("/api", routes);

module.exports = app;
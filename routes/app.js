var express = require('express');

// Incicializar variables
var app = express();


app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizado correctamente'
    });

});

module.exports = app;
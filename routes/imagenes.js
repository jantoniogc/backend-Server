var express = require('express');
var fs = require('fs');
var path = require('path');

// Incicializar variables
var app = express();


app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var urlpath = `./uploads/${tipo}/${img}`;

    fs.exists(urlpath, existe => {
        if (!existe){
            urlpath = './assets/no-img.jpg'
        }
        res.sendFile(path.resolve(urlpath));
    });
    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Peticion realizado correctamente'
    // });

});

module.exports = app;
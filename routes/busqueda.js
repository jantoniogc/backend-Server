
var express = require('express');

// Incicializar variables
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


//busqueda por colección
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var desde = req.query.desde || 0;
    desde = Number(desde);
    var promesa;
    
    var regex = new RegExp(busqueda, 'i');

    switch (tabla) {
        case 'usuarios': 
            promesa = buscarUsuarios(busqueda, desde, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, desde, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, desde, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no válido'}
            })
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            totalUsuarios: data.length,
            [tabla]: data
        });
    });

});


// busqueda general
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var desde = req.query.desde || 0;
    desde = Number(desde);


    Promise.all([
        buscarHospitales(busqueda, desde, regex),
        buscarMedicos(busqueda, desde, regex),
        buscarUsuarios(busqueda, desde, regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            totalUsuarios: respuestas[0].length + respuestas[1].length + respuestas[2].length,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });

});

function buscarHospitales(busqueda, desde, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .skip(desde) // se salta los primero registros indicados en la variable "desde"
            .limit(5)
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar Hostpirales');
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, desde, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            // .count((err, count) => {console.log(count)})
            .skip(desde) // se salta los primero registros indicados en la variable "desde"
            .limit(5)
            .populate('usuario', 'nombre email img')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar Hostpirales');
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, desde, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role google img')
            .skip(desde) // se salta los primero registros indicados en la variable "desde"
            .limit(5)
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar Usuarios');
                } else {
                    resolve(usuarios);
                }
            })
    });
}

module.exports = app;
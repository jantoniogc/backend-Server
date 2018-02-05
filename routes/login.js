var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


var SEED = require('../config/config').SEED;

// Incicializar variables
var app = express();

var Usuario = require('../models/usuario');

// Login de usuario
app.post('/', (req, res) => {

    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB){
            return res.status(500).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        //Creamos un Tocken!!! 
        usuarioDB.password = ':)'
        var tocken = jwt.sign({usuario: usuarioDB}, SEED, { expiresIn: 14400 }) // 4 Horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB._id,
            tocken: tocken
        });
    })
});



module.exports = app;
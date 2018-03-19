var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// Verificar Tocken 
exports.verificaTocken = function (req, res, next) {
    var tocken = req.query.tocken;
    jwt.verify(tocken, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Tocker incorrecto',
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
}

// Verificar Tocken 
exports.verificaAdmin = function (req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Tocken incorrecto -  No es administrador',
            errors: { message: 'No es administrador' }
        });
    }
}

// Verificar Tocken 
exports.verificaAdmin_o_MismoUsuario = function (req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Tocken incorrecto -  No es administrador ni es el mismo usuario',
            errors: { message: 'No es administrador' }
        });
    }
}
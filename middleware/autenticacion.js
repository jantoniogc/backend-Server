var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// Verificar Tocken 
exports.verificaTocken = function (req, res, next){
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


var express = require('express');

var mdAuthentic = require('../middleware/autenticacion');
// Incicializar variables
var app = express();


var Hospital = require('../models/hospital');

// Obtener todos los hospitales
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    
    Hospital.find({})
        .skip(desde) // se salta los primero registros indicados en la variable "desde"
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospitales',
                errors: err
            });
        }

        Hospital.count({},(err, count) =>{
            res.status(200).json({
                ok: true,
                totalHospitales: count,
                hospital: hospital
            });
        })
       

    });
});

// Crear nuevo Hospital
app.post('/', mdAuthentic.verificaTocken, (req, res) => {

    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    })
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            body: hospitalGuardado,
            usuarioTocken: req.usuario
        });
    })
});

// Actualizar nuevo hospital

app.put('/:id', mdAuthentic.verificaTocken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(500).json({
                ok: false,
                mensaje: 'El hospital con id: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                body: hospitalGuardado
            });
        })

    })
});

// Borrar un hospital

app.delete('/:id', mdAuthentic.verificaTocken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando usuario',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con id: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
})


module.exports = app;
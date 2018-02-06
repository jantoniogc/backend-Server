const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');

// Incicializar variables
var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipo de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Las colecciones válidas son ' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe de selecionar una imagen' }
        });
    }

    // Ontener nombre del archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo aceptamos estas extensiones
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no Válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un path . Ver documentación de express-fileupload
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover arhivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    })

});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                var path = `./uploads/${tipo}/${nombreArchivo}`;
                // Borramos imagen que hemos movido a la carpeta upload
                if (fs.existsSync(path)) {
                    fs.unlink(path);
                }
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            // Si existe eliminamos la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualzada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                var path = `./uploads/${tipo}/${nombreArchivo}`;
                // Borramos imagen que hemos movido a la carpeta upload
                if (fs.existsSync(path)) {
                    fs.unlink(path);
                }
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;
            // Si existe eliminamos la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoactualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualzada',
                    medico: medicoactualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById (id, (err, hospital) => {
            if (!hospital) {
                var path = `./uploads/${tipo}/${nombreArchivo}`;
                // Borramos imagen que hemos movido a la carpeta upload
                if (fs.existsSync(path)) {
                    fs.unlink(path);
                }
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                res.status(200).json({
                    ok: true,
                    message: 'Imagen de hostpital actualizada',
                    hospital: hospitalActualizado
                })
            })
        })
    }
}

module.exports = app;
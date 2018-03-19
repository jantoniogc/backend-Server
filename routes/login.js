var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


const SEED = require('../config/config').SEED;
const GOOGLE_CLIENT_ID = require('../config/config').CLIENT_ID;
const GOOGLE_CLIENT_SECRET = require('../config/config').CLIENT_SECRET;



// Incicializar variables
var app = express();

var Usuario = require('../models/usuario');

var googleAuth = require('google-auth-library');

var mdAuthenticacion = require('../middleware/autenticacion');

app.get('/renuevatoken', mdAuthenticacion.verificaTocken, (req, res) => {
    
    var tocken = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 })
    res.status(200).json({
        ok: true,
        tocken: tocken
    });

});


// Authenticacion de Google
app.post('/google', (req, res) => {
    var token = req.body.token || 'XXXX';
    var client = new googleAuth.OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, '');

    client.verifyIdToken({
        idToken: token,
        // audience: GOOGLE_CLIENT_ID
        // audience: GOOGLE_CLIENT_ID,
        // maxExpiry
    }, (err, login) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Token no Válido',
                errors: err
            });
        }
        var payload = login.getPayload();
        var userid = payload['sub'];
        Usuario.findOne({ email: payload.email }, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario - login',
                    errors: err
                });
            }
            if (usuario) {
                if (usuario.google === false) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar su authenticacion normal',
                        errors: err
                    });
                } else {
                    usuario.password = ':)';
                    var tocken = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }) // 4 Horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        id: usuario._id,
                        tocken: tocken,
                        menu: obtenerMenu(usuario.role)
                    });
                }
            } else { // Si el usuario no existe lo creamos
                var usuario = new Usuario();
                usuario.nombre = payload.name;
                usuario.email = payload.email;
                usuario.password = ':)';
                usuario.img = payload.picture;
                usuario.google = true;
                usuario.save((err, usuarioAlmacenado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al crear usuario',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        usuario: usuarioAlmacenado,
                        id: usuarioAlmacenado._id,
                        token: token,
                        menu: obtenerMenu(usuarioAlmacenado.role)
                    });
                })
            }
        })
    });

});

// Login de usuario Authenticación Normal
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

        if (!usuarioDB) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        //Creamos un Tocken!!! 
        usuarioDB.password = ':)'
        var tocken = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) // 4 Horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB._id,
            tocken: tocken,
            menu: obtenerMenu(usuarioDB.role)
        });
    })
});

function obtenerMenu(role) {
    var menu = [
        {
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                {
                    titulo: 'Dashboard',
                    url: '/dashboard'
                },
                {
                    titulo: 'ProgressBar',
                    url: '/progress'
                },
                {
                    titulo: 'Gráficas',
                    url: '/graficas1'
                },
                {
                    titulo: 'Promesas',
                    url: '/promesas'
                },
                {
                    titulo: 'Rxjs',
                    url: '/rxjs'
                }
            ]
        },
        {
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // {
                //     titulo: 'Usuario',
                //     url: '/usuarios'
                // },
                {
                    titulo: 'Hospitales',
                    url: '/hospitales'
                },
                {
                    titulo: 'Medicos',
                    url: '/medicos'
                }
            ]
        },
        {
            titulo: 'Otros',
            icono: 'mdi mdi-folder-account',
            submenu: [
                {
                    titulo: 'About',
                    url: '/about'
                },
                {
                    titulo: 'Users',
                    url: '/users'
                },
                {
                    titulo: 'Cash',
                    url: '/cash'
                },
                {
                    titulo: 'Cars',
                    url: '/cars'
                }
            ]
        }
    ];

    if (role === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuario', url: '/usuarios' })
    }

    return menu;
}

module.exports = app;
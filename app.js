// Requires
var express = require('express');
var mongoose = require('mongoose');


// Incicializar variables
var app = express();



// Conexion a la base de datos
mongoose.connect('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos:\x1b[32m%s\x1b[0m', ' online')
});

// Rutas

app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizado correctamente'
    })

})






// Escuchar Peticiones

app.listen(8000, () => {
    console.log('Express server puerto 8000:\x1b[32m%s\x1b[0m',' online')
})
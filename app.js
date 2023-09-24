const debug = require('debug')('app:inicio');
// const dbDebug = require('debug')('app:db');
const express = require('express');
const config = require('config');
//const logger = require('./logger');
const morgan = require('morgan');
const Joi = require('joi');
const app = express();
const usuarios =[
    {id:1, nombre: 'Grover'},
    {id:2, nombre: 'Pablo'},
    {id:3, nombre: 'Ana'}
];

// functions middleware, se ejecutan antes de las functions routes
app.use(express.json()); // request body envio data

app.use(express.urlencoded({extended: true})); // urlencoded envio data
app.use(express.static('public'));

// Configuracion de entornos
console.log('Aplication: ' + config.get('nombre'));
console.log('DB Server: ' + config.get('configDB.host'));

// app.use(logger);
// app.use(function(req, res, next){
//     console.log('Autenticando');
//     next();
// });

// Uso dee middleware de tercero - Morgan. Permite ver los logs solo para modo desarrollo
if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    // console.log('Morgan habilitado');    
    debug('Morgan esta habilitado.');
}

// Trabajos con la base de datos
debug('Conectando con la base de datos');

// Metodos a implementar
app.get('/', (req, res) => {
    res.send('Hola Mundo desde Express.');
}); 

app.get('/api/usuarios', (req, res)=>{
    res.send(usuarios);
});


app.get('/api/usuarios/:id', (req, res)=>{
    let usuario = existeUsuario(req.params.id);
    if(!usuario) {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }
    res.send(usuario);
});

app.post('/api/usuarios', (req, res) => {
    let body = req.body;

    // console.log(body.nombre);
    // res.json({
    //     body
    // })

    const {error, value} = validarUsuario(req.body.nombre); 
    
    if(!error){
        const usuario = {
            id: usuarios.length + 1, 
            nombre: value.nombre
        };
    
        usuarios.push(usuario);
        res.send(usuario);
    }else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }

});

app.put('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if(!usuario) {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }
    
    const {error, value} = validarUsuario(req.body.nombre); 
    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);

});

app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id); 
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1); // se le indica cuantos elementos tiene que eliminar en el segundo parametro
    res.send(usuarios);
});

const port = process.env.PORT || 3000

app.listen(port, ()=>{
    console.log(`Escuchando en el puerto ${port}.`);
});


// functions validation
function existeUsuario(id){
    return (usuarios.find(u => u.id === parseInt(id)));
}


function validarUsuario(nom){
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });

    return (schema.validate({ nombre: nom }));

}

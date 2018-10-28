const express = require('express');
const _ = require('underscore');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

/**
 * Mostrar todas las categorías
 */
app.get('/categoria', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Categoria.find({}, 'nombre descripcion usuario')
        .skip(desde)
        .limit(limite)
        .exec((err, categorias) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments({}, (err, conteo) => {

                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });

            });


        });

});

/**
 * Mostrar una categoria por ID las categorías
 */
app.get('/categoria/:id', (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'La categoría (ID) no existe'
                }
            });
        }


        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

/**
 * Crea una nueva categoría
 */
app.post('/categoria', verificaToken, (req, res) => {
    //Regresa la nueva categoria
    //req.usuario._id = id del usuario con el token

    let body = req.body;

    let categoria = new Categoria({
        nombre: body.nombre,
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

/**
 * Actualiza una categoría
 */
app.put('/categoria/:id', (req, res) => {
    //Actualiza sólo el nombre de la categoria

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'descripcion']);

    Categoria.findByIdAndUpdate(id, body, { new: true}, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'El nombre debe ser único.'
                }
            });
        };

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });


});

/**
 * Elimina una categoria
 */
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // Solo un administrador puede borrar.
    // categoria.findByIdAndremove

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'La categoría (ID) no existe.'
                }
            });
        };

        res.json({
            ok: true,
            categoria: categoriaDB,
            message: 'Categoría borrada.'
        });

    });

});

module.exports = app;
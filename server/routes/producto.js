const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
let app = express();

let Producto = require('../models/producto');
let Categoria = require('../models/categoria');

/**
 * Obtener todos los productos
 */
app.get('/producto', verificaToken, (req, res) => {
    //Trae todos los productos
    //Populate debe cargar usuarios y categorias.
    //Paginados

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true }, 'nombre precioUni descripcion disponible categoria usuario')
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre descripcion')
        .skip(desde)
        .limit(limite)
        .exec((err, productos) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments({}, (err, conteo) => {

                if (conteo <= 0) {
                    res.json({
                        ok: false,
                        err: {
                            message: 'No hay productos registrados'
                        }
                    });
                } else {
                    res.json({
                        ok: true,
                        productos,
                        cuantos: conteo
                    });
                }

            });


        });


});

/**
 * Obtener un producto por ID
 */
app.get('/producto/:id', verificaToken, (req, res) => {
    //Trae todos los productos
    //Populate debe cargar usuarios y categorias.
    // Sin paginación

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre descripcion')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'El producto (ID) no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });



});

/**
 * Buscar productos
 */
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            };

            return res.json({
                ok: true,
                productos
            });

        });

});

/**
 * Crear un nuevo producto
 */
app.post('/producto', verificaToken, (req, res) => {
    // Grabar un usuario
    // Grabar una categoria que ya exista.

    //Obtiene el body request que viene desde el cliente y lo transforma en un objeto.
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

/**
 * Actualizar un producto
 */
app.put('/producto/:id', verificaToken, (req, res) => {
    // Grabar el usuario
    // Grabar el usuario de categoria que ya exista.

    let id = req.params.id;
    let body = req.body;

    Categoria.findById(body.categoria, (err, categoriaDB) => {

        if (typeof categoriaDB === 'undefined') {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'La categoría no existe'
                }
            });
        };

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        Producto.findByIdAndUpdate(id, body, { new: true }, (err, productoDB) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            };

            res.json({
                ok: true,
                producto: productoDB
            });

        });
    });
});

/**
 * Cambiar estado de un producto de disponible a false
 */
app.delete('/producto/:id', verificaToken, (req, res) => {
    // Cambiar el estado del producto.

    let id = req.params.id;

    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    let cambiaDisponible = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiaDisponible, { new: true })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre descripcion')
        .exec((err, productoBorrado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            };

            if (!productoBorrado) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto borrado o deshabilitado'
            });

        });

});



module.exports = app;
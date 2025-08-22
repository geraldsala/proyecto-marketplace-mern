// backend/routes/uploadRoutes.js (Versión Corregida a CommonJS)

const path = require('path');
const express = require('express');
const multer = require('multer');

const router = express.Router();

// --- Configuración de Multer (esta parte no cambia) ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: ¡Solo se permiten imágenes (jpg, jpeg, png)!'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// --- Definición de la Ruta (esta parte no cambia) ---
router.post('/', upload.single('image'), (req, res) => {
  res.send({
    message: 'Imagen subida exitosamente',
    image: `/uploads/${req.file.filename}` // Usamos filename para una ruta más limpia
  });
});


// --- ¡ESTA LÍNEA ES LA CORRECTA PARA COMMONJS! ---
module.exports = router;
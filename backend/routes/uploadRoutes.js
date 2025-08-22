// backend/routes/uploadRoutes.js

import path from 'path';
import express from 'express';
import multer from 'multer';

const router = express.Router();

// --- Configuración de Multer ---

// 1. Dónde se guardarán los archivos
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // 'cb' es un callback que se ejecuta. El primer argumento es para errores (null si no hay).
    // El segundo es la carpeta de destino.
    cb(null, 'uploads/'); // Asegúrate de tener una carpeta 'uploads' en la raíz de tu backend
  },
  filename(req, file, cb) {
    // Cómo se nombrará el archivo para evitar nombres duplicados
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
    // Resultado: image-1678886400000.jpg
  },
});

// 2. Función para validar que solo se suban imágenes
function checkFileType(file, cb) {
  // Expresión regular para los tipos de archivo permitidos
  const filetypes = /jpg|jpeg|png/;
  // Comprobamos la extensión del archivo (ej: .jpg)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Comprobamos el tipo MIME (ej: image/jpeg)
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: ¡Solo se permiten imágenes (jpg, jpeg, png)!'));
  }
}

// 3. Inicializamos multer con la configuración
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// --- Definición de la Ruta ---

// @route   POST /api/upload
// @desc    Sube un archivo y devuelve la ruta
// @access  (Protegida si es necesario, por ahora la dejamos abierta para simplicidad)
router.post('/', upload.single('image'), (req, res) => {
  // 'upload.single('image')' es el middleware. 'image' debe coincidir con el nombre
  // del campo en el FormData del frontend: formData.append('image', file).
  
  // Si multer funciona, el archivo estará en req.file.
  // Respondemos al frontend con la ruta donde se guardó el archivo.
  res.send({
    message: 'Imagen subida exitosamente',
    image: `/${req.file.path.replace(/\\/g, '/')}` // Normalizamos la ruta para que use '/'
  });
});

export default router;
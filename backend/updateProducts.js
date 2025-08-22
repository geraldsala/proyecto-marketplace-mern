const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');

// Cargar modelos
const Product = require('./models/Product.js');
const Category = require('./models/categoryModel.js');

// Cargar variables de entorno
// CORRECCIÓN: Le decimos a dotenv dónde encontrar el archivo .env
dotenv.config({ path: './backend/.env' });

// Conectar a la base de datos
connectDB();

const updateProductsCategory = async () => {
  try {
    console.log('Buscando la categoría "Portátiles"...');
    
    // 1. Buscar el ID de la categoría "Portátiles"
    const category = await Category.findOne({ nombre: 'Portátiles' });

    if (!category) {
      console.error('ERROR: La categoría "Portátiles" no existe en la base de datos. Por favor, créela primero.');
      process.exit(1);
    }

    console.log(`Categoría "Portátiles" encontrada con ID: ${category._id}`);

    // 2. Definir el filtro para encontrar los productos a actualizar
    const filter = {
      "nombre": { "$regex": "Laptop|Portátil", "$options": "i" }
    };

    // 3. Definir la actualización a realizar
    const update = {
      "$set": { "categoria": category._id }
    };
    
    console.log('Actualizando productos... Esto puede tardar un momento.');

    // 4. Ejecutar la actualización masiva
    const result = await Product.updateMany(filter, update);

    console.log('-------------------------------------------');
    console.log('✅ ¡ACTUALIZACIÓN COMPLETADA!');
    console.log(`   -> Documentos encontrados que coinciden: ${result.matchedCount}`);
    console.log(`   -> Documentos actualizados exitosamente: ${result.modifiedCount}`);
    console.log('-------------------------------------------');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ ERROR: Ocurrió un fallo durante el script.', error);
    process.exit(1);
  }
};

// Ejecutar la función
updateProductsCategory();
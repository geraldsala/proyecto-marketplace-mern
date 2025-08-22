// updateCategories.js

// No se necesitan estas líneas, ya que la URL se pondrá directamente.
// const path = require('path');
// const dotenv = require('dotenv');
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Product = require('./models/Product.js');
const Category = require('./models/categoryModel.js');

// Pega tu URL de MongoDB aquí, entre comillas.
const DB_URI = 'mongodb+srv://gsalazarcordoba:Costarica19@cluster0.867rzf7.mongodb.net/marketplace_db?retryWrites=true&w=majority&appName=Cluster0';

const updateCategories = async () => {
  try {
    // Conexión a la base de datos
    await mongoose.connect(DB_URI);
    console.log('Conectado a MongoDB. ✅');

    const laptopCategory = await Category.findOne({ nombre: 'Portátiles' });

    if (!laptopCategory) {
      console.log('No se encontró la categoría "Portátiles".');
      console.log('Por favor, crea la categoría con el nombre "Portátiles" y vuelve a ejecutar este script.');
      return; 
    }

    const laptopCategoryId = laptopCategory._id;
    console.log(`Se encontró la categoría "Portátiles" con el ID: ${laptopCategoryId}`);

    const result = await Product.updateMany(
      { categoria: new mongoose.Types.ObjectId('68a7b7b872eae1ed4d977b24') },
      { $set: { categoria: laptopCategoryId } }
    );

    console.log(`\n🎉 Se actualizaron exitosamente ${result.modifiedCount} productos. 🎉`);
    
  } catch (error) {
    console.error('Error al actualizar las categorías:', error);
  } finally {
    mongoose.disconnect();
    console.log('\nDesconectado de MongoDB.');
  }
};

updateCategories();
// backend/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // Limpiar productos existentes para evitar duplicados
    await Product.deleteMany();

    // Buscar un usuario de tipo 'tienda' para asignarle los productos
    const tienda = await User.findOne({ tipoUsuario: 'tienda' });

    if (!tienda) {
      console.log('Error: No se encontró una tienda para asignar los productos.');
      process.exit();
    }

    const sampleProducts = [
      // =================================
      //      Productos de Laptops (4)
      // =================================
      {
        tienda: tienda._id,
        nombre: 'LAPTOP ASUS E1504GA-NJ275 15.6" N305/8GB/512GB',
        imagenes: ['https://cdn-ilaabjh.nitrocdn.com/OzMRamyAKVKkRfGWMkLhcUdtvVYEmpJD/assets/images/optimized/rev-e4e601b/crtechstore.com/wp-content/uploads/2025/06/lp0106-500x500.webp'],
        descripcion: 'Laptop con procesador Intel N305.',
        categoria: 'Laptops',
        precio: 168200,
        stock: 10,
        especificacionesTecnicas: {
          modelo: 'E1504GA-NJ275',
          ram: '8 GB',
          compatibilidad: 'Windows'
        },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'San José'
      },
      {
        tienda: tienda._id,
        nombre: 'LAPTOP LENOVO 14" E41-55 A3050U 4GB/256GB SSD',
        imagenes: ['https://cdn-ilaabjh.nitrocdn.com/OzMRamyAKVKkRfGWMkLhcUdtvVYEmpJD/assets/images/optimized/rev-e4e601b/crtechstore.com/wp-content/uploads/2024/02/E41-55-1.jpg'],
        descripcion: 'Laptop con procesador AMD 3050U.',
        categoria: 'Laptops',
        precio: 194000,
        stock: 5,
        especificacionesTecnicas: {
          modelo: 'E41-55',
          ram: '4 GB',
          compatibilidad: 'Windows'
        },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'Alajuela'
      },
      {
        tienda: tienda._id,
        nombre: 'LAPTOP LENOVO IDEAPAD SLIM 3 15IAN8',
        imagenes: ['https://cdn-ilaabjh.nitrocdn.com/OzMRamyAKVKkRfGWMkLhcUdtvVYEmpJD/assets/images/optimized/rev-e4e601b/crtechstore.com/wp-content/uploads/2025/02/19316_16071-500x500.jpg'],
        descripcion: 'Laptop con procesador Intel Core i3.',
        categoria: 'Laptops',
        precio: 195000,
        stock: 12,
        especificacionesTecnicas: {
          modelo: 'IDEAPAD SLIM 3',
          ram: '8 GB',
          compatibilidad: 'Windows'
        },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'Heredia'
      },
      {
        tienda: tienda._id,
        nombre: 'LAPTOP GAMING MSI THIN 15 B12VE 15.6 I5',
        imagenes: ['https://crtechstore.com/wp-content/uploads/2025/02/LAPTOP-GAMING-MSI-THIN-15-B12UC-15-I5-12450H-16GB1-500x500.webp'],
        descripcion: 'Laptop de gaming con procesador Intel Core i5.',
        categoria: 'Laptops',
        precio: 515500,
        stock: 0,
        especificacionesTecnicas: {
          modelo: 'THIN 15 B12VE',
          ram: '16 GB',
          compatibilidad: 'Windows'
        },
        estado: 'nuevo',
        tiempoEnvio: 'Despacho 48Hrs',
        costoEnvio: 5000,
        ubicacion: 'San José'
      },
      // =================================
      //        Productos de Audio (4)
      // =================================
      {
        tienda: tienda._id,
        nombre: 'PARLANTE JBL FLIP 6 BLUETOOTH A PRUEBA DE AGUA',
        imagenes: ['https://crtechstore.com/wp-content/uploads/2025/03/14348_8624-500x500.webp'],
        descripcion: 'Parlante JBL a prueba de agua con sonido de alta fidelidad.',
        categoria: 'Audio',
        precio: 53000,
        stock: 100,
        especificacionesTecnicas: { modelo: 'JBL Flip 6', ram: 'N/A', compatibilidad: 'Bluetooth' },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'San José'
      },
      {
        tienda: tienda._id,
        nombre: 'Parlante Sony SRS-XB',
        imagenes: ['https://www.imax.co.cr/cdn/shop/files/654368567bc9f62896a18c15_thumbnail.webp?v=1752864468&width=1080'],
        descripcion: 'Parlante Sony con bajos potentes y diseño portátil.',
        categoria: 'Audio',
        precio: 22000,
        stock: 100,
        especificacionesTecnicas: { modelo: 'SRS-XB', ram: 'N/A', compatibilidad: 'Bluetooth' },
        estado: 'nuevo',
        tiempoEnvio: 'Despacho 48Hrs',
        costoEnvio: 0,
        ubicacion: 'Heredia'
      },
      {
        tienda: tienda._id,
        nombre: 'HEADSET RAZER GAMING KRAKEN V3',
        imagenes: ['https://crtechstore.com/wp-content/uploads/2025/02/12404_7903-500x500.webp'],
        descripcion: 'Audífonos para gaming con sonido envolvente 7.1.',
        categoria: 'Audio',
        precio: 42000,
        stock: 100,
        especificacionesTecnicas: { modelo: 'Kraken V3', ram: 'N/A', compatibilidad: 'PC, Mac, Consolas' },
        estado: 'nuevo',
        tiempoEnvio: 'Despacho 48Hrs',
        costoEnvio: 0,
        ubicacion: 'Heredia'
      },
      {
        tienda: tienda._id,
        nombre: 'HEADSET LOGITECH GAMER G335 WHITE',
        imagenes: ['https://crtechstore.com/wp-content/uploads/2024/09/981-001017-a-500x500.webp'],
        descripcion: 'Audífonos Logitech ultraligeros y cómodos para largas sesiones de juego.',
        categoria: 'Audio',
        precio: 31000,
        stock: 100,
        especificacionesTecnicas: { modelo: 'G335 White', ram: 'N/A', compatibilidad: 'PC, Consolas' },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'Alajuela'
      },
      // =================================
      //      Productos de Celulares (4)
      // =================================
      {
        tienda: tienda._id,
        nombre: 'Xiaomi Redmi Note 13',
        imagenes: ['https://xiaomistore.co.cr/wp-content/uploads/823620Redmi20Note201320Ice20Blue208GB20RAM20256GB-1.webp'],
        descripcion: 'Celular Xiaomi con excelentes prestaciones y cámara de alta resolución.',
        categoria: 'Celulares',
        precio: 150000,
        stock: 100,
        especificacionesTecnicas: { modelo: 'Redmi Note 13', ram: '8 GB', compatibilidad: 'Android' },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'San José'
      },
      {
        tienda: tienda._id,
        nombre: 'Samsung Galaxy S25 ULTRA',
        imagenes: ['https://extremetechcr.com/tienda/45154-home_default/samsung-s25-ultra-12-gb-256-gb-silvershadow-sm-s936bds.jpg'],
        descripcion: 'El último buque insignia de Samsung con la mejor tecnología móvil.',
        categoria: 'Celulares',
        precio: 450000,
        stock: 100,
        especificacionesTecnicas: { modelo: 'Galaxy S25 ULTRA', ram: '12 GB', compatibilidad: 'Android' },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'Heredia'
      },
      {
        tienda: tienda._id,
        nombre: 'Honor Magic 7',
        imagenes: ['https://extremetechcr.com/tienda/42037-home_default/honor-magic7-lite-5g-256gb-8gb-titanio-morado.jpg'],
        descripcion: 'Diseño elegante y gran rendimiento con el Honor Magic 7.',
        categoria: 'Celulares',
        precio: 280000,
        stock: 100,
        especificacionesTecnicas: { modelo: 'Magic 7', ram: '8 GB', compatibilidad: 'Android' },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'Alajuela'
      },
      {
        tienda: tienda._id,
        nombre: 'Xiaomi 14C',
        imagenes: ['https://xiaomistore.co.cr/wp-content/uploads/Redmi2014C20Negro.webp'],
        descripcion: 'Un smartphone balanceado con la calidad de Xiaomi.',
        categoria: 'Celulares',
        precio: 200000,
        stock: 100,
        especificacionesTecnicas: { modelo: '14C', ram: '6 GB', compatibilidad: 'Android' },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'San José'
      },
      // =================================
      //     Productos de Smart Home (4)
      // =================================
      {
        tienda: tienda._id,
        nombre: 'Xiaomi Smart Speaker',
        imagenes: ['https://cdn-ilaabjh.nitrocdn.com/OzMRamyAKVKkRfGWMkLhcUdtvVYEmpJD/assets/images/optimized/rev-e4e601b/crtechstore.com/wp-content/uploads/2025/02/16833_13013-500x500.jpg'],
        descripcion: 'Controla tu hogar inteligente con este parlante de Xiaomi.',
        categoria: 'Smart Home',
        precio: 45000,
        stock: 100,
        especificacionesTecnicas: { modelo: 'Smart Speaker', ram: 'N/A', compatibilidad: 'Google Assistant' },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'Heredia'
      },
      {
        tienda: tienda._id,
        nombre: 'Amazon Echo Dot 5',
        imagenes: ['https://cyberteamcr.com/wp-content/uploads/2023/03/75381172-1.webp'],
        descripcion: 'El popular parlante inteligente de Amazon con Alexa.',
        categoria: 'Smart Home',
        precio: 35000,
        stock: 100,
        especificacionesTecnicas: { modelo: 'Echo Dot 5th Gen', ram: 'N/A', compatibilidad: 'Amazon Alexa' },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'San José'
      },
      {
        tienda: tienda._id,
        nombre: 'Xiaomi Mi Home Security Cam',
        imagenes: ['https://crtechstore.com/wp-content/uploads/2025/03/17995_14245-500x500.webp'],
        descripcion: 'Cámara de seguridad inteligente para monitorear tu hogar.',
        categoria: 'Smart Home',
        precio: 60000,
        stock: 100,
        especificacionesTecnicas: { modelo: 'Mi Home Security', ram: 'N/A', compatibilidad: 'Mi Home App' },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'Alajuela'
      },
      {
        tienda: tienda._id,
        nombre: 'Nexxt Smart Security Cam',
        imagenes: ['https://crtechstore.com/wp-content/uploads/2024/07/CAMARA-NEXXT-NHC-O610-INTELIGENTE-2K-1-500x500.webp'],
        descripcion: 'Cámara de seguridad inteligente de alta resolución 2K.',
        categoria: 'Smart Home',
        precio: 55000,
        stock: 100,
        especificacionesTecnicas: { modelo: 'NHC-O610', ram: 'N/A', compatibilidad: 'Nexxt Home App' },
        estado: 'nuevo',
        tiempoEnvio: 'Envío Rápido',
        costoEnvio: 0,
        ubicacion: 'Heredia'
      },
    ];

    await Product.insertMany(sampleProducts);
    console.log('Datos importados con éxito.');
    process.exit();

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log('Datos eliminados con éxito.');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

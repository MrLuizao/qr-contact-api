const express = require('express');
const { generateContactQR, sendContactEmail } = require('../controllers/contactController');

const router = express.Router();

router.post('/contact', async (req, res) => {
  const { empresa, contacto, telefono, email } = req.body;

  // Validar campos requeridos
  if (!empresa || !contacto || !telefono || !email) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Generar QR
    const qrCodeData = await generateContactQR(req.body);
    
    // Enviar correo
    await sendContactEmail(req.body, qrCodeData);

    res.status(200).json({ 
      message: 'Contacto procesado exitosamente', 
      qrCode: qrCodeData 
    });
  } catch (error) {
    console.error('Error en el proceso:', error);
    res.status(500).json({ 
      message: 'Error procesando el contacto', 
      error: error.message 
    });
  }
});

module.exports = router;
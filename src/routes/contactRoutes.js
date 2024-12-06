const express = require('express');
const { 
  generateContactQR, 
  sendContactEmail, 
  saveContactToFirestore 
} = require('../controllers/contactController');

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

    // Guardar los datos en Firestore
    const saveResult = await saveContactToFirestore(req.body, qrCodeData);
    if (!saveResult.success) {
      return res.status(400).json({ message: saveResult.message });
    }

    // Enviar correo
    await sendContactEmail(req.body, qrCodeData);

    res.status(200).json({ 
      message: 'Pronto nos pondremos en contacto', 
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
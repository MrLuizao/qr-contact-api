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
    // Primero guardar los datos en Firestore
    const saveResult = await saveContactToFirestore(req.body);
    
    // Si el guardado no fue exitoso (por ejemplo, email duplicado)
    if (!saveResult.success) {
      return res.status(400).json({ message: saveResult.message });
    }

    // Generar QR usando el ID del registro recién creado
    const qrCodeData = await generateContactQR(saveResult.contactId);

    // Enviar correo
    await sendContactEmail(req.body, qrCodeData);

    res.status(200).json({
      message: 'Pronto nos pondremos en contacto',
      qrCode: qrCodeData,
      contactId: saveResult.contactId
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
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

// Configuración de transporte de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'luisonvazquez7@gmail.com',
    pass: 'cvvbvpnopxeaishw'
  }
});

// Generar código QR
async function generateContactQR(contactData) {
  const { empresa, contacto, telefono, email } = contactData;
  const qrText = `Empresa: ${empresa}\nContacto: ${contacto}\nTeléfono: ${telefono}\nEmail: ${email}`;
  
  return await QRCode.toDataURL(qrText);
}

// Enviar correo electrónico
async function sendContactEmail(contactData, qrCodeData) {
  const { empresa, contacto, telefono, email } = contactData;

  const mailOptions = {
    from: 'luisonvazquez7@gmail.com',
    to: email,
    subject: 'Confirmación de contacto con QR',
    html: `
      <h3>Hola ${contacto},</h3>
      <p>Gracias por el registro de ${empresa}. Nos pondremos en contacto contigo pronto.</p>
      <p>Detalles:</p>
      <ul>
        <li>Teléfono: ${telefono}</li>
        <li>Email: ${email}</li>
      </ul>
      <p>Escanea este código QR para ver tus detalles:</p>
      <img src="${qrCodeData}" alt="Código QR" />
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  generateContactQR,
  sendContactEmail
};
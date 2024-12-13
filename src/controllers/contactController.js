const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Cargar credenciales de Firebase
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN  
};
// const serviceAccount = require('../config/key-firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Configuración de transporte de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
    // user: 'luisonvazquez7@gmail.com',
    // pass: 'cvvbvpnopxeaishw'
  }
});

// Generar código QR
async function generateContactQR(contactId) {

  const qrUrl = `https://expo-details.web.app/details/${contactId}`; //PROD
  // const qrUrl = `http://localhost:4200/details/${contactId}`; //LOCAL

  // Generar código QR con la URL
  const qrCodeData = await QRCode.toDataURL(qrUrl, { 
    errorCorrectionLevel: 'H', 
    type: 'image/png' 
  });

  return qrCodeData;
}

// Verificar si el correo ya existe
async function isEmailRegistered(email) {
  const snapshot = await db
    .collection('registered-users')
    .where('email', '==', email)
    .get();
  return !snapshot.empty; // Devuelve `true` si hay resultados
}

// Guardar contacto en Firestore con validación y para devolver el ID
async function saveContactToFirestore(contactData) {
  const { empresa, contacto, telefono, email } = contactData;
   
  // Verificar si el correo ya existe
  const emailExists = await isEmailRegistered(email);
  if (emailExists) {
    return {
      success: false,
      message: `El correo ${email} ya está registrado.`,
    };
  }

  // Crear documento en Firestore
  const docRef = db.collection('registered-users').doc();
  await docRef.set({
    empresa,
    contacto,
    telefono,
    email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    message: 'Contacto guardado exitosamente.',
    contactId: docRef.id  // Devolver el ID del documento
  };
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
  sendContactEmail,
  saveContactToFirestore
};
// backend/middleware/authMiddleware.js

const admin = require('firebase-admin');

// --- Firebase Admin Initialization ---
// IMPORTANT: Initialize Firebase Admin SDK.
// Best practice: Use GOOGLE_APPLICATION_CREDENTIALS environment variable
// pointing to your service account key file.
// Initialize only ONCE (e.g., in your main index.js/server.js file).
// This check prevents re-initialization if already done elsewhere.
if (!admin.apps.length) {
  try {
    admin.initializeApp(); // Automatically uses GOOGLE_APPLICATION_CREDENTIALS
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
    // You might want to prevent the server from starting if this fails
    // process.exit(1);
  }
}
// --- End Initialization ---


const authMiddleware = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    console.log('No Bearer token found in Authorization header');
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  const idToken = authorizationHeader.split('Bearer ')[1];

  if (!idToken) {
     console.log('Bearer token found but format is incorrect or token is missing');
     return res.status(401).json({ message: 'Unauthorized: Malformed token.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // Add decoded token info (including uid) to the request object
    req.user = decodedToken;
    console.log(`Authenticated user: ${decodedToken.uid}`); // Log successful auth
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error.code, error.message);
    if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ message: 'Unauthorized: Token expired.' });
    }
    return res.status(403).json({ message: 'Forbidden: Invalid token.' });
  }
};

// Ensure correct export
module.exports = { authMiddleware };

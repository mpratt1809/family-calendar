// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Paste your Firebase config here (from Firebase Console)
// See SETUP.md for instructions on how to get this.
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove, update }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY_HERE",
  authDomain:        "PASTE_YOUR_AUTH_DOMAIN_HERE",
  databaseURL:       "PASTE_YOUR_DATABASE_URL_HERE",
  projectId:         "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket:     "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId:             "PASTE_YOUR_APP_ID_HERE",
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

export { db, ref, set, onValue, push, remove, update };

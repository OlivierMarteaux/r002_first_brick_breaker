import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from '../../secrets/firebaseConfig';
import { getAnalytics } from "firebase/analytics";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Only initialize if API key is present and not a placeholder
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
	const analytics = getAnalytics(app);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.warn("Firebase is not configured. Running in local/guest mode.");
}

export { auth, db, isConfigured };

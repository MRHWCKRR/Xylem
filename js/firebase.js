import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// REPLACE WITH YOUR FIREBASE CONFIG OBJECT
const firebaseConfig = {
  apiKey: "AIzaSyB8oh2A-80TF11GdDshqNaVIGZ_e9_DwGg",
  authDomain: "xi-app-xylem.firebaseapp.com",
  projectId: "xi-app-xylem",
  storageBucket: "xi-app-xylem.firebasestorage.app",
  messagingSenderId: "227122890187",
  appId: "1:227122890187:web:7e3c5388401ed18842224e",
  measurementId: "G-WDPKQ6MG19"
};


let auth = null;
let isFirebaseConfigured = false;

// Check if valid credentials are present
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    isFirebaseConfigured = true;
}

export function subscribeToAuth(onUserAuthenticated, onUserUnauthenticated) {
    if (!isFirebaseConfigured) {
        // Fallback for offline/demo testing
        const demoSession = localStorage.getItem('xylem_demo_session');
        if (demoSession === 'active') onUserAuthenticated({ email: 'demo@xylem.io' });
        else onUserUnauthenticated();
        return;
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            onUserAuthenticated(user);
        } else {
            onUserUnauthenticated();
        }
    });
}

export async function loginWithEmail(email, password) {
    if (!isFirebaseConfigured) {
        localStorage.setItem('xylem_demo_session', 'active');
        return { user: { email } };
    }
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
    if (!isFirebaseConfigured) {
        localStorage.setItem('xylem_demo_session', 'active');
        return { user: { email: 'google.user@xylem.io' } };
    }
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
}

export async function logoutUser() {
    if (!isFirebaseConfigured) {
        localStorage.removeItem('xylem_demo_session');
        return;
    }
    await signOut(auth);
}
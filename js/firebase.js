import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    setPersistence,
    browserLocalPersistence,
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let auth = null;
let isFirebaseConfigured = false;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Explicitly enforce persistent local storage
    setPersistence(auth, browserLocalPersistence);
    isFirebaseConfigured = true;
}

export function subscribeToAuth(onUserAuthenticated, onUserUnauthenticated) {
    if (!isFirebaseConfigured) {
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

// Smart login: tries signing in; if user doesn't exist, creates an account automatically
export async function loginOrSignUpWithEmail(email, password) {
    if (!isFirebaseConfigured) {
        localStorage.setItem('xylem_demo_session', 'active');
        return { user: { email } };
    }
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            return await createUserWithEmailAndPassword(auth, email, password);
        }
        throw error;
    }
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
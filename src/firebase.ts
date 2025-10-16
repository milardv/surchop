import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyBuB1qo6t7mfdBPVkSKS04reB4nCDJzGeE',
    authDomain: 'surchop-9d786.firebaseapp.com',
    projectId: 'surchop-9d786',
    storageBucket: 'surchop-9d786.firebasestorage.app',
    messagingSenderId: '584554467419',
    appId: '1:584554467419:web:7237cbf2bf4a9f761e2f7e',
    measurementId: 'G-QBMK24EM00',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

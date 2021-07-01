// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import firebase from "firebase";
import { createContext } from 'react';

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCNkh78_LUDPnJr84J0ZvSGO1W8Owzfit0",
    authDomain: "social-sdk-237d6.firebaseapp.com",
    projectId: "social-sdk-237d6",
    storageBucket: "social-sdk-237d6.appspot.com",
    messagingSenderId: "304362529745",
    appId: "1:304362529745:web:d86f75eda6b47f1df6f6f0",
    measurementId: "G-KTFCCF4LQN"
})

const FirebaseContext = createContext(null);
const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage, FirebaseContext } ;
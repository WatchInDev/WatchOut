import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyB50LAcWpXb9WwTF9sHM4J3u2IJMa8Jw6Q",

  authDomain: "watchout-fcf26.firebaseapp.com",

  projectId: "watchout-fcf26",

  storageBucket: "watchout-fcf26.firebasestorage.app",

  messagingSenderId: "850244426289",

  appId: "1:850244426289:web:c77098b973e4862e8ad310",

  measurementId: "G-GTJQTB4Q05"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
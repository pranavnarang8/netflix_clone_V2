import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDfgHyUt9Uv9w2cXqSmFwH_Jbv0CFIwio",
  authDomain: "netflix-clone2-c1b9c.firebaseapp.com",
  projectId: "netflix-clone2-c1b9c",
  storageBucket: "netflix-clone2-c1b9c.appspot.com",
  messagingSenderId: "1088179091073",
  appId: "1:1088179091073:web:59bba5f734a7c9d2503f80",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();

export { auth };
export default db;

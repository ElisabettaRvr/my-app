// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcB9uCNq944JG9rv2e1DTOiffXL-fF4RU",
  authDomain: "mymovie-app-f55c2.firebaseapp.com",
  projectId: "mymovie-app-f55c2",
  storageBucket: "mymovie-app-f55c2.firebasestorage.app",
  messagingSenderId: "343301624790",
  appId: "1:343301624790:web:4cf52b63fda44b21830a77"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default {
  db,
  isAuthenticated() {
    // controllo se utente salveto in localStorage (nel browser), restituisce true se c'è, false altrimenti
    return !!localStorage.getItem("login");
  },

  // salvare ed eliminare utente dal localStorage (nel browser)
  getUser() {
    return localStorage.getItem("login");
  },
  setUser(username) {
    localStorage.setItem("login", username);
  },
  logout() {
    localStorage.removeItem("login");
  },

  // cerca utente su Firebase nella collection 'utenti', controlla la pw e restituisce l'username
  async verificaLogin(username, password) {
    const docRef = await getDoc(doc(db, "utenti", username));
    if (!docRef.exists()) throw new Error("Username non trovato");
    if (docRef.data().password !== password) throw new Error("Password errata");
    return username;
  },

  // salva nuova recensione su Firebase nella collection 'recensioni'
  async addRecensione(movieId, movieTitle, testo, voto) {
    const username = this.getUser();
    await addDoc(collection(db, "recensioni"), {
      movieId: String(movieId),
      movieTitle,
      username,
      testo,
      voto: Number(voto),
      data: new Date().toISOString()
    });
  },

  // cerca recensioni su Firebase nella collection 'recensioni' per un certo movieId
  // restituisce array di recensioni ordinate per data (dalla più recente alla più vecchia)
  async getRecensioni(movieId) {
    const q = query(
      collection(db, "recensioni"),
      where("movieId", "==", String(movieId)),
      orderBy("data", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

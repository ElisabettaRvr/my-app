import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, addDoc, query, where, getDocs, orderBy, deleteDoc } from "firebase/firestore";

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
    return !!localStorage.getItem("login");
  },
  getUser() {
    return localStorage.getItem("login");
  },
  setUser(username) {
    localStorage.setItem("login", username);
  },
  logout() {
    localStorage.removeItem("login");
  },
  async verificaLogin(username, password) {
    const docRef = await getDoc(doc(db, "utenti", username));
    if (!docRef.exists()) throw new Error("Username non trovato");
    if (docRef.data().password !== password) throw new Error("Password errata");
    return username;
  },

  // RECENSIONI
  async addRecensione(movieId, movieTitle, testo, voto, poster_path) {
    const username = this.getUser();
    await addDoc(collection(db, "recensioni"), {
      movieId: String(movieId),
      movieTitle,
      username,
      testo,
      voto: Number(voto),
      poster_path: poster_path || '',
      data: new Date().toISOString()
    });
  },
  async getRecensioni(movieId) {
    const q = query(
      collection(db, "recensioni"),
      where("movieId", "==", String(movieId)),
      orderBy("data", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async getRecensioniUtente(username) {
    const q = query(
      collection(db, "recensioni"),
      where("username", "==", username),
      orderBy("data", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // PREFERITI
  async addPreferito(movieId, movieTitle, poster_path) {
    const username = this.getUser();
    await addDoc(collection(db, "preferiti"), {
      movieId: String(movieId),
      movieTitle,
      poster_path,
      username,
      data: new Date().toISOString()
    });
  },
  async removePreferito(movieId) {
    const username = this.getUser();
    const q = query(
      collection(db, "preferiti"),
      where("movieId", "==", String(movieId)),
      where("username", "==", username)
    );
    const snapshot = await getDocs(q);
    for (const d of snapshot.docs) {
      await deleteDoc(doc(db, "preferiti", d.id));
    }
  },
  async isPreferito(movieId) {
    const username = this.getUser();
    const q = query(
      collection(db, "preferiti"),
      where("movieId", "==", String(movieId)),
      where("username", "==", username)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },
  async getPreferiti(username) {
    const q = query(
      collection(db, "preferiti"),
      where("username", "==", username),
      orderBy("data", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};
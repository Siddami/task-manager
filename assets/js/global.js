import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  doc,
  setDoc,
} from "./firebase.js";

export function navigateTo(url) {
  window.location.href = url;
}

export async function login(email, password){
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(fullName, email, password){
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, "users", userCredential.user.uid), {
      fullName,
      email,
      createdAt: Date.now(),      
    });
    return userCredential;
}
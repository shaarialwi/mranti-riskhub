/* Use only when a real Firebase config is supplied in firebase-config.js. */
import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import {getFirestore,collection,doc,getDoc,getDocs,setDoc,updateDoc,query,where} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
export async function initialize(config){
 const app=initializeApp(config); const auth=getAuth(app);const db=getFirestore(app);
 return {
  async currentUser(){return new Promise(resolve=>{const off=onAuthStateChanged(auth,u=>{off();resolve(u);},()=>{off();resolve(null);});});},
  async signIn(){const provider=new GoogleAuthProvider();provider.setCustomParameters({hd:'mranti.my',prompt:'select_account'});return signInWithPopup(auth,provider);},
  async signOut(){return signOut(auth);},
  async role(uid){const snap=await getDoc(doc(db,'roles',uid));return snap.exists()&&snap.data().role==='reviewer'?'reviewer':'staff';},
  async list(){const u=auth.currentUser;if(!u)return [];const rs=await getDoc(doc(db,'roles',u.uid));const isReviewer=rs.exists()&&rs.data().role==='reviewer';const source=isReviewer?collection(db,'risks'):query(collection(db,'risks'),where('ownerUid','==',u.uid));const snaps=await getDocs(source);return snaps.docs.map(x=>x.data());},
  async save(r){const ref=doc(db,'risks',r.id);const existing=await getDoc(ref);if(existing.exists())await updateDoc(ref,r);else await setDoc(ref,r);}
 };
}

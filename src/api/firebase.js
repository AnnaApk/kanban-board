import { initializeApp } from "firebase/app";
import { getDatabase, push, ref, get, child, remove, update} from "firebase/database";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  databaseURL: 'https://kanban-brd-default-rtdb.firebaseio.com/',
  apiKey: "AIzaSyAnbTHf5pbc8du7zHhnGPSkLkVLFcgWSlA",
  authDomain: "kanban-brd.firebaseapp.com",
  projectId: "kanban-brd",
  storageBucket: "kanban-brd.appspot.com",
  messagingSenderId: "42814942618",
  appId: "1:42814942618:web:f44f4b8a8d5be72e679e23"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const dbRef = ref(getDatabase());

function creatUser({email, password}) {
  return createUserWithEmailAndPassword(auth, email, password)
}

function logInUser({email, password}) {
  return signInWithEmailAndPassword(auth, email, password)
}

function signOutUser() {
  return signOut(auth)
}

async function getData({userID, category}) {
  return await get(child(dbRef, `users/${userID}/${category}/`))
}

function addNewColumn({userID, column}) {
  return push(ref(db, `users/${userID}/columns/`), { /// push for lists && set fot other cases
    column,
  })
}
function deleteColumn({userID, id}) {
  return remove(ref(db, `users/${userID}/columns/${id}`))
}
function updateColumn({userID,id, column}) {
  return update(ref(db, `users/${userID}/columns/${id}`), {
    column,
  })
}

function addNewTask({userID, task='task', columnID}) {
  return push(ref(db, `users/${userID}/tasks/`), {
    task: task,
    columnID: columnID,
  })
}
function deleteTask({userID, id}) {
  return remove(ref(db, `users/${userID}/tasks/${id}`))
}
function updateTaskDB({userID, taskID, task, columnID}) {
  return update(ref(db, `users/${userID}/tasks/${taskID}`), { 
    task: task,
    columnID: columnID,
  })
}

export {
  db,
  auth,
  creatUser,
  logInUser,
  signOutUser,
  getData,
  addNewColumn,
  deleteColumn,
  updateColumn,
  addNewTask,
  deleteTask,
  updateTaskDB
};

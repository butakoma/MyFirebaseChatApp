'use strict';

const config = {
  apiKey: "<My API Key>",
  authDomain: "<My Project Id>.firebaseapp.com",
  databaseURL: "<My Firebase Database URL>",
  projectId: "<My Project Id>",
  storageBucket: "<My Project Id>.appspot.com",
  messagingSenderId: "<My Message Sender Id>"
};

firebase.initializeApp(config);

const db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true
});
const collection = db.collection('messages');

const auth = firebase.auth();
let myUser = null;

const message = document.getElementById('message');
const form = document.querySelector('form');
const messages = document.getElementById('messages');
const login = document.getElementById('login');
const logout = document.getElementById('logout');

login.addEventListener('click', () => {
  auth.signInAnonymously();
});

logout.addEventListener('click', () => {
  auth.signOut();
});

auth.onAuthStateChanged(user => {
  if(user){
    myUser = user;

    messages.innerHTML = '';

    collection.orderBy('created').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if(change.type === 'added'){
          const li = document.createElement("li");
          const docData = change.doc.data();
          li.textContent = docData.uid + ':' + docData.message;
          messages.appendChild(li);        
        }
      });
    }, error => {});
    
    console.log("login");
    login.classList.add('hidden');
    
    logout.classList.remove('hidden');
    form.classList.remove('hidden');
    messages.classList.remove('hidden');
    message.focus();
    return;    
  }
  console.log('No Login');
  myUser = null;
  login.classList.remove('hidden');

  logout.classList.add('hidden');
  form.classList.add('hidden');
  messages.classList.add('hidden');

})


form.addEventListener('submit', e => {
  e.preventDefault();

  const val = message.value.trim();
  if(val === ''){
    return;
  }

  message.value = '';
  message.focus();

  collection.add({
    message: val,
    created: firebase.firestore.FieldValue.serverTimestamp(),
    uid: myUser ? myUser.uid : 'nobody'
  })
  .then(doc => {
    console.log(`${doc.id} added!`);
  })
  .catch(error => {
    console.log(error);
  });

});

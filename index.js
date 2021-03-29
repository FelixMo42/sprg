let current = {
    user: null,
    chat: null, 
};

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

async function show_messages(messages) {
    let root = document.getElementById("main-pane-mesgs")
    removeAllChildNodes(root)
    prev_mesg_user = null

    messages.onSnapshot(async (snap) => {
        for (let change of snap.docChanges()) {
            if (change.type === "added") {
                let data = change.doc.data();

                if (prev_mesg_user != data.user.path) {
                    let user_elm = document.createElement("div");
                    user_elm.classList.add("mesg-user");
                    root.appendChild(user_elm);
                    user_elm.innerHTML = (await data.user.get()).data().name;
                    prev_mesg_user = data.user.path;
                }

                let text_elm = document.createElement("div");
                text_elm.classList.add("mesg-text")
                root.appendChild(text_elm);
                text_elm.innerHTML = data.text;
            }
        }
    })
}

async function post() {
    if (!current.chat) return

    let textarea = document.getElementById("main-pane-textarea");

    current.chat.add({
        text: textarea.value,
        user: current.user,
        time: firebase.firestore.FieldValue.serverTimestamp(),
    })

    textarea.value = "";
}

async function main(user) {
    for (let chat of user.chats) {
        let node = document.createElement("div")
        document.getElementById("side-pane-chats").appendChild(node)

        node.onclick = async () => {
            current.chat = chat.collection("messages")
            let messages = chat.collection("messages").orderBy("time")
            show_messages(messages)
        }

        chat.get().then(chat => {
            node.innerHTML = chat.data().name
        })
    }
}

async function init() {
    firebase.initializeApp({
        apiKey: "AIzaSyAWezNsncW_DmKaFLUx87NeFHiq8D4C9Ro",
        authDomain: "sprg-a9e1f.firebaseapp.com",
        projectId: "sprg-a9e1f",
    })
}

function login() {
    let provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider)
}

init()
firebase.auth().onAuthStateChanged(async auth => {
    if (auth) { 
        let store = firebase.firestore()
        let users = store.collection("users")
        current.user = users.doc(auth.uid)
        let user = await users.doc(auth.uid).get()

        if ( user.exists ) {
            main(user.data())
        } else {
            let chats = store.collection("chats")
            let chat = await chats.add({
                name: "Character Creation",
            })
            let messages = chat.collection("messages");

            await messages.add({
                text: "In the year 2092 world peace was finally achieved with the founding of the Democratic Erthan Alliance  and the end of world war 3.  Despite a mostly nuclear free war the climate effects were too great and scientists predicted the earth would become totally inhabitable within the next 100 years.  In a desperate bid for human survival, many organizations helped fund expeditions to create colonies on other planets.",
                time: firebase.firestore.FieldValue.serverTimestamp(),
                user: users.doc("Ll8pUb0U5TTCwmU0hIuL1s8QJx72"),
            })
            await messages.add({
                text: "It is now the year 2112.  You have been selected to embark on the sprg-413, a massive ship destined for a distant planet where a small presence has already been established. You will be cryogenically frozen, but may be awakened if your assistance is needed along the journey.",
                time: firebase.firestore.FieldValue.serverTimestamp(),
                user: users.doc("Ll8pUb0U5TTCwmU0hIuL1s8QJx72"),
            })
            await messages.add({
                text: "Who are you? Why were you invited? What's your name? Your favorite animal?",
                time: firebase.firestore.FieldValue.serverTimestamp(),
                user: users.doc("Ll8pUb0U5TTCwmU0hIuL1s8QJx72"),
            })
            
            await users.doc(auth.uid).set({
                name: "Unnamed user",
                chats: [chat],
            })

            main((await users.doc(auth.uid).get()).data())
        }
    }
})

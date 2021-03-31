function god_mode(user) {
    store.collection("chats").onSnapshot(async event => {
        for (let change of event.docChanges()) {
            if (change.type === "added") {
                new Chat(user, change.doc)
            }
        }
    })
}

async function usr_mode(user) {
    for (let chat of user.data().chats) {
        new Chat(user, await chat.get())
    }
}

async function init_user(user) {
    let chats = store.collection("chats")
    let chat = await chats.add({
        name: "Character Creation",
    })
    let messages = chat.collection("messages");
    await messages.add({
        text: "In the year 2092 world peace was finally achieved with the founding of the Democratic Erthan Alliance and the end of world war 3. Despite a mostly nuclear free war the climate effects were too great and scientists predicted the earth would become totally inhabitable within the next 100 years. In a desperate bid for human survival, many organizations helped fund expeditions to create colonies on other planets.",
        time: firebase.firestore.FieldValue.serverTimestamp(),
        user: users.doc("Ll8pUb0U5TTCwmU0hIuL1s8QJx72"),
    })
    await messages.add({
        text: "It is now the year 2103. You have been selected to embark on the sprg-413, a massive ship destined for a distant planet where a small presence has already been established. You will be cryogenically frozen, but may be awakened if your assistance is needed along the journey.",
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
    usr_mode((await users.doc(auth.uid).get()).data())
}

function main(mode) {
    let store = init()
    firebase.auth().onAuthStateChanged(async auth => {
        if (auth) { 
            let user = await store.collection("users").doc(auth.uid).get()
            if (user.exists) {
                mode(user)
            } else {
                init_user(auth)
            }
        }
    })
}

main(usr_mode)

let current_chat = null;

function create_node(parent, type, value) {
    let child = document.createElement("div")
    child.classList.add(type)
    child.innerHTML = value
    parent.appendChild(child)
    return child
}

function set_children(parent, children) {
    while (parent.firstChild) parent.removeChild(parent.firstChild)
    for (let child of children) parent.appendChild(child)
}

class Chat {
    constructor(user, chat) {
        this.user = user
        this.data = chat.data()

        // messages
        this.messages = chat.ref.collection("messages")
        
        let prev_mesg_user = null
        this.messages_node = document.createElement("div")
        this.messages.orderBy("time").onSnapshot(async snap => {
            for (let change of snap.docChanges()) {
                if (change.type === "added") {
                    let data = change.doc.data()

                    if (prev_mesg_user != data.user.id) {
                        let node = create_node(this.messages_node, "mesg-user", "")
                        data.user.get().then(user => {
                            node.innerHTML = user.data().name;
                            scroll_down()
                        })
                        prev_mesg_user = data.user.id;
                    }
                    
                    create_node(this.messages_node, "mesg-text", data.text);

                    if ( data.user.id == this.user.id ) {
                        this.label_node.classList.remove("unread")
                    } else {
                        this.label_node.classList.add("unread")
                    }
                }
            }

            scroll_down()
        })


        // create label
        this.label_node = create_node(
            document.getElementById("side-pane-chats"),
            "chat",
            this.data.name
        )
        this.label_node.onclick = () => this.show() 
    }

    show() {
        current_chat = this;

        this.label_node.classList.remove("unread")
        let node = document.getElementById("main-pane-mesgs")
        set_children(document.getElementById("main-pane-mesgs"), [this.messages_node])
        scroll_down()
    }

    send(user) {
        let textarea = document.getElementById("main-pane-textarea");
        this.post(textarea.value, user)
        textarea.value = ""
    }

    post(text, user=this.user) {
        if (text != "") {
            this.messages.add({
                text: text,
                user: user.ref,
                time: firebase.firestore.FieldValue.serverTimestamp(),
            })
        }
    }
}

function scroll_down() {
    let node = document.getElementById("main-pane-mesgs")
    node.scrollTop = node.scrollHeight + 1000
}

function init() {
    firebase.initializeApp({
        apiKey: "AIzaSyAWezNsncW_DmKaFLUx87NeFHiq8D4C9Ro",
        authDomain: "sprg-a9e1f.firebaseapp.com",
        projectId: "sprg-a9e1f",
    })
    
    return firebase.firestore()
}

function create_chat() {
}

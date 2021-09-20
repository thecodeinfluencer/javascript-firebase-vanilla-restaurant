const errDiv = document.getElementById('err')
const loadWrapper = document.getElementById('loadWrapper')
const emptyWrapper = document.getElementById('emptyWrapper')


const signin = (email, password) => {
    firebaseApp
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(res => {
            firebaseApp
                .database()
                .ref(`users/${res.user.uid}`)
                .on('value', data => {
                    let user = data.val();
                    user && localStorage.setItem('abcuser', JSON.stringify(user))
                });

            if (errDiv) { errDiv.innerHTML = '' }
        })
        .catch(err => {
            console.warn(err.message);
            if (errDiv) { errDiv.innerHTML = err.message }
        })
}

const signup = (email, password, name) => {
    firebaseApp
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(res => {
            firebaseApp
                .auth()
                .signInWithEmailAndPassword(email, password)
                .then(res => {
                    firebaseApp
                        .database()
                        .ref(`users/${res.user.uid}`)
                        .set({
                            email,
                            name,
                            id: res.user.uid,
                        })
                        .then(() => {
                            firebaseApp
                                .database()
                                .ref(`users/${res.user.uid}`)
                                .on('value', data => {
                                    let user = {...data.val(), id: res.user.uid };

                                    user && localStorage.setItem('abcuser', JSON.stringify(user))
                                });

                        })
                        .catch(err => {
                            console.warn(err);
                        });
                });
        })
        .catch(err => {
            console.warn(err);
        });
};

const loadFoods = () => {
    const homeDisplay = document.getElementById('homeDisplay')
    firebaseApp
        .database()
        .ref(`foods`)
        .on('value', snap => {
            let foods = snap.val() ? Object.values(snap.val()) : [];
            localStorage.setItem('abcfoods', JSON.stringify(foods))

            foods.map(({ desc, id, imageURL, name, price }) => homeDisplay.insertAdjacentHTML('beforeend', foodCard(desc, id, imageURL, name, price)))

            loadWrapper.style.display = 'none'
        })
};

const loadOrders = () => {
    console.log(emptyWrapper)

    firebaseApp
        .database()
        .ref(`orders`)
        .on('value', snap => {
            let orders = snap.val() ? Object.values(snap.val()) : [];
            localStorage.setItem('abcorders', JSON.stringify(orders))

            const orderDisplay = document.getElementById('orderDisplay')

            orders.filter(({ userID }) => userID == firebaseApp.auth().currentUser.uid).map(({ product }) => orderDisplay.insertAdjacentHTML('beforeend', orderCard(product.name, product.price, product.imageURL)))

            loadWrapper.style.display = 'none'

            if (orders.filter(({ userID }) => userID == firebaseApp.auth().currentUser.uid).length < 1) { emptyWrapper.style.display = 'block' }

            console.log('comparison1: ', firebaseApp.auth().currentUser.uid)
        });
};

const sendOrder = (product, el) => {
    const id = Date.now()

    firebaseApp.auth().onAuthStateChanged(user => {
        if (user) {
            firebaseApp
                .database()
                .ref(`orders/${id}`)
                .set({
                    id,
                    product,
                    userID: user.uid
                })

            el.setAttribute('disabled', true)
            el.innerHTML = 'Sent'
        } else {
            alert('you arent logged in')
        }
    })
}

const signout = () => {
    firebaseApp.auth().signOut()
    window.location = window.location
}
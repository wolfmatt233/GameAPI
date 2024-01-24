import Swal from "sweetalert2";
import { auth, db } from "../credentials";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

//Modal popup to log in, calls "login()" on confirmation
export function loginModal() {
  $("#login-btn").on("click", () => {
    Swal.fire({
      title: "Sign In",
      background: "#555a68",
      color: `#e9e3e3`,
      confirmButtonText: "Sign In",
      confirmButtonColor: "#04724D",
      html: `
          <input type="text" id="emailLogin" class="swal2-input" placeholder="Email">
          <input type="password" id="passwordLogin" class="swal2-input" placeholder="Password">
        `,
      preConfirm: () => {
        let email = $("#emailLogin").val();
        let password = $("#passwordLogin").val();
        if (!email || !password) {
          Swal.showValidationMessage(`Ensure fields are completed`);
        }
        login(email, password);
      },
    });
  });
}

//Modal popup for sign up, calls "signUp()" on confirmation
export function signUpModal() {
  $(".signup-btn").on("click", () => {
    console.log("clicked sign up")
    Swal.fire({
      title: "Sign Up",
      background: "#555a68",
      color: `#e9e3e3`,
      confirmButtonText: "Sign Up",
      confirmButtonColor: "#04724D",
      html: `
            <input type="text" id="emailSignUp" class="swal2-input" placeholder="Email"> 
            <input type="text" id="usernameSignUp" class="swal2-input" placeholder="Username">
            <input type="password" id="passwordSignUp" class="swal2-input" placeholder="Password">
            <input type="password" id="passwordSignUp2" class="swal2-input" placeholder="Enter password again">
        `,
      preConfirm: () => {
        let email = $("#emailSignUp").val();
        let username = $("#usernameSignUp").val();
        let password = $("#passwordSignUp").val();
        let password2 = $("#passwordSignUp2").val();
        if (!username || !password || !email) {
          Swal.showValidationMessage(`Ensure fields are completed`);
        } else if (username.length <= 5 || email.length <= 5) {
          Swal.showValidationMessage(
            `Username and email must contain more than 5 characters`
          );
        } else if (password !== password2) {
          Swal.showValidationMessage(`Passwords must match`);
        } else {
          signUp(auth, email, username, password);
        }
      },
    });
  });
}

//logs user in through firebase
function login(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
    })
    .catch((error) => {
      //implement error message modal
      console.log(error.message);
    });
}

//logs current user out through firebase
export function logOut() {
  signOut(auth)
    .then(() => {
      console.log("Logged Out");
    })
    .catch((error) => {
      console.log(error.message);
    });
}

//creates new email user in firebase
async function signUp(auth, email, username, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      let userObj = {
        bio: "",
        favorites: [],
        lists: [],
        played: [],
        reviews: [],
        topfive: [],
        toplay: [],
        uid: user.uid,
      };

      updateProfile(user, {
        displayName: username,
      });
      $("#nav-user span").html(`${username}`);

      createUserDoc(user, userObj);
    })
    .catch((error) => {
      console.log(error.message);
    });
}

//creates the document relating to the new user in firestore db
async function createUserDoc(user, userObj) {
  try {
    await setDoc(doc(db, "GameDB", user.uid), userObj);
  } catch (error) {
    console.log(error.message);
  }
}

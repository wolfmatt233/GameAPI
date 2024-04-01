/*
  author: Matthew Wolf
  file: login-out.js
  purpose: holds functions for logging in/out and signing up
*/

import Swal from "sweetalert2";
import { auth, db } from "../credentials";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  setDoc,
  doc,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import { FeedbackMessage } from "../model";

//Nav buttons
export function loggedInButtons(user) {
  if (user !== null) {
    $(".nav-container").empty().append(`
    <a href="#browse?page=1" class="nav-link">Browse</a>
    <a id="nav-user" href="#user?user=${auth.currentUser.displayName}" class="nav-link">
      <span>${user.displayName}</span>
      <i class="fa-solid fa-user"></i>
    </a>
    <button id="logout-btn" class="nav-link">
      Log Out
      <i class="fa-solid fa-arrow-right-from-bracket"></i>
    </button>
  `);
  } else {
    $(".nav-container").empty().append(`
      <a href="#browse?page=1" class="nav-link">Browse</a>
      <button id="login-btn" class="nav-link">Log In</button>
      <button class="signup-btn nav-link">Create Account</button>
    `);
  }
}

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
          <input type="email" id="emailLogin" class="swal2-input" placeholder="Email">
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
      preConfirm: async () => {
        let email = $("#emailSignUp").val();
        let username = $("#usernameSignUp").val();
        let password = $("#passwordSignUp").val();
        let password2 = $("#passwordSignUp2").val();
        let usernameUsed = false;
        let q = query(
          collection(db, "GameDB"),
          where("username", "==", username)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(() => {
          usernameUsed = true;
        });

        if (!username || !password || !email) {
          Swal.showValidationMessage(`Ensure fields are completed`);
        } else if (username.length <= 5 || email.length <= 5) {
          Swal.showValidationMessage(
            `Username and email must contain more than 5 characters`
          );
        } else if (password !== password2) {
          Swal.showValidationMessage(`Passwords must match`);
        } else if (usernameUsed === true) {
          Swal.showValidationMessage(`Username already in use`);
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
    .then(() => {
      FeedbackMessage("success", "Success", "Logged in!");
    })
    .catch((error) => {
      FeedbackMessage("error", "Error", error.message);
    });
}

//logs current user out through firebase
export function logOut() {
  signOut(auth)
    .then(() => {
      FeedbackMessage("success", "Success", "Logged out.");
    })
    .catch((error) => {
      FeedbackMessage("error", "Error", error.message);
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
        played: [],
        reviews: [],
        topfive: [],
        toplay: [],
        privacy: {
          favorites: "public",
          played: "public",
          toplay: "public",
        },
        uid: user.uid,
        username: username,
      };

      updateProfile(user, {
        displayName: username,
      });

      $("#nav-user span").html(`${username}`);

      createUserDoc(user, userObj);
    })
    .catch((error) => {
      FeedbackMessage("error", "Error", error.message);
    });
}

//creates the document relating to the new user in firestore db
async function createUserDoc(user, userObj) {
  try {
    await setDoc(doc(db, "GameDB", user.uid), userObj).then(() => {
      FeedbackMessage("success", "Success", "Account created!");
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

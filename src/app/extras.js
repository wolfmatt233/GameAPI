import Swal from "sweetalert2";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "./credentials";
import { profanity } from "@2toad/profanity";

const Toast = Swal.mixin({
  toast: true,
  color: "#fff",
  background: "#555a68",
  position: "bottom",
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export function FeedbackMessage(icon, title, message) {
  Toast.fire({
    icon: icon,
    title: title,
    text: message,
  });
}

export function LoadingMessage() {
  Swal.fire({
    title: "",
    allowOutsideClick: false,
    allowEscapeKey: false,
    background: "#555a68",
    color: "#fff",
    html: `
      <h3 id="loadingTitle">Loading...</h3>
      <p>Taking too long? <a href="#home">Go Home!</a></p>
    `,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

export function CloseLoading() {
  Swal.close();
}

export async function getAllDocs() {
  return await getDocs(collection(db, "GameDB"));
}

export async function getUserDoc() {
  return await getDoc(doc(db, "GameDB", auth.currentUser.uid));
}

export function checkProfanity(array) {
  array.forEach((string) => {
    return profanity.exists(string);
  });
}

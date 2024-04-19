/*
  author: Matthew Wolf
  file: user-editing.js
  purpose: holds functions for editing user info like bio, picture, password, and deleting your account
*/

import {
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { auth, db } from "../credentials";
import { FeedbackMessage } from "../extras";

export function editInfoListener(username, bio) {
  $("#edit-info-btn").on("click", () => {
    Swal.fire({
      title: "Edit Your Profile",
      background: "#555a68",
      color: `#e9e3e3`,
      confirmButtonText: "Confirm",
      confirmButtonColor: "#04724D",
      html: `
        <input type="text" id="uName" class="swal2-input" placeholder="Username" value="${username}">
        <textarea type="text" id="uBio" class="swal2-textarea" placeholder="Bio">${bio}</textarea>
        `,
      preConfirm: () => {
        let uName = $("#uName").val();
        let uBio = $("#uBio").val();
        if (!uName || !uBio) {
          Swal.showValidationMessage(`Ensure fields are completed`);
        } else {
          updateInfo(uName, uBio);
        }
      },
    });
  });

  $("#user-img-container").on("click", () => {
    let photoUrl = auth.currentUser.photoURL;
    if (photoUrl == null) {
      photoUrl = "";
    }

    Swal.fire({
      title: "Edit Your Profile Picture",
      background: "#555a68",
      color: `#e9e3e3`,
      confirmButtonText: "Confirm",
      confirmButtonColor: "#04724D",
      html: `
        <input type="text" id="photoURL" class="swal2-input" placeholder="Photo URL" value="${photoUrl}">
        `,
      preConfirm: () => {
        photoUrl = $("#photoURL").val();

        const isValidUrl = () => {
          if (photoUrl == "") {
            return 200;
          } else {
            let http = new XMLHttpRequest();

            http.open("HEAD", photoUrl, false);
            try {
              http.send();
              return http.status;
            } catch (error) {
              Swal.showValidationMessage(`Not a valid URL.`);
            }
          }
        };

        if (isValidUrl() == 200) {
          updatePicture(photoUrl);
        }
      },
    });
  });

  $(".addUserTopFive").on("click", () => {
    $(".tooltip").css("opacity", "100");
    $(".tooltip").css("visibility", "visible");
    $("#searchBar").focus();
  });

  $(".tooltip").on("mouseover", () => {
    $(".tooltip").css("opacity", "0");
    $(".tooltip").css("visibility", "hidden");
  });
}

async function updateInfo(uName, uBio) {
  try {
    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      bio: uBio,
      username: uName,
    }).then(() => {
      updateProfile(auth.currentUser, {
        displayName: uName,
      }).then(() => {
        $("#nav-user span, #user-info-name").html(`${uName}`);
        $("#user-info-bio").html(`${uBio}`);
        FeedbackMessage("success", "Success", "Info updated!");
      });
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

async function updatePicture(url) {
  try {
    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      photoURL: url,
    }).then(() => {
      updateProfile(auth.currentUser, {
        photoURL: url,
      }).then(() => {
        if (url == "") {
          $("#user-img").attr("src", "./assets/user.png");
        } else {
          $("#user-img").attr("src", url);
        }
        FeedbackMessage("success", "Success", "Photo updated!");
      });
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

export function deletePrompt() {
  Swal.fire({
    title: "Delete Your Account?",
    background: "#555a68",
    color: `#e9e3e3`,
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "#e15554",
    cancelButtonText: "Cancel",
    cancelButtonColor: "#04724D",
    preConfirm: () => {
      Swal.fire({
        title: "Sign In Again To Confirm",
        background: "#555a68",
        color: `#e9e3e3`,
        confirmButtonText: "Delete account",
        confirmButtonColor: "#e15554",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        cancelButtonColor: "#04724D",
        html: `
                <input type="text" id="emailLogin" class="swal2-input" placeholder="Email">
                <input type="password" id="passwordLogin" class="swal2-input" placeholder="Password">
              `,
        preConfirm: () => {
          let user = auth.currentUser;
          let email = $("#emailLogin").val();
          let password = $("#passwordLogin").val();

          if (!email || !password) {
            Swal.showValidationMessage(`Ensure fields are completed`);
          } else {
            let credential = EmailAuthProvider.credential(email, password);
            let uid = user.uid;

            reauthenticateWithCredential(user, credential)
              .then(() => {
                deleteUser(user).then(async () => {
                  await deleteDoc(doc(db, "GameDB", uid))
                    .then(() => {
                      FeedbackMessage("success", "Success", "Account deleted.");
                    })
                    .catch((error) => {
                      FeedbackMessage("error", "Error", error.message);
                    });
                  location.hash = "home";
                });
              })
              .catch((error) => {
                FeedbackMessage("error", "Error", error.message);
              });
          }
        },
      });
    },
  });
}

export function changePasswordPrompt() {
  Swal.fire({
    title: "Sign In With Old Password",
    background: "#555a68",
    color: `#e9e3e3`,
    confirmButtonText: "Change Password",
    confirmButtonColor: "#04724D",
    showCancelButton: true,
    cancelButtonText: "Cancel",
    cancelButtonColor: "#e15554",
    html: `
      <input type="text" id="emailLogin" class="swal2-input" placeholder="Email">
      <input type="password" id="passwordLogin" class="swal2-input" placeholder="Password">
    `,
    preConfirm: () => {
      let email = $("#emailLogin").val();
      let password = $("#passwordLogin").val();

      if (!email || !password) {
        Swal.showValidationMessage(`Ensure fields are completed`);
      } else {
        let credential = EmailAuthProvider.credential(email, password);

        Swal.fire({
          title: "Change Your Password",
          background: "#555a68",
          color: `#e9e3e3`,
          showCancelButton: true,
          confirmButtonText: "Confirm",
          confirmButtonColor: "#e15554",
          cancelButtonText: "Cancel",
          cancelButtonColor: "#04724D",
          html: `
            <input type="password" id="newPassword" class="swal2-input" placeholder="New Password">
          `,
          preConfirm: () => {
            let user = auth.currentUser;
            let newPassword = $("#newPassword").val();

            if (!newPassword) {
              Swal.showValidationMessage(`Ensure fields are completed`);
            } else {
              reauthenticateWithCredential(user, credential).then(() => {
                updatePassword(user, newPassword)
                  .then(() => {
                    FeedbackMessage("success", "Success", "Password updated!");
                  })
                  .catch((error) => {
                    FeedbackMessage("error", "Error", error.message);
                  });
              });
            }
          },
        });
      }
    },
  });
}

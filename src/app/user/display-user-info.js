import {
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { auth, db, apiKey } from "../credentials";

export function loggedInButtons(user) {
  if (user !== null) {
    $(".nav-container").empty().append(`
    <a href="#browse_1" class="nav-link">Browse</a>
    <a id="nav-user" href="#user-personal" class="nav-link">
      <span>${user.displayName}</span>
      <i class="fa-solid fa-user"></i>
    </a>
    <button id="logout-btn">
      Log Out
      <i class="fa-solid fa-arrow-right-from-bracket"></i>
    </button>
  `);
  } else {
    $(".nav-container").empty().append(`
      <a href="#browse_1" class="nav-link">Browse</a>
      <button id="login-btn">Log In</button>
      <button class="signup-btn">Create Account</button>
    `);
  }
}

function editInfoListener(user, userDoc) {
  $("#edit-info-btn").on("click", () => {
    Swal.fire({
      title: "Edit Your Profile",
      background: "#555a68",
      color: `#e9e3e3`,
      confirmButtonText: "Confirm",
      confirmButtonColor: "#04724D",
      html: `
          <input type="text" id="uName" class="swal2-input" placeholder="Username" value="${user.displayName}">
          <input type="text" id="uBio" class="swal2-input" placeholder="Bio" value="${userDoc.bio}" max="100">
        `,
      preConfirm: () => {
        let uName = $("#uName").val();
        let uBio = $("#uBio").val();
        if (!uName || !uBio) {
          Swal.showValidationMessage(`Ensure fields are completed`);
        } else {
          updateInfo(uName, uBio, db, user);
        }
      },
    });
  });

  $("#user-img-container").on("click", () => {
    let photoUrl = user.photoURL;
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
        updatePicture(photoUrl, user);
      },
    });
  });
}

async function updateInfo(uName, uBio, user) {
  try {
    await updateDoc(doc(db, "GameDB", user.uid), {
      bio: uBio,
    }).then(() => {
      updateProfile(user, {
        displayName: uName,
      }).then(() => {
        $("#nav-user span, #user-info-name").html(`${uName}`);
        $("#user-info-bio").html(`${uBio}`);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function updatePicture(url, user) {
  try {
    updateProfile(user, {
      photoURL: url,
    }).then(() => {
      if (url == "") {
        $("#user-img").attr("src", "./assets/user.png");
      } else {
        $("#user-img").attr("src", url);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

export async function showUserInfo(user) {
  try {
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    userDoc = userDoc.data();

    $("#top-five .grid-row").html("");
    $("#user-content #user-info-name").html(`${user.displayName}`);

    if (user.photoURL == null || user.photoURL == "") {
      $("#user-img").attr("src", "./assets/user.png");
    } else {
      $("#user-img").attr("src", user.photoURL);
    }
    $("#user-info-bio").html(`${userDoc.bio}`); //show bio

    //search api for top five games
    userDoc.topfive.forEach((gameID) => {
      let url = `https://api.rawg.io/api/games/${gameID}?key=${apiKey}`;
      $.getJSON(url, (data) => {
        let year = data.released.split("-");
        $("#top-five .grid-row").append(`
          <a href="#detail_${gameID}" class="user-grid-item">
            <img src="${data.background_image}" alt="image" />
            <div class="item-details">
              <div>
                <p class="details-title">${data.name}</p>
                <p class="details-year">${year[0]}</p>
              </div>
            </div>
          </a>
        `);
      });
    });

    //if top five is not full, replace last few on page with empty containers
    if (userDoc.topfive.length - 5 !== 0) {
      let count = userDoc.topfive.length - 5;
      for (let i = 0; i < count; i++) {
        $("#top-five .grid-row").append(`
          <a class="user-grid-item">
            <img src="./assets/plus.png" alt="" />
            <div class="item-details">
              <div>
                <p class="details-title"></p>
                <p class="details-year"></p>
              </div>
            </div>
          </a>
        `);
      }
    }
    editInfoListener(user, userDoc, db);
  } catch (error) {
    console.log(error.message);
  }
}

export async function showUserItems(user, title) {
  try {
    let accessArray = [];
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    userDoc = userDoc.data();

    $("#user-title").html(title);

    if (title == "Favorites") {
      accessArray = userDoc.favorites;
    } else if (title == "To Play") {
      accessArray = userDoc.toplay;
    } else if (title == "Played") {
      accessArray = userDoc.played;
    }
    accessArray.forEach((gameID) => {
      let url = `https://api.rawg.io/api/games/${gameID}?key=${apiKey}`;

      $.getJSON(url, (data) => {
        let year = data.released.split("-");
        $("#user-content #browse-grid").append(`
          <a href="#detail_${gameID}" class="grid-item">
            <img src="${data.background_image}" alt="image" />
            <div class="item-details">
              <div>
                <p class="details-title">${data.name}</p>
                <p class="details-year">${year[0]}</p>
              </div>
            </div>
          </a>
        `);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
}

export function deletePrompt(user) {
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
          let email = $("#emailLogin").val();
          let password = $("#passwordLogin").val();

          if (!email || !password) {
            Swal.showValidationMessage(`Ensure fields are completed`);
          } else {
            let credential = EmailAuthProvider.credential(email, password);
            let uid = user.uid;

            reauthenticateWithCredential(user, credential).then(() => {
              deleteUser(user).then(async () => {
                console.log("success user"); //toast message here
                try {
                  await deleteDoc(doc(db, "GameDB", uid)).then(() => {
                    console.log("success db");
                  });
                } catch (error) {
                  console.log(error.message);
                }
                location.hash = "home";
              });
            });
          }
        },
      });
    },
  });
}

export function changePasswordPrompt(user) {
  Swal.fire({
    title: "Change Your Password",
    background: "#555a68",
    color: `#e9e3e3`,
    showCancelButton: true,
    confirmButtonText: "Confirm",
    confirmButtonColor: "#04724D",
    cancelButtonText: "Cancel",
    cancelButtonColor: "#e15554",
    html: `
        <input type="password" id="newPassword" class="swal2-input" placeholder="Password">
      `,
    preConfirm: () => {
      let newPassword = $("#newPassword").val();

      if (!newPassword) {
        Swal.showValidationMessage(`Ensure fields are completed`);
      } else {
        Swal.fire({
          title: "Sign In With Old Password",
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
            let email = $("#emailLogin").val();
            let password = $("#passwordLogin").val();

            if (!email || !password) {
              Swal.showValidationMessage(`Ensure fields are completed`);
            } else {
              let credential = EmailAuthProvider.credential(email, password);

              reauthenticateWithCredential(user, credential).then(() => {
                updatePassword(user, newPassword).then(() => {
                  console.log("success user password"); //toast message here
                });
              });
            }
          },
        });
      }
    },
  });
}

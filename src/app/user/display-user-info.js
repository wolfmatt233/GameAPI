/*
  author: Matthew Wolf
  file: display-user-info.js
  purpose: holds functions that display user info like favorites, bio/top-five, reviews, etc.
*/

import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, apiKey } from "../credentials";
import { editInfoListener } from "./user-editing";
import {
  CloseLoading,
  FeedbackMessage,
  LoadingMessage,
  routeUser,
} from "../model";
import { editReviewPrompt, deleteReviewPrompt } from "../api/detail/buttons";
import Swal from "sweetalert2";

//----Finds user----\\

async function findUser() {
  try {
    let queryParams = new URLSearchParams(window.location.hash.split("?")[1]);
    let user = queryParams.get("user");
    let q = query(collection(db, "GameDB"), where("username", "==", user));
    let userDoc;

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      userDoc = doc.data();
    });

    return userDoc;
  } catch (error) {
    console.log(error.message);
  }
}

//----Shows profile pic, username, bio, top 5----\\

export async function showUserInfo() {
  try {
    LoadingMessage();
    const userDoc = await findUser();

    if (!userDoc && auth.currentUser != null) {
      location.hash = `user?user=${auth.currentUser.displayName}`;
    }

    //current user only
    if (auth.currentUser != null && auth.currentUser.uid === userDoc.uid) {
      $("#user-img-container").append(
        `<div id="user-img-hover">Edit<i class="fa-solid fa-pen"></i></div>`
      );

      $("#user-pic-name").append(`
        <button id="edit-info-btn">Edit<i class="fa-solid fa-pen"></i></button>
      `);
      $("#sidebarButtons").append(`
        <button id="user-delete" class="userNavBtn">Delete Account</button>
        <button id="user-password" class="userNavBtn">Change Password</button>
      `);

      $("#user-delete").on("click", () => routeUser("delete"));
      $("#user-password").on("click", () => routeUser("password"));
    }

    let topFive = userDoc.topfive;

    $("#top-five .grid-row").empty();
    $("#user-content #user-info-name").html(`${userDoc.username}`);

    if (user.photoURL == null || user.photoURL == "") {
      $("#user-img").attr("src", "./assets/user.png");
    } else {
      $("#user-img").attr("src", user.photoURL);
    }

    $("#user-info-bio").html(`${userDoc.bio}`); //show bio

    //search api for top five games
    for (const property in topFive) {
      let gameID = userDoc.topfive[property];
      if (gameID !== "") {
        let url = `https://api.rawg.io/api/games/${gameID}?key=${apiKey}`;

        try {
          await fetch(url)
            .then((response) => {
              return response.json();
            })
            .then((data) => {
              let year = data.released.split("-");
              $("#top-five .grid-row").append(`
          <a href="#detail?game=${gameID}" class="user-grid-item" id="order_${property}">
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
        } catch (error) {
          FeedbackMessage("error", "API Error", error.message);
        }
      } else {
        $("#top-five .grid-row").append(`
          <a class="user-grid-item addUserTopFive" id="order_${property}">
            <img src="./assets/plus.png" alt="add" id="addTopFiveImg" />
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

    //current user only
    if (auth.currentUser != null && auth.currentUser.uid === userDoc.uid) {
      editInfoListener(user, userDoc, db);
    }

    CloseLoading();
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

//----Fetches games from api: favs, played, to play----\\

export async function showUserItems(title) {
  try {
    let accessArray = [];
    const userDoc = await findUser();

    $("#user-title").html(title);

    if (auth.currentUser != null && auth.currentUser.uid !== userDoc.uid) {
      const privateHTML = () =>
        $("#browse-grid").append(
          `<h2 id="privacy-text">Private <i class="fa-solid fa-eye-slash"></i></h2>`
        );
      if (title === "Favorites" && userDoc.privacy.favorites === "private") {
        return privateHTML();
      } else if (
        title === "Played Games" &&
        userDoc.privacy.played === "private"
      ) {
        return privateHTML();
      } else if (title === "To Play" && userDoc.privacy.toplay === "private") {
        return privateHTML();
      }
    }

    if (auth.currentUser != null && auth.currentUser.uid === userDoc.uid) {
      togglePrivacyHandler(title);
    }

    if (title == "Favorites") {
      accessArray = userDoc.favorites;
    } else if (title == "To Play") {
      accessArray = userDoc.toplay;
    } else if (title == "Played Games") {
      accessArray = userDoc.played;
    }

    accessArray.forEach(async (gameID) => {
      let url = `https://api.rawg.io/api/games/${gameID}?key=${apiKey}`;
      LoadingMessage();

      try {
        await fetch(url)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            let year = data.released.split("-");
            $("#user-content #browse-grid").append(`
          <a href="#detail?game=${gameID}" class="grid-item">
            <img src="${data.background_image}" alt="image" />
            <div class="item-details">
              <div>
                <p class="details-title">${data.name}</p>
                <p class="details-year">${year[0]}</p>
              </div>
            </div>
          </a>
        `);
          })
          .then(() => {
            CloseLoading();
          });
      } catch (error) {
        FeedbackMessage("error", "API Error", error.message);
      }
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

//----User reviews----\\

export async function showUserReviews() {
  try {
    const userDoc = await findUser();
    $("#user-title").html("Reviews");
    $("#reviews-list").empty();

    userDoc.reviews.forEach((review) => {
      //display on page
      $("#reviews-list").append(`
        <div class="review-item" id="review-${review.gameId}">
          <a href="#detail?game=${review.gameId}">${review.gameName}</a>
          <div class="review-item-info">
            <p>${review.likes.length} Likes</p>
            <p>${review.reviewText.length} Characters</p>
            <p>${parseFloat(review.starScore)}/5 Stars</p>
            ${
              auth.currentUser != null && auth.currentUser.uid === userDoc.uid
                ? `<p class="edit-review-btn" id="editReview-${review.gameId}">Edit</p>`
                : `<p class="edit-review-btn" id="viewReview-${review.gameId}">View</p>`
            }
            ${
              auth.currentUser != null && auth.currentUser.uid === userDoc.uid
                ? `<p class="edit-review-btn" id="deleteReview-${review.gameId}">Delete</p>`
                : ""
            }
          </div>
        </div>
      `);

      $(`#viewReview-${review.gameId}`).on("click", () => {
        viewReviewModal(review);
      });

      $(`#editReview-${review.gameId}`).on("click", () => {
        editReviewPrompt(review.gameId);
      });

      $(`#deleteReview-${review.gameId}`).on("click", () => {
        deleteReviewPrompt(review.gameId);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
}

function viewReviewModal(review) {
  let stars = review.starScore.split(".")[0];
  let starHalf = review.starScore.split(".")[1];
  let starElement = "";

  //apply stars to review
  for (let i = 1; i <= stars; i++) {
    starElement += "&#9733;";
  }

  //apply half star to review
  if (starHalf != undefined) {
    starElement += "&#189;";
  }

  Swal.fire({
    title: "Review",
    background: "#555a68",
    color: `#e9e3e3`,
    showCancelButton: true,
    cancelButtonText: "Close",
    showConfirmButton: false,
    html: `
      <div id="viewReview">
        <div id="viewReviewTitle">
          <span>Review of </span>
          <a href="#detail?game=${review.gameId}">${review.gameName}</a>
          <span> by ${review.user}</span>
        </div>
        <p id="viewReviewText">${review.reviewText}</p>
        <div id="viewReviewBtm">
          <p id="viewReviewLikes"><i class="fa-solid fa-heart"></i> ${review.likes.length} Likes</p>
          <p id="viewReviewStars">${starElement}</p>
        </div>
      </div>
    `,
  });
}

//----User page navigation burger----\\

export function handleUserBurger() {
  if ($("#sidebarButtons").hasClass("checked")) {
    $("#userBurger").css("rotate", "0deg");
    $("#sidebarButtons").removeClass("checked");
    $("#sidebarButtons").css("display", "flex");
  } else {
    $("#userBurger").css("rotate", "180deg");
    $("#sidebarButtons").addClass("checked");
    $("#sidebarButtons").css("display", "none");
  }
}

//----Privacy for favs, played, and to play----\\

async function togglePrivacyHandler(title) {
  try {
    const userDoc = await findUser();
    let privacyObj = userDoc.privacy;
    $("#toggle-privacy").remove();

    const publicHTML = () => {
      $("#user-title-container").append(
        `<button id="toggle-privacy">Mark as Private <i class="fa-solid fa-eye-slash"></i></button>`
      );
    };

    const privateHTML = () => {
      $("#user-title-container").append(
        `<button id="toggle-privacy">Mark as Public <i class="fa-solid fa-eye"></i></button>`
      );
    };

    $("#toggle-privacy").off("click");

    if (title === "Favorites") {
      if (privacyObj.favorites === "public") {
        publicHTML();
        $("#toggle-privacy").on("click", () => {
          togglePrivacy(title, "private");
        });
      } else if (privacyObj.favorites === "private") {
        privateHTML();
        $("#toggle-privacy").on("click", () => {
          togglePrivacy(title, "public");
        });
      }
    } else if (title === "Played Games") {
      if (privacyObj.played === "public") {
        publicHTML();
        $("#toggle-privacy").on("click", () => {
          togglePrivacy(title, "private");
        });
      } else if (privacyObj.played === "private") {
        privateHTML();
        $("#toggle-privacy").on("click", () => {
          togglePrivacy(title, "public");
        });
      }
    } else if (title === "To Play") {
      if (privacyObj.toplay === "public") {
        publicHTML();
        $("#toggle-privacy").on("click", () => {
          togglePrivacy(title, "private");
        });
      } else if (privacyObj.toplay === "private") {
        privateHTML();
        $("#toggle-privacy").on("click", () => {
          togglePrivacy(title, "public");
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function togglePrivacy(title, toggle) {
  let userDocRef = doc(db, "GameDB", auth.currentUser.uid);

  if (title === "Favorites") {
    await updateDoc(userDocRef, {
      "privacy.favorites": toggle,
    })
      .catch((error) => {
        console.log(error);
      })
      .then(() => {
        togglePrivacyHandler(title);
        FeedbackMessage("success", "Success", "Privacy changed.");
      });
  } else if (title === "Played Games") {
    await updateDoc(userDocRef, {
      "privacy.played": toggle,
    })
      .catch((error) => {
        console.log(error);
      })
      .then(() => {
        togglePrivacyHandler(title);
        FeedbackMessage("success", "Success", "Privacy changed.");
      });
  } else if (title === "To Play") {
    await updateDoc(userDocRef, {
      "privacy.toplay": toggle,
    })
      .catch((error) => {
        console.log(error);
      })
      .then(() => {
        togglePrivacyHandler(title);
        FeedbackMessage("success", "Success", "Privacy changed.");
      });
  }
}

/*
  author: Matthew Wolf
  file: display-user-info.js
  purpose: holds functions that display user info like favorites, bio/top-five, reviews, etc.
*/

import { doc, getDoc } from "firebase/firestore";
import { auth, db, apiKey } from "../credentials";
import { editInfoListener } from "./user-editing";
import { CloseLoading, FeedbackMessage, LoadingMessage } from "../model";

export function loggedInButtons(user) {
  if (user !== null) {
    $(".nav-container").empty().append(`
    <a href="#browse?page=1" class="nav-link">Browse</a>
    <a id="nav-user" href="#user-personal" class="nav-link">
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

export async function showUserInfo() {
  LoadingMessage();
  let user = auth.currentUser;
  try {
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    userDoc = userDoc.data();
    let topFive = userDoc.topfive;

    $("#top-five .grid-row").html("");
    $("#user-content #user-info-name").html(`${user.displayName}`);

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
        $.getJSON(url, (data) => {
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
        }).then(() => {
          CloseLoading();
        });
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

    editInfoListener(user, userDoc, db);
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

export async function showUserItems(title) {
  let user = auth.currentUser;
  try {
    let accessArray = [];
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    userDoc = userDoc.data();

    $("#user-title").html(title);

    if (title == "Favorites") {
      accessArray = userDoc.favorites;
    } else if (title == "To Play") {
      accessArray = userDoc.toplay;
    } else if (title == "Played Games") {
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
    FeedbackMessage("error", "Error", error.message);
  }
}

export function handleUserBurger() {
  if ($("#sidebarButtons").hasClass("checked")) {
    $("#sidebarButtons").removeClass("checked");
    $("#sidebarButtons").css("display", "flex");
  } else {
    $("#sidebarButtons").addClass("checked");
    $("#sidebarButtons").css("display", "none");
  }
}

/*
  author: Matthew Wolf
  file: model.js
  purpose: central hub for page routing and auth state recognition, other functionality will be imported from relevant files for organization
*/

import { auth, db, apiKey } from "./credentials";
import { onAuthStateChanged } from "firebase/auth";
import { loginModal, signUpModal, logOut } from "./user/login-out";
import {
  loggedInButtons,
  showUserInfo,
  showUserItems,
} from "./user/display-user-info";

//----SIGN IN/OUT UPDATES----\\

onAuthStateChanged(auth, (user) => {
  if (user) {
    loggedInButtons(user);
    $("#logout-btn").on("click", () => logOut());
  } else {
    loggedInButtons(user);
    loginModal();
    signUpModal();
  }
});

//----PAGE ROUTING----\\

export function changeRoute() {
  let hashTag = window.location.hash;
  let pageID = hashTag.replace("#", "");

  function getPage(pageID) {
    $.get(`pages/${pageID}.html`, (data) => {
      $("#app").html(data);
    }).then(() => {
      if (pageID == "user-personal") {
        userListener();
        routeUser("info");
      }
    });
  }

  switch (pageID) {
    case "":
      getPage("home");
      signUpModal();
      break;
    case "home":
      getPage(pageID);
      signUpModal();
      break;
    case "user-personal":
      getPage(pageID);
      break;
  }
}

//----USER ROUTES----\\

function userListener() {
  $("#user-info").on("click", () => routeUser("info"));
  $("#user-favs").on("click", () => routeUser("favorites"));
  $("#user-played").on("click", () => routeUser("played"));
  $("#user-toplay").on("click", () => routeUser("toplay"));
  $("#user-lists").on("click", () => routeUser("lists"));
  $("#user-reviews").on("click", () => routeUser("reviews"));
}

function routeUser(page) {
  function getUserPage(page, showInfo) {
    $.get(`pages/user/user-${page}.html`, (data) => {
      $("#user-content").html(data);
    }).then(() => {
      showInfo();
    });
  }

  switch (page) {
    case "info":
      getUserPage(page, showUserInfo(auth.currentUser, db, apiKey));
      break;
    case "favorites":
      getUserPage("items", showUserItems(auth.currentUser, db, apiKey, "Favorites"));
      break;
    case "played":
      getUserPage("items", showUserItems(auth.currentUser, db, apiKey, "Played Games"));
      break;
    case "toplay":
      getUserPage("items", showUserItems(auth.currentUser, db, apiKey, "To Play"));
      break;
    case "lists":
      $("#user-content").html("Your Lists");
      break;
    case "reviews":
      $("#user-content").html("Your Reviews");
      break;
  }
}

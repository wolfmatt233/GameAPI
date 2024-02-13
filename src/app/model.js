/*
  author: Matthew Wolf
  file: model.js
  purpose: central hub for page routing and auth state recognition, other functionality will be imported from relevant files for organization
*/

import { auth } from "./credentials";
import { onAuthStateChanged } from "firebase/auth";
import { loginModal, signUpModal, logOut } from "./user/login-out";
import {
  loggedInButtons,
  showUserInfo,
  showUserItems,
  deletePrompt,
  changePasswordPrompt,
} from "./user/display-user-info";
import { apiList, searchApi } from "./api/browse";
import { viewDetails } from "./api/detail";

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
  let pageID = hashTag.replace("#", "").split("?")[0];
  let queryParams = new URLSearchParams(window.location.hash.split("?")[1]);
  let pagination = queryParams.get("page");
  let gameID = queryParams.get("game");
  let searchQuery = $("#searchBar").val();

  function getPage(pageID, activateFunc) {
    $.get(`pages/${pageID}.html`, (data) => {
      $("#app").html(data);
    }).then(() => {
      activateFunc();
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
      getPage(pageID, () => {
        userListener();
        routeUser("info");
      });
      break;
    case "browse":
      getPage(pageID, apiList(pagination));
      break;
    case "search":
      getPage("browse", searchApi(searchQuery, pagination));
      break;
    case "detail":
      getPage(pageID, viewDetails(gameID));
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
  $("#user-delete").on("click", () => routeUser("delete"));
  $("#user-password").on("click", () => routeUser("password"));
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
      getUserPage(page, showUserInfo(auth.currentUser));
      break;
    case "favorites":
      getUserPage("items", showUserItems(auth.currentUser, "Favorites"));
      break;
    case "played":
      getUserPage("items", showUserItems(auth.currentUser, "Played Games"));
      break;
    case "toplay":
      getUserPage("items", showUserItems(auth.currentUser, "To Play"));
      break;
    case "lists":
      $("#user-content").html("Your Lists");
      break;
    case "reviews":
      $("#user-content").html("Your Reviews");
      break;
    case "delete":
      deletePrompt(auth.currentUser);
      break;
    case "password":
      changePasswordPrompt(auth.currentUser);
      break;
  }
}

/*
  author: Matthew Wolf
  file: model.js
  purpose: central hub for page routing and auth state recognition, other functionality will be imported from relevant files for organization
*/

import { auth } from "./credentials";
import { onAuthStateChanged } from "firebase/auth";
import {
  loggedInButtons,
  loginModal,
  signUpModal,
  logOut,
} from "./user/login-out";
import {
  showUserInfo,
  showUserItems,
  handleUserBurger,
  showUserReviews,
} from "./user/display-user-info";
import { deletePrompt, changePasswordPrompt } from "./user/user-editing";
import { apiList, searchApi } from "./api/browse";
import { viewDetails } from "./api/detail";
import Swal from "sweetalert2";

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
    html: "Loading...",
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

export function CloseLoading() {
  Swal.close();
}

//----SIGN IN/OUT UPDATES----\\

onAuthStateChanged(auth, (user) => {
  homePage();
  if (user) {
    location.hash = "home";
    loggedInButtons(user);
    $("#logout-btn").on("click", () => logOut());
  } else {
    location.hash = "home";
    loggedInButtons(user);
    loginModal();
    signUpModal();
  }
});

//----HOME PAGE----\\

function homePage() {
  if (auth.currentUser != null) {
    $(".header-container button")
      .prop("onclick", null)
      .off("click")
      .html(`Welcome ${auth.currentUser.displayName}!`)
      .css("cursor", "auto");
  } else {
    $(".header-container button")
      .html("Create an account today!")
      .css("cursor", "pointer");
    signUpModal();
  }
}

//----PAGE ROUTING----\\

export function changeRoute() {
  let hashTag = window.location.hash;
  let pageID = hashTag.replace("#", "").split("?")[0];

  //query variables
  let queryParams = new URLSearchParams(window.location.hash.split("?")[1]);
  let gameID = queryParams.get("game");
  let page = queryParams.get("page");
  let genres = queryParams.get("genres");
  let stores = queryParams.get("stores");
  let user = queryParams.get("user");

  let searchQuery = $("#searchBar").val();
  $("#searchBar").on("keypress", (e) => {
    if (e.key == "Enter") {
      location.hash = `#search?page=1`;
    }
  });

  function getPage(pageID, activateFunc) {
    $.get(`pages/${pageID}.html`, (data) => {
      $("#app").html(data);
    }).then(() => {
      activateFunc();
    });
    $(".tooltip").css("opacity", "0");
  }

  switch (pageID) {
    case "":
      getPage("home");
      signUpModal();
      break;
    case "home":
      getPage(pageID, homePage);
      break;
    case "user":
      getPage(pageID, () => {
        userListener();
        routeUser("info");
      });
      break;
    case "browse":
      getPage(pageID, apiList(page, genres, stores));
      break;
    case "search":
      getPage("browse", searchApi(searchQuery, page, genres, stores));
      break;
    case "detail":
      getPage(pageID, viewDetails(gameID));
      break;
  }
}

//----USER ROUTES----\\

function userListener() {
  $("#user-info").on("click", () => routeUser("info"));
  $("#user-favs").on("click", () => routeUser("favorites"));
  $("#user-played").on("click", () => routeUser("played"));
  $("#user-toplay").on("click", () => routeUser("toplay"));
  $("#user-reviews").on("click", () => routeUser("reviews"));
  $("#userBurger").on("click", () => handleUserBurger());
}

export function routeUser(page) {
  function getUserPage(page, showInfo) {
    $.get(`pages/user/user-${page}.html`, (data) => {
      $("#user-content").html(data);
    }).then(() => {
      showInfo();
    });
  }

  switch (page) {
    case "info":
      getUserPage(page, showUserInfo());
      break;
    case "favorites":
      getUserPage("items", showUserItems("Favorites"));
      break;
    case "played":
      getUserPage("items", showUserItems("Played Games"));
      break;
    case "toplay":
      getUserPage("items", showUserItems("To Play"));
      break;
    case "reviews":
      getUserPage("reviews", showUserReviews());
      break;
    case "delete":
      deletePrompt();
      break;
    case "password":
      changePasswordPrompt();
      break;
  }
}

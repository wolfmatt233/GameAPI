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
  handleUserBurger,
} from "./user/display-user-info";
import { deletePrompt, changePasswordPrompt } from "./user/user-editing";
import { apiList, searchApi } from "./api/browse";
import { viewDetails } from "./api/detail";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  color: "#fff",
  background: "#555a68",
  position: "bottom-end",
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
      .html(`Welcome ${auth.currentUser.displayName}!`);
  } else {
    $(".header-container button").html("Create an account today!");
    signUpModal();
  }
}

//----PAGE ROUTING----\\

export function changeRoute() {
  let hashTag = window.location.hash;
  let pageID = hashTag.replace("#", "").split("?")[0];
  let queryParams = new URLSearchParams(window.location.hash.split("?")[1]);
  let pagination = queryParams.get("page");
  let gameID = queryParams.get("game");
  let searchQuery = $("#searchBar").val();
  $("#searchBar").on("keypress", (e) => {
    if (e.key == "Enter") {
      location.hash = "#search?page=1";
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
  $("#userBurger").on("click", () => handleUserBurger());
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
    case "lists":
      $("#user-content").html("Your Lists");
      break;
    case "reviews":
      $("#user-content").html("Your Reviews");
      break;
    case "delete":
      deletePrompt();
      break;
    case "password":
      changePasswordPrompt();
      break;
  }
}

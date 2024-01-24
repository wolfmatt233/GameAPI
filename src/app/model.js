/*
  author: Matthew Wolf
  file: model.js
  purpose: central hub for page routing and auth state recognition, other functionality will be imported from relevant files for organization
*/

import { auth, db, apiKey } from "./credentials";
import { onAuthStateChanged } from "firebase/auth";
import { loginModal, signUpModal, logOut } from "./user/login-out";

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("signed in");

    $(".nav-container").empty().append(`
      <a href="#browse" class="nav-link">Browse</a>
      <a id="nav-user" href="#user" class="nav-link">
        <span>${user.displayName}</span>
        <i class="fa-solid fa-user"></i>
      </a>
      <button id="logout-btn">
        Log Out
        <i class="fa-solid fa-arrow-right-from-bracket"></i>
      </button>
    `);

    $("#logout-btn").on("click", () => logOut());
  } else {
    console.log("signed out");

    $(".nav-container").empty().append(`
      <a href="#browse" class="nav-link">Browse</a>
      <button id="login-btn">Log In</button>
      <button class="signup-btn">Create Account</button>
    `);

    loginModal();
    signUpModal();
  }
});

//page routing
export function changeRoute() {
  let hashTag = window.location.hash;
  let pageID = hashTag.replace("#", "");

  function getPage(pageID) {
    $.get(`pages/${pageID}.html`, (data) => {
      $("#app").html(data);
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
    case "browse":
      getPage(pageID);
      break;
    case "detail":
      getPage(pageID);
      break;
    case "search":
      getPage(pageID);
      break;
    case "user":
      getPage(pageID);
      userListener();
      routeUser("info");
      break;
  }
}

// USER \\

//user route listeners
function userListener() {
  $("#user-info").on("click", () => routeUser("info"));
  $("#user-browse").on("click", () => routeUser("favorites"));
  $("#user-played").on("click", () => routeUser("played"));
  $("#user-toplay").on("click", () => routeUser("toplay"));
  $("#user-lists").on("click", () => routeUser("lists"));
  $("#user-reviews").on("click", () => routeUser("reviews"));
}

//route within user page
function routeUser(page) {
  switch (page) {
    case "info":
      $("#user-content").html("userInfo");
      break;
    case "browse":
      $("#user-content").html("Browse your favorites");
      break;
    case "played":
      $("#user-content").html("Your PLayed games");
      break;
    case "toplay":
      $("#user-content").html("To-play list");
      break;
    case "lists":
      $("#user-content").html("Your Lists");
      break;
    case "reviews":
      $("#user-content").html("Your Reviews");
      break;
  }
}

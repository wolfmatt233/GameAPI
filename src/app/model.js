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
  findUser,
} from "./user/display-user-info";
import { deletePrompt, changePasswordPrompt } from "./user/user-editing";
import { browse, searchApi } from "./api/browse/browse";
import { viewDetails } from "./api/detail/detail";

//----SIGN IN/OUT UPDATES----\\

onAuthStateChanged(auth, (user) => {
  homePageButton();
  if (user) {
    loggedInButtons(user);
    $("#logout-btn").on("click", () => logOut());
  } else {
    loggedInButtons(user);
    loginModal();
    signUpModal();
  }
});

//----NAV BURGER----\\

export function navBurger() {
  $("#nav-burger").on("click", () => {
    if ($(".nav-burger-container").hasClass("hide-burger")) {
      $(".nav-burger-container").removeClass("hide-burger");
      $(".nav-burger-container").addClass("show-burger");
      $("#nav-burger").html(`<i class="fa-solid fa-xmark"></i>`);
    } else if ($(".nav-burger-container").hasClass("show-burger")) {
      $(".nav-burger-container").removeClass("show-burger");
      $(".nav-burger-container").addClass("hide-burger");
      $("#nav-burger").html(`<hr><hr><hr>`);
    }
  });
}

function navBurgerReset() {
  if ($(".nav-burger-container").hasClass("show-burger")) {
    $("#nav-burger").trigger("click");
  }
}

//----HOME PAGE----\\

function homePageButton() {
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

//----ERRORS PAGE----\\

function errorPage() {
  let queryParams = new URLSearchParams(window.location.hash.split("?")[1]);
  let type = queryParams.get("type");

  function showMessage(message) {
    $("#error-message").html(message);
  }

  switch (type) {
    case "no-user":
      showMessage("Error: The user you targeted does not exist.");
      break;
    case "no-page":
      showMessage("Error: The page you targeted does not exist.");
      break;
    case "cors":
      showMessage("Error: There was an error retrieving games.");
      break;
    case "details-error":
      showMessage("Error: Game details could not be retrieved.");
      break;
  }
}

//----PAGE ROUTING----\\

export function changeRoute() {
  navBurgerReset();
  let hashTag = window.location.hash;
  let pageID = hashTag.replace("#", "").split("?")[0];

  //query variables
  let queryParams = new URLSearchParams(window.location.hash.split("?")[1]);
  let gameID = queryParams.get("game");
  let page = queryParams.get("page");
  let genres = queryParams.get("genres");
  let stores = queryParams.get("stores");

  let searchQuery = $("#searchBar").val();
  $("#searchBar").on("keypress", (e) => {
    if (e.key == "Enter") {
      location.hash = `#search?page=1`;
    }
  });

  function getPage(pageID, activateFunc) {
    try {
      $.get(`pages/${pageID}.html`, (data) => {
        $("#app").html(data);
      }).then(() => {
        activateFunc();
      });
      $(".tooltip").css("opacity", "0");
    } catch (error) {
      location.hash = "#error?type=no-page";
    }
  }

  switch (pageID) {
    case "":
      getPage("home");
      signUpModal();
      break;
    case "home":
      getPage(pageID, homePageButton);
      break;
    case "user":
      getPage(pageID, () => {
        userListener();
        routeUser("info");
      });
      break;
    case "browse":
      getPage(pageID, browse(page, genres, stores));
      break;
    case "search":
      getPage("browse", searchApi(searchQuery, page, genres, stores));
      break;
    case "detail":
      getPage(pageID, viewDetails(gameID));
      break;
    case "error":
      getPage(pageID, errorPage);
      break;
  }
}

//----USER ROUTES----\\

async function userListener() {
  let queryParams = new URLSearchParams(window.location.hash.split("?")[1]);
  let user = queryParams.get("user");
  let userDoc = await findUser();

  $("#user-info").on(
    "click",
    () => (location.hash = `#user?user=${user}&page=info`)
  );
  $("#user-favorites").on(
    "click",
    () => (location.hash = `#user?user=${user}&page=favorites`)
  );
  $("#user-played").on(
    "click",
    () => (location.hash = `#user?user=${user}&page=played`)
  );
  $("#user-toplay").on(
    "click",
    () => (location.hash = `#user?user=${user}&page=toplay`)
  );
  $("#user-reviews").on(
    "click",
    () => (location.hash = `#user?user=${user}&page=reviews`)
  );

  if (auth.currentUser != null && auth.currentUser.uid === userDoc.uid) {
    if ($("#user-delete").length == 0 && $("#user-password").length == 0) {
      $("#sidebarButtons").append(`
        <button id="user-delete" class="userNavBtn">
          Delete Account
          <i class="fa-solid fa-trash"></i>
        </button>
        <button id="user-password" class="userNavBtn">
          Change Password
          <i class="fa-solid fa-lock"></i>
        </button>
      `);

      $("#user-delete").on("click", () => deletePrompt());
      $("#user-password").on("click", () => changePasswordPrompt());
    }
  }

  $("#userBurger").on("click", () => handleUserBurger());
}

export function routeUser() {
  let hash = window.location.hash.split("?");
  let queryParams = new URLSearchParams(hash[1]);
  let page = queryParams.get("page");
  $(`#user-${page}`).css("background-color", "#40434e")

  if (page == undefined) {
    window.location.hash += "&page=info";
  }

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
  }
}

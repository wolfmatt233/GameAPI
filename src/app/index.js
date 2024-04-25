/*
  author: Matthew Wolf
  file: index.js
  purpose: base js page that starts the app and page routing
*/

import { changeRoute, navBurger } from "./model";

function initURLListener() {
  $(window).on("hashchange", changeRoute);
  changeRoute();
}

$(document).ready(function () {
  $("#searchBtn").on("click", () => {
    $("#searchBtn").attr("href", `#search?q=${$("#searchBar").val()}&page=1`);
  });
  initURLListener();
  navBurger();
});

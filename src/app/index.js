/*
  author: Matthew Wolf
  file: index.js
  purpose: base js page that starts the app and page routing
*/

import { changeRoute } from "./model";

function initURLListener() {
  $(window).on("hashchange", changeRoute);
  // location.hash = "home"
  changeRoute();
}

$(document).ready(function () {
  $("#searchBtn").on("click", changeRoute);
  initURLListener();
});

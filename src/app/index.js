import { changeRoute } from "./model";

function initURLListener() {
  $(window).on("hashchange", changeRoute);
  location.hash = "home"
  changeRoute();
}

$(document).ready(function () {
  initURLListener();
});

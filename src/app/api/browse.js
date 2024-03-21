/*
  author: Matthew Wolf
  file: browse.js
  purpose: holds functions for the browse page: browse, search, and filter
*/

import { apiKey } from "../credentials";
import { LoadingMessage, CloseLoading } from "../model";

//shows all games from browse
export function apiList(page, genres) {
  LoadingMessage();
  let url = "https://api.rawg.io/api/games?";
  genres == null ? (genres = "") : (url += "&genres=" + genres + "&");
  url += `key=${apiKey}`;
  url += `&page=${page}`;

  getFilters(genres);

  $.getJSON(url, (data) => {
    let listArr = data.results;
    listArr.forEach((game) => {
      let date;

      if (game.released == null) {
        date = "TBA";
      } else {
        date = game.released.split("-")[0];
      }

      $("#browse-grid").append(`
        <a href="#detail?game=${game.id}" class="grid-item">
            <img src="${game.background_image}" alt="image" />
            <div class="item-details">
            <div>
                <p class="details-title">${game.name}</p>
                <p class="details-year">${date}</p>
            </div>
            </div>
        </a>
      `);
    });

    pageButtons(data.next, data.previous, genres, "browse");

    $("#browse-title").html(`Browse Games`);
  }).then(() => {
    CloseLoading();
    filterEvents(null);
  });
}

//shows search results, including filters
export function searchApi(searchQuery, page, genres, stores) {
  LoadingMessage();

  // Build api call url
  let url = "https://api.rawg.io/api/games?";
  genres == null ? (genres = "") : (url += "&genres=" + genres);
  stores == null ? (stores = "") : (url += "&stores=" + stores);
  genres != "" || stores != "" ? (url += "&") : "";
  url += `key=${apiKey}`;
  url += `&page=${page}`;
  url += `&search=${searchQuery}`;

  getFilters(genres, stores);

  $("#browse-grid").empty();

  $.getJSON(url, (data) => {
    data.results.forEach((game) => {
      let date;
      let background = game.background_image;
      background == null ? (background = "") : background;

      if (game.released == null) {
        date = "TBA";
      } else {
        date = game.released.split("-")[0];
      }

      $("#browse-grid").append(`
        <a href="#detail?game=${game.id}" class="grid-item">
            <img src="${background}" alt="No image found" />
            <div class="item-details">
            <div>
                <p class="details-title">${game.name}</p>
                <p class="details-year">${date}</p>
            </div>
            </div>
        </a>
      `);
    });

    pageButtons(data.next, data.previous, genres, stores, "search");

    $("#browse-title").html(`Search for "${searchQuery}"`);
  }).then(() => {
    CloseLoading();
    filterEvents(searchQuery);
  });
}

function pageButtons(next, prev, genres, stores, sender) {
  genres != "" ? (genres = `&genres=${genres}`) : genres;
  stores != "" ? (stores = `&stores=${stores}`) : stores;
  let nextPage = 0;
  let prevPage = 0;
  let prevUrl;
  prev !== null ? (prevUrl = prev.split("?")[1].split("&")) : prev;

  if (next != null) {
    let nextUrl = next.split("?")[1].split("&"); //split to get query vars

    nextUrl.forEach((queryVar) => {
      queryVar = queryVar.split("=");
      if (queryVar[0] === "page") {
        nextPage = queryVar[1]; //get page query variable's value
      }
    });

    if (sender === "search") {
      $("#next").attr("href", `#search?page=${nextPage}${genres}${stores}`);
    } else if (sender === "browse") {
      $("#next").attr("href", `#browse?page=${nextPage}${genres}${stores}`);
    }
  } else if (next == null) {
    $("#next").css("display", "none");
  }

  if (prev != null) {
    prevUrl.forEach((queryVar) => {
      queryVar = queryVar.split("=");
      if (queryVar[0] === "page") {
        prevPage = queryVar[1];
      }
    });

    if (prevPage === 0) {
      if (sender === "search") {
        $("#previous").attr("href", `#search?page=1${genres}${stores}`);
      } else if (sender === "browse") {
        $("#previous").attr("href", `#browse?page=1${genres}${stores}`);
      }
    } else {
      if (sender === "search") {
        $("#previous").attr("href", `#search?page=${prevPage}${genres}${stores}`);
      } else if (sender === "browse") {
        $("#previous").attr("href", `#browse?page=${prevPage}${genres}${stores}`);
      }
    }
  } else if (prev == null) {
    $("#previous").css("display", "none");
  }
}

//allows checkbox list to be opened and closed, filters to be applied on button click
function filterEvents(searchQuery) {
  $("#activate-genres").off("click");
  $("#activate-genres").on("click", () => {
    if ($("#genres-boxes").hasClass("visible")) {
      $("#genres-boxes").removeClass("visible");
      $("#genres-boxes").addClass("invisible");
    } else {
      $("#genres-boxes").removeClass("invisible");
      $("#genres-boxes").addClass("visible");
    }
  });

  $("#activate-stores").off("click");
  $("#activate-stores").on("click", () => {
    if ($("#stores-boxes").hasClass("visible")) {
      $("#stores-boxes").removeClass("visible");
      $("#stores-boxes").addClass("invisible");
    } else {
      $("#stores-boxes").removeClass("invisible");
      $("#stores-boxes").addClass("visible");
    }
  });

  $("#filter-button").off("click");
  $("#filter-button").on("click", () => {
    applyFilters(searchQuery);
  });
}

//gets filters from api and puts them into a checkbox list
function getFilters(genres, stores) {
  // Get genre filters from api

  let genresUrl = `https://api.rawg.io/api/genres?key=${apiKey}`;
  genres != "" ? (genres = genres.split(",")) : genres;

  $("#genres-filter .checkbox-items").empty();

  $.getJSON(genresUrl, (data) => {
    data.results.forEach((apiGenre) => {
      let checked = "";

      if (genres != "") {
        genres.forEach((genre) => {
          if (genre == apiGenre.slug) {
            checked = "checked";
          }
        });
      }

      $("#genres-filter .checkbox-items").append(`
        <div class="filter-checkbox">
          <input type="checkbox" id="${apiGenre.slug}" class="checkbox-click" ${checked} name="${apiGenre.name}" value="${apiGenre.slug}" />
          <label for="${apiGenre.name}">${apiGenre.name}</label><br />
        </div>
      `);
    });
  });

  // Get store filters from api

  let storesUrl = `https://api.rawg.io/api/stores?key=${apiKey}`;
  stores != "" ? (stores = stores.split(",")) : stores;

  $("#stores-filter .checkbox-items").empty();

  $.getJSON(storesUrl, (data) => {
    data.results.forEach((apiStore) => {
      let checked = "";

      if (stores != "") {
        stores.forEach((store) => {
          if (store == apiStore.id) {
            checked = "checked";
          }
        });
      }

      let storeId = "store_" + apiStore.id;

      $("#stores-filter .checkbox-items").append(`
        <div class="filter-checkbox">
          <input type="checkbox" id="${storeId}" class="checkbox-click" ${checked} name="${apiStore.name}" value="${apiStore.slug}" />
          <label for="${apiStore.name}">${apiStore.name}</label><br />
        </div>
      `);
    });
  });
}

//constructs the filter query variables
function applyFilters(searchQuery) {
  //creating the query variable for genres
  let genreChecked = $("#genres-boxes .filter-checkbox input:checked");
  let genreArr = [];
  let genres = "";

  for (const property in genreChecked) {
    if (genreChecked[property].value != undefined) {
      genreArr.push(genreChecked[property].value);
    }
  }

  genreArr.length > 0 ? (genres += "&genres=") : genres;

  genreArr.forEach((genre, idx) => {
    genres += genre;

    if (genreArr.length - 1 != idx) {
      genres += ",";
    }
  });

  //creating the query variable for stores
  let storeChecked = $("#stores-boxes .filter-checkbox input:checked");
  let storeArr = [];
  let stores = "";

  for (const property in storeChecked) {
    if (storeChecked[property].value != undefined) {
      storeArr.push(storeChecked[property].id);
    }
  }

  storeArr.length > 0 ? (stores += "&stores=") : stores;

  storeArr.forEach((store, idx) => {
    store = store.split("_")[1];
    stores += store;

    if (storeArr.length - 1 != idx) {
      stores += ",";
    }
  });

  if (searchQuery) {
    location.hash = `#search?page=1${genres}${stores}`;
  } else if (searchQuery === null) {
    location.hash = `#browse?page=1${genres}`;
  }
}

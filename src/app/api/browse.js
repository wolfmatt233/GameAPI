/*
  author: Matthew Wolf
  file: browse.js
  purpose: holds functions for the browse page: browse, search, and filter
*/

import { apiKey } from "../credentials";
import { LoadingMessage, CloseLoading } from "../model";

//----Build url for search and browse----\\
function buildUrl(page, searchQuery, genres, stores, type) {
  let url = "https://api.rawg.io/api/games?";
  genres != null ? (url += "&genres=" + genres) : "";
  stores != null ? (url += "&stores=" + stores) : "";
  genres != null || stores != null ? (url += "&") : "";
  url += `key=${apiKey}`;
  url += `&page=${page}`;
  type == "search" ? (url += `&search=${searchQuery}`) : "";
  return url;
}

//----Browse games----\\

export async function apiList(page, genres, stores) {
  LoadingMessage();
  getFilters(genres, stores);
  let url = buildUrl(page, "", genres, stores, "browse");

  await fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      $("#browse-grid").empty();
      $("#browse-title").html(`Browse Games`);
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

      pageButtons(data.next, data.previous, genres, stores, "browse");
    })
    .then(() => {
      CloseLoading();
      filterEvents(null);
    });
}

//----Search games----\\

export async function searchApi(searchQuery, page, genres, stores) {
  LoadingMessage();
  getFilters(genres, stores);
  let url = buildUrl(page, searchQuery, genres, stores, "search");

  await fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      $("#browse-grid").empty();
      $("#browse-title").html(`Search for "${searchQuery}"`);
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
    })
    .then(() => {
      CloseLoading();
      filterEvents(searchQuery);
    });
}

//----Pagination-----\\

function pageButtons(next, prev, genres, stores, sender) {
  genres != null ? (genres = `&genres=${genres}`) : (genres = "");
  stores != null ? (stores = `&stores=${stores}`) : (stores = "");

  if (next != null) {
    let nextPage = new URLSearchParams(next).get("page");

    if (sender === "search") {
      $("#next").attr("href", `#search?page=${nextPage}${genres}${stores}`);
    } else if (sender === "browse") {
      $("#next").attr("href", `#browse?page=${nextPage}${genres}${stores}`);
    }
  } else if (next == null) {
    $("#next").css("display", "none");
  }

  if (prev != null) {
    let prevPage = new URLSearchParams(prev).get("page");

    //check if page 2: api gives page 1 without a page query parameter
    if (prevPage === null) {
      if (sender === "search") {
        $("#previous").attr("href", `#search?page=1${genres}${stores}`);
      } else if (sender === "browse") {
        $("#previous").attr("href", `#browse?page=1${genres}${stores}`);
      }
    } else {
      if (sender === "search") {
        $("#previous").attr(
          "href",
          `#search?page=${prevPage}${genres}${stores}`
        );
      } else if (sender === "browse") {
        $("#previous").attr(
          "href",
          `#browse?page=${prevPage}${genres}${stores}`
        );
      }
    }
  } else if (prev == null) {
    $("#previous").css("display", "none");
  }
}

//----Checkboxes open & filter button sends info----\\

function filterEvents(searchQuery) {
  $("#activate-genres").off("click");
  $("#activate-genres").on("click", (e) => {
    if ($("#genres-boxes").hasClass("visible")) {
      $(`#${e.target.id} i`).removeClass("fa-solid fa-caret-up");
      $(`#${e.target.id} i`).addClass("fa-solid fa-caret-down");
      $("#genres-boxes").removeClass("visible");
      $("#genres-boxes").addClass("invisible");
    } else {
      $(`#${e.target.id} i`).removeClass("fa-solid fa-caret-down");
      $(`#${e.target.id} i`).addClass("fa-solid fa-caret-up");
      $("#genres-boxes").removeClass("invisible");
      $("#genres-boxes").addClass("visible");
      if ($("#stores-boxes").hasClass("visible")) {
        $("#activate-stores").trigger("click");
      }
    }
  });

  $("#activate-stores").off("click");
  $("#activate-stores").on("click", (e) => {
    if ($("#stores-boxes").hasClass("visible")) {
      $(`#${e.target.id} i`).removeClass("fa-solid fa-caret-up");
      $(`#${e.target.id} i`).addClass("fa-solid fa-caret-down");
      $("#stores-boxes").removeClass("visible");
      $("#stores-boxes").addClass("invisible");
    } else {
      $(`#${e.target.id} i`).removeClass("fa-solid fa-caret-down");
      $(`#${e.target.id} i`).addClass("fa-solid fa-caret-up");
      $("#stores-boxes").removeClass("invisible");
      $("#stores-boxes").addClass("visible");
      if ($("#genres-boxes").hasClass("visible")) {
        $("#activate-genres").trigger("click");
      }
    }
  });

  $("#filter-button").off("click");
  $("#filter-button").on("click", () => {
    applyFilters(searchQuery);
  });
}

//----Get filters for dropdown lists----\\

async function getFilters(genres, stores) {
  // Get genre filters from api
  let genresUrl = `https://api.rawg.io/api/genres?key=${apiKey}`;
  genres != null ? (genres = genres.split(",")) : genres;
  LoadingMessage();

  await fetch(genresUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      $("#genres-filter .checkbox-items").empty();

      data.results.forEach((apiGenre) => {
        let checked = "";

        if (genres != null) {
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
  stores != null ? (stores = stores.split(",")) : stores;

  await fetch(storesUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      $("#stores-filter .checkbox-items").empty();

      data.results.forEach((apiStore) => {
        let checked = "";

        if (stores != null) {
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
    })
    .then(() => {
      CloseLoading();
    });
}

//----Constructs filter query strings----\\

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
    location.hash = `#browse?page=1${genres}${stores}`;
  }
}

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

//shows search results, needs filter options
export function searchApi(searchQuery, page, genres) {
  LoadingMessage();

  // Build api call url
  let url = "https://api.rawg.io/api/games?";
  genres == null ? (genres = "") : (url += "&genres=" + genres + "&");
  url += `key=${apiKey}`;
  url += `&page=${page}`;
  url += `&search=${searchQuery}`;

  getFilters(genres);

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

    pageButtons(data.next, data.previous, genres, "search");

    $("#browse-title").html(`Search for "${searchQuery}"`);
  }).then(() => {
    CloseLoading();
    filterEvents(searchQuery);
  });
}

function pageButtons(next, prev, genres, sender) {
  genres != "" ? (genres = `&genres=${genres}`) : genres;
  let nextPage = 0;
  let prevPage = 0;
  let prevUrl;
  prev !== null ? (prevUrl = prev.split("?")[1].split("&")) : prev;

  if (next != null) {
    let nextUrl = next.split("?")[1].split("&");
    nextUrl.forEach((queryVar) => {
      queryVar = queryVar.split("=");
      if (queryVar[0] === "page") {
        nextPage = queryVar[1];
      }
    });

    if (sender === "search") {
      $("#next").attr("href", `#search?page=${nextPage}${genres}`);
    } else if (sender === "browse") {
      $("#next").attr("href", `#browse?page=${nextPage}${genres}`);
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
        $("#previous").attr("href", `#search?page=1${genres}`);
      } else if (sender === "browse") {
        $("#previous").attr("href", `#browse?page=1${genres}`);
      }
    } else {
      if (sender === "search") {
        $("#previous").attr("href", `#search?page=${prevPage}${genres}`);
      } else if (sender === "browse") {
        $("#previous").attr("href", `#browse?page=${prevPage}${genres}`);
      }
    }
  } else if (prev == null) {
    $("#previous").css("display", "none");
  }
}

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

  $("#filter-button").off("click");
  $("#filter-button").on("click", () => {
    applyFilters(searchQuery);
  });
}

function getFilters(genres) {
  let url = `https://api.rawg.io/api/genres?key=${apiKey}`;
  genres != "" ? (genres = genres.split(",")) : genres;

  $("#genres-filter .checkbox-items").empty();

  $.getJSON(url, (data) => {
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
        <div class="genre-checkbox">
          <input type="checkbox" id="${apiGenre.slug}" class="checkbox-click" ${checked} name="${apiGenre.name}" value="${apiGenre.slug}" />
          <label for="${apiGenre.name}">${apiGenre.name}</label><br />
        </div>
      `);
    });
  });
}

function applyFilters(searchQuery) {
  let checked = $(".genre-checkbox input:checked");
  let genreArr = [];
  let genres = "";

  for (const property in checked) {
    if (checked[property].value != undefined) {
      genreArr.push(checked[property].value);
    }
  }

  genres += "&genres=";

  genreArr.forEach((genre, idx) => {
    genres += genre;

    if (genreArr.length - 1 != idx) {
      genres += ",";
    }
  });

  if (searchQuery) {
    location.hash = `#search?page=1${genres}`;
  } else if (searchQuery === null) {
    location.hash = `#browse?page=1${genres}`;
  }
}

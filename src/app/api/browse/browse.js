/*
  author: Matthew Wolf
  file: browse.js
  purpose: holds functions for the browse page: browse, search, and filter
*/

import { apiKey } from "../../credentials";
import { CloseLoading, FeedbackMessage } from "../../extras";
import { getFilters, filterEvents } from "./filters";

//----Build url for search and browse----\\

function buildUrl(page, searchQuery, genres, stores, type) {
  let url = "https://api.rawg.io/api/games?";
  genres != null ? (url += `genres=${genres}&`) : "";
  stores != null ? (url += `stores=${stores}&`) : "";
  url += `key=${apiKey}&page=${page}`;
  type == "search" ? (url += `&search=${searchQuery}&search_precise=true`) : "";
  return url;
}

//----Browse games----\\

export async function browse(page, genres, stores) {
  await getFilters(genres, stores);

  let url = buildUrl(page, "", genres, stores, "browse");
  $("#browse-grid").empty();

  try {
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
  } catch (error) {
    const errorTimeout = setTimeout(() => {
      browse(page, genres, stores);
    }, 3000);
  }
}

//----Search games----\\

export async function searchApi(searchQuery, page, genres, stores) {
  await getFilters(genres, stores);

  let url = buildUrl(page, searchQuery, genres, stores, "search");
  $("#browse-grid").empty();

  try {
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

        pageButtons(
          data.next,
          data.previous,
          genres,
          stores,
          "search",
          searchQuery
        );
      })
      .then(() => {
        filterEvents(searchQuery);
        CloseLoading();
      });
  } catch (error) {
    const errorTimeout = setTimeout(() => {
      searchApi(searchQuery, page, genres, stores);
    }, 3000);
  }
}

//----Pagination-----\\

function pageButtons(next, prev, genres, stores, sender, searchQuery) {
  genres != null ? (genres = `&genres=${genres}`) : (genres = "");
  stores != null ? (stores = `&stores=${stores}`) : (stores = "");

  if (next != null) {
    let nextPage = new URLSearchParams(next).get("page");

    if (sender === "search") {
      $("#next").attr(
        "href",
        `#search?q=${searchQuery}&page=${nextPage}${genres}${stores}`
      );
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
        $("#previous").attr(
          "href",
          `#search?q=${searchQuery}&page=1${genres}${stores}`
        );
      } else if (sender === "browse") {
        $("#previous").attr("href", `#browse?page=1${genres}${stores}`);
      }
    } else {
      if (sender === "search") {
        $("#previous").attr(
          "href",
          `#search?q=${searchQuery}&page=${prevPage}${genres}${stores}`
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

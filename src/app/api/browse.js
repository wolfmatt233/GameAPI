/*
  author: Matthew Wolf
  file: browse.js
  purpose: holds functions for the browse page, showing a list of api items
*/

import { apiKey } from "../credentials";
import { LoadingMessage, CloseLoading } from "../model";

//shows all games from browse
export function apiList(page) {
  LoadingMessage();
  let url = `https://api.rawg.io/api/games?key=${apiKey}&page=${page}`;

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

    //show pagination buttons
    if (page != 1 && page == 2) {
      $("#previous").attr("href", "#browse?page=1");
    } else if (page != 1) {
      $("#previous").attr("href", `#browse?page=${data.previous.slice(-1)}`);
    } else if (page == 1) {
      $("#previous").css("display", "none");
    }

    $("#next").attr("href", `#browse?page=${data.next.slice(-1)}`);
  }).then(() => {
    CloseLoading();
  });
}

//shows search results, needs filter options
export function searchApi(searchQuery, page) {
  LoadingMessage();
  let url = `https://api.rawg.io/api/games?key=${apiKey}&page=${page}&search=${searchQuery}`;
  let filterArray = [];

  $.getJSON(url, (data) => {
    data.results.forEach((game) => {
      filterArray.push(game);
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

    //show pagination buttons
    if (page != 1 && page == 2) {
      $("#previous").attr("href", "#search?page=1");
    } else if (page != 1) {
      $("#previous").attr("href", `#search?page=${data.previous.slice(-1)}`);
    } else if (page == 1) {
      $("#previous").css("display", "none");
    }

    $("#next").attr(
      "href",
      `#search?page=${data.next.split("&")[1].slice(-1)}`
    );
  }).then(() => {
    CloseLoading();
  });
}

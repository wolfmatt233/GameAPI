import { apiKey } from "../../credentials";
import { LoadingMessage, CloseLoading, FeedbackMessage } from "../../extras";

//----Checkboxes open/close & filter button sends info----\\

export function filterEvents(searchQuery) {
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

export async function getFilters(genres, stores) {
  // Get genre filters from api
  let genresUrl = `https://api.rawg.io/api/genres?key=${apiKey}`;
  genres != null ? (genres = genres.split(",")) : genres;
  LoadingMessage();

  try {
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
              <input type="radio" 
                id="${apiGenre.slug}" 
                class="checkbox-click" 
                ${checked} 
                name="genre" 
                value="${apiGenre.slug}"
              />
              <label for="${apiGenre.slug}">${apiGenre.name}</label><br />
            </div>
          `);
        });
      });
  } catch (error) {
    FeedbackMessage("error", "API Error", error.message);
  }

  // Get store filters from api

  let storesUrl = `https://api.rawg.io/api/stores?key=${apiKey}`;
  stores != null ? (stores = stores.split(",")) : stores;

  try {
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
  } catch (error) {
    FeedbackMessage("error", "API Error", error.message);
  }
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
    location.hash = `#search?q=${$("#searchBar").val()}&page=1${genres}${stores}`;
  } else if (searchQuery === null) {
    location.hash = `#browse?q=${$("#searchBar").val()}&page=1${genres}${stores}`;
  }
}

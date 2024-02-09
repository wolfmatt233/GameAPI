import { apiKey } from "../credentials";

export function apiList(page) {
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
  });
}

export function searchApi(searchQuery, page) {
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
  });
}

export function viewDetails(gameID) {
  let url = `https://api.rawg.io/api/games/${gameID}?key=${apiKey}`;

  $.getJSON(url, (data) => {
    let rating = data.esrb_rating.slug;
    let date = data.released;
    let metascore = data.metascore;

    if (rating == null) {
      rating = "pending";
    } else if (date == null) {
      date = "TBA";
    } else if (metascore == null) {
      metascore = "N/A";
    }

    $(".banner-container img").attr("href", `${data.background_image}`);
    $(".banner-container p").html(`${data.name}`);

    //left-hand bar
    $(".detail-left #genres").empty().append(``);
    $(".detail-left #tags").empty().append(``);
    $(".detail-left #stores").empty().append(``);
    $(".detail-left img").attr("href", `esrb_${rating}.png`);

    //right side top bar
    $(".detail-bar h4").html(date);
    $(".detail-bar h3").html(`Metascore: ${metascore}`);
    $(".detail-bar div i").html();
  });
}

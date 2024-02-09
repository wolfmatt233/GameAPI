import { apiKey } from "../credentials";

//shows all games from browse
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

//shows search results, needs filter options
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

//shows specific game details
export function viewDetails(gameID) {
  let url = `https://api.rawg.io/api/games/${gameID}?key=${apiKey}`;

  $.getJSON(url, (data) => {
    let rating = data.esrb_rating.slug;
    let date = data.released;
    let metascore = data.metacritic;

    if (rating == null) {
      rating = "pending";
    } else if (date == null) {
      date = "TBA";
    } else if (metascore == null) {
      metascore = "N/A";
    }

    $(".banner-container img").attr("src", `${data.background_image}`);
    $(".banner-container p").html(`${data.name}`);

    //Left side bar

    //genres
    data.genres.forEach((genre, idx) => {
      idx != 0 ? $("#genres").append(` | `) : idx;
      $("#genres").append(`<span>${genre.name}</span>`);
    });

    //tags
    data.tags.forEach((tag, idx) => {
      idx != 0 ? $("#tags").append(` | `) : idx;
      $("#tags").append(`<span>${tag.name}</span>`);
    });

    //storefronts
    data.stores.forEach((store, idx) => {
      idx != 0 ? $("#stores").append(` | `) : idx;
      $("#stores").append(
        `<a href="http://${store.store.domain}">${store.store.name}</a>`
      );
    });

    $(".detail-left img").attr("src", `./assets/esrb_${rating}.png`);

    //Right side top bar
    $(".detail-bar h4").html(`Released: ${date}`);
    $(".detail-bar h3").html(
      `Metascore: ${metascore}`
    );
    data.parent_platforms.forEach((platform) => {
      platform = platform.platform.slug;
      platform == "pc" ? (platform = "windows") : platform;
      platform == "mac" ? (platform = "apple") : platform;
      $(".detail-bar div").append(`<i class="fa-brands fa-${platform}"></i>`);
    });

    //Right side info and gallery
    data.developers.forEach((dev) => {
      $("#devs").append(`<li>${dev.name}</li>`);
    });

    data.publishers.forEach((pub) => {
      $("#pubs").append(`<li>${pub.name}</li>`);
    });

    $("#banner-2").attr("src", data.background_image_additional)

    $("#desc").append(data.description);
  });
}

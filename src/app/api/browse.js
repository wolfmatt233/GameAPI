import { auth, db, apiKey } from "../credentials";

//get a list of api items
//display them on the page, include pagination
export function apiList(searchQuery, page) {
  let url;
  if (searchQuery !== "") {
    url = `https://api.rawg.io/api/games?key=${apiKey}&page=${page}&search=${searchQuery}`;
  } else {
    url = `https://api.rawg.io/api/games?key=${apiKey}&page=${page}`;
  }

  $.getJSON(url, (data) => {
    let listArr = data.results;
    listArr.forEach((game) => {
      //append new item to list
      //game.name
      //game.released.split("-")[0]
      //game.background_image

      $("#browse-grid").append(`
        <a href="#detail_${game.id}" class="grid-item">
            <img src="${game.background_image}" alt="image" />
            <div class="item-details">
            <div>
                <p class="details-title">${game.name}</p>
                <p class="details-year">${game.released.split("-")[0]}</p>
            </div>
            </div>
        </a>
        `);
    });

    //show pagination buttons
    if (page != 1 && page == 2) {
      $("#previous").attr("href", "#browse_1");
    } else if (page != 1) {
      $("#previous")
        .attr("href", `#browse_${data.previous.split("&")[1].slice(-1)}`)
        
    } else if (page == 1) {
        $("#previous").css("display", "none");
    }

    $("#next").attr("href", `#browse_${data.next.split("&")[1].slice(-1)}`);
  });
}

import { auth, db, apiKey } from "../credentials";
import { doc, getDoc, updateDoc } from "firebase/firestore";

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

    //rating image
    $(".detail-left img").attr("src", `./assets/esrb_${rating}.png`);

    //if logged in, display user buttons
    if (auth.currentUser != null) {
      addUserButtons(gameID);
    }

    //Right side top bar
    $(".detail-bar h4").html(`Released: ${date}`);
    $(".detail-bar h3").html(`Metascore: ${metascore}`);
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

    $("#banner-2").attr("src", data.background_image_additional);

    $("#desc").append(data.description);
  });
}

function checkFavBtn(favCheck) {
  if (favCheck == 1) {
    $("#addToFavorites")
      .attr("id", "addedToFavorites")
      .attr("class", "addedBtn")
      .html(`Favorited <i class="fa-solid fa-check"></i>`);
    $("#addedToFavorites").on({
      mouseenter: function () {
        $("#addedToFavorites").html(`Remove <i class="fa-solid fa-minus"></i>`);
      },
      mouseleave: function () {
        $("#addedToFavorites").html(
          `Favorited <i class="fa-solid fa-check"></i>`
        );
      },
    });
  } else {
    $("#addedToFavorites")
      .attr("id", "addToFavorites")
      .attr("class", "")
      .html(`Add to Favorites <i class="fa-solid fa-plus"></i>`);
  }
}

function checkPlayedBtn(playCheck) {
  if (playCheck == 1) {
    $("#addToPlayed")
      .attr("id", "addedToPlayed")
      .attr("class", "addedBtn")
      .html(`Played <i class="fa-solid fa-check"></i>`);
    $("#addedToPlayed").on({
      mouseenter: function () {
        $("#addedToPlayed").html(`Remove <i class="fa-solid fa-minus"></i>`);
      },
      mouseleave: function () {
        $("#addedToPlayed").html(`Played <i class="fa-solid fa-check"></i>`);
      },
    });
  } else {
    $("#addedToPlayed")
      .attr("id", "addToPlayed")
      .attr("class", "")
      .html(`Add to "Played" <i class="fa-solid fa-plus"></i>`);
  }
}

function checkToPlayBtn(wantCheck) {
  if (wantCheck == 1) {
    $("#addToWantToPlay")
      .attr("id", "addedToWantToPlay")
      .attr("class", "addedBtn")
      .html(`To Play <i class="fa-solid fa-check"></i>`);
    $("#addedToWantToPlay").on({
      mouseenter: function () {
        $("#addedToWantToPlay").html(
          `Remove <i class="fa-solid fa-minus"></i>`
        );
      },
      mouseleave: function () {
        $("#addedToWantToPlay").html(
          `To Play <i class="fa-solid fa-check"></i>`
        );
      },
    });
  } else {
    $("#addedToWantToPlay")
      .attr("id", "addToWantToPlay")
      .attr("class", "")
      .html(`Add to "To Play" <i class="fa-solid fa-plus"></i>`);
  }
}

// add and remove functions for favorites, played, and to play
async function addUserButtons(gameID) {
  $(".detail-left").append(`
    <button id="addToFavorites">Add to "Favorites" <i class="fa-solid fa-plus"></i></button>
    <button id="addToPlayed">Add to "Played" <i class="fa-solid fa-plus"></i></button>
    <button id="addToWantToPlay">Add to "To Play" <i class="fa-solid fa-plus"></i></button>
  `);

  try {
    let userDoc = await getDoc(doc(db, "GameDB", auth.currentUser.uid));
    userDoc = userDoc.data();
    let favCheck = 0;
    let playCheck = 0;
    let wantCheck = 0;

    userDoc.favorites.forEach((game) => {
      //if game is already added, change the favorite button accordingly
      if (gameID == game) {
        favCheck++;
      }
    });

    userDoc.played.forEach((game) => {
      //if game is already added, change the favorite button accordingly
      if (gameID == game) {
        playCheck++;
      }
    });

    userDoc.toplay.forEach((game) => {
      //if game is already added, change the favorite button accordingly
      if (gameID == game) {
        wantCheck++;
      }
    });

    checkFavBtn(favCheck);
    checkPlayedBtn(playCheck);
    checkToPlayBtn(wantCheck);
  } catch (e) {
    console.log(e.message);
  }

  //favorites add and remove
  $("#addToFavorites").on("click", () => addToFavorites(gameID));
  $("#addedToFavorites").on("click", () => removeFromFavorites(gameID));

  //played add and remove
  $("#addToPlayed").on("click", () => addToPlayed(gameID));
  $("#addedToPlayed").on("click", () => removeFromPlayed(gameID));

  //to play add and remove
  $("#addToWantToPlay").on("click", () => addToWantToPlay(gameID));
  $("#addedToWantToPlay").on("click", () => removeFromWantToPlay(gameID));
}

async function addToFavorites(gameID) {
  try {
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let favArray = userDoc.data().favorites;
    favArray.push(gameID);

    await updateDoc(doc(db, "GameDB", user.uid), {
      favorites: favArray,
    }).then(() => checkFavBtn(1));
  } catch (e) {
    //toast message here
    console.log(e.message);
  }
}

async function removeFromFavorites(gameID) {
  try {
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let favArray = userDoc.data().favorites;
    favArray.forEach((game, idx) => {
      if (game == gameID) {
        favArray.splice(idx, 1);
      }
    });

    await updateDoc(doc(db, "GameDB", user.uid), {
      favorites: favArray,
    }).then(() => checkFavBtn(0));
  } catch (e) {
    //toast message here
    console.log(e.message);
  }
}

async function addToPlayed(gameID) {
  try {
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let playedArray = userDoc.data().played;
    playedArray.push(gameID);

    await updateDoc(doc(db, "GameDB", user.uid), {
      played: playedArray,
    }).then(() => checkPlayedBtn(1));
  } catch (e) {
    //toast message here
    console.log(e.message);
  }
}

async function removeFromPlayed(gameID) {
  try {
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let playedArray = userDoc.data().played;
    playedArray.forEach((game, idx) => {
      if (game == gameID) {
        playedArray.splice(idx, 1);
      }
    });

    await updateDoc(doc(db, "GameDB", user.uid), {
      played: playedArray,
    }).then(() => checkPlayedBtn(0));
  } catch (e) {
    console.log(e.message);
  }
}

async function addToWantToPlay(gameID) {
  try {
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let wantArray = userDoc.data().toplay;
    wantArray.push(gameID);

    await updateDoc(doc(db, "GameDB", user.uid), {
      toplay: wantArray,
    }).then(() => checkToPlayBtn(1));
  } catch (e) {
    //toast message here
    console.log(e.message);
  }
}

async function removeFromWantToPlay(gameID) {
  try {
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let wantArray = userDoc.data().toplay;
    wantArray.forEach((game, idx) => {
      if (game == gameID) {
        wantArray.splice(idx, 1);
      }
    });

    await updateDoc(doc(db, "GameDB", user.uid), {
      toplay: wantArray,
    }).then(() => checkToPlayBtn(0));
  } catch (e) {
    //toast message here
    console.log(e.message);
  }
}

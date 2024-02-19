import { auth, db, apiKey } from "../credentials";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";

//----SHOW DETAIL PAGE----\\

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

//----BUTTONS & CHECKS----\\

async function addUserButtons(gameID) {
  $(".detail-left").append(`
    <button id="addToFavorites">Add to "Favorites" <i class="fa-solid fa-plus"></i></button>
    <button id="addToPlayed">Add to "Played" <i class="fa-solid fa-plus"></i></button>
    <button id="addToWantToPlay">Add to "To Play" <i class="fa-solid fa-plus"></i></button>
    <button id="addReview">Add a Review <i class="fa-solid fa-plus"></i></button>
  `);

  try {
    let userDoc = await getDoc(doc(db, "GameDB", auth.currentUser.uid));
    userDoc = userDoc.data();
    let favCheck = 0;
    let playCheck = 0;
    let wantCheck = 0;
    let reviewCheck = 0;

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

    userDoc.reviews.forEach((game) => {
      //if game is already added, change the favorite button accordingly
      if (gameID == game.gameId) {
        reviewCheck++;
      }
    });

    checkFavBtn(favCheck, gameID);
    checkPlayedBtn(playCheck, gameID);
    checkToPlayBtn(wantCheck, gameID);
    checkReviewBtn(reviewCheck, gameID);
  } catch (e) {
    console.log(e.message);
  }
}

function checkFavBtn(check, gameID) {
  if (check == 1) {
    //you have added the game to "Favorites"
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
    $("#addedToFavorites").prop("onclick", null).off("click");
    $("#addedToFavorites").on("click", () => removeFromFavorites(gameID));
  } else {
    //game NOT added to "Favorites"
    $("#addedToFavorites")
      .attr("id", "addToFavorites")
      .attr("class", "")
      .html(`Add to Favorites <i class="fa-solid fa-plus"></i>`);
    $("#addToFavorites").prop("onclick", null).off("click");
    $("#addToFavorites").on("click", () => addToFavorites(gameID));
  }
}

function checkPlayedBtn(check, gameID) {
  if (check == 1) {
    //you have added the game to "played"
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
    $("#addedToPlayed").prop("onclick", null).off("click");
    $("#addedToPlayed").on("click", () => removeFromPlayed(gameID));
  } else {
    //game NOT added to "played"
    $("#addedToPlayed")
      .attr("id", "addToPlayed")
      .attr("class", "")
      .html(`Add to "Played" <i class="fa-solid fa-plus"></i>`);
    $("#addToPlayed").prop("onclick", null).off("click");
    $("#addToPlayed").on("click", () => addToPlayed(gameID));
  }
}

function checkToPlayBtn(check, gameID) {
  if (check == 1) {
    //you have added the game to "To play"
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
    $("#addedToWantToPlay").prop("onclick", null).off("click");
    $("#addedToWantToPlay").on("click", () => removeFromWantToPlay(gameID));
  } else {
    //game NOT added to "To play"
    $("#addedToWantToPlay")
      .attr("id", "addToWantToPlay")
      .attr("class", "")
      .html(`Add to "To Play" <i class="fa-solid fa-plus"></i>`);
    $("#addToWantToPlay").prop("onclick", null).off("click");
    $("#addToWantToPlay").on("click", () => addToWantToPlay(gameID));
  }
}

function checkReviewBtn(check, gameID) {
  if (check == 1) {
    //you have added a review
    $("#addReview")
      .attr("id", "addedReview")
      .attr("class", "addedBtn-review")
      .html(`View Your Review <i class="fa-solid fa-check"></i>`);
    $("#addedToWantToPlay").prop("onclick", null).off("click");
    $("#addedReview").on("click", () => viewReview(gameID));
  } else {
    //game NOT added to "To play"
    $("#addedReview")
      .attr("id", "addReview")
      .attr("class", "")
      .html(`Add Review <i class="fa-solid fa-plus"></i>`);
    $("#addedToWantToPlay").prop("onclick", null).off("click");
    $("#addReview").on("click", () => addReviewPrompt(gameID));
  }
}

//----ADD & REMOVE FUNCTIONS----\\

async function addToFavorites(gameID) {
  try {
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let favArray = userDoc.data().favorites;
    favArray.push(gameID);

    await updateDoc(doc(db, "GameDB", user.uid), {
      favorites: favArray,
    }).then(() => checkFavBtn(1, gameID));
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
    }).then(() => checkFavBtn(0, gameID));
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
    }).then(() => checkPlayedBtn(1, gameID));
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
    }).then(() => checkPlayedBtn(0, gameID));
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
    }).then(() => checkToPlayBtn(1, gameID));
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
    }).then(() => checkToPlayBtn(0, gameID));
  } catch (e) {
    //toast message here
    console.log(e.message);
  }
}

function addReviewPrompt(gameID) {
  Swal.fire({
    title: "New Review",
    background: "#555a68",
    color: `#e9e3e3`,
    confirmButtonText: "Add review",
    confirmButtonColor: "#04724D",
    showCancelButton: true,
    cancelButtonText: "Cancel",
    cancelButtonColor: "#e15554",
    html: `
          <textarea id="reviewText" class="swal2-textarea" placeholder="Review here..."></textarea>
          <div id="starScore2">
            <div class="star" id="st1">
              <div id="score_1" class="st-l"></div>
              <div id="score_2" class="st-r"></div>
            </div>
            <div class="star" id="st2">
              <div id="score_3" class="st-l"></div>
              <div id="score_4" class="st-r"></div>
            </div>
            <div class="star" id="st3">
              <div id="score_5" class="st-l"></div>
              <div id="score_6" class="st-r"></div>
            </div>
            <div class="star" id="st4">
              <div id="score_7" class="st-l"></div>
              <div id="score_8" class="st-r"></div>
            </div>
            <div class="star" id="st5">
              <div id="score_9" class="st-l"></div>
              <div id="score_10" class="st-r"></div>
            </div>
          </div>
        `,
    preConfirm: () => {
      let reviewText = $("#reviewText").val();
      let starScore  = $(".checked").attr("id").split("_")[1];

      let reviewObj = {
        reviewText: reviewText,
        starScore: parseInt(starScore),
        likes: 0,
        gameId: gameID,
      };
      
      addReview(reviewObj)
    },
  });

  starSelector();
}

function starSelector() {
  // 0.5 stars
  $("#st1 .st-l").on("click", () => {
    $(".st-l").attr("class", "st-l");
    $(".st-r").attr("class", "st-r");
    $("#st1 .st-l").addClass("checked");
    $(".star > *").css("background-color", "#fff");
    $("#st1 .st-l").css("background-color", "#2e7f2e")
  });

  // 1 star
  $("#st1 .st-r").on("click", () => {
    $(".st-l").attr("class", "st-l");
    $(".st-r").attr("class", "st-r");
    $("#st1 .st-r").addClass("checked");
    $(".star > *").css("background-color", "#fff");
    $("#st1 > *").css("background-color", "#2e7f2e");
  });

  // 1.5 stars
  $("#st2 .st-l").on("click", () => {
    $(".st-l").attr("class", "st-l");
    $(".st-r").attr("class", "st-r");
    $("#st2 .st-l").addClass("checked");
    $(".star > *").css("background-color", "#fff");
    $("#st1 > *, #st2 .st-l")
      .css("background-color", "#2e7f2e")
      .addClass(`checked`);
  });

  // 2 stars
  $("#st2 .st-r").on("click", () => {
    $(".st-l").attr("class", "st-l");
    $(".st-r").attr("class", "st-r");
    $("#st2 .st-r").addClass("checked");
    $(".star > *").css("background-color", "#fff");
    $("#st1 > *, #st2 > *").css("background-color", "#2e7f2e");
  });

  // 2.5 stars
  $("#st3 .st-l").on("click", () => {
    $(".st-l").attr("class", "st-l");
    $(".st-r").attr("class", "st-r");
    $("#st3 .st-l").addClass("checked");
    $(".star > *").css("background-color", "#fff");
    $("#st1 > *, #st2 > *, #st3 .st-l").css("background-color", "#2e7f2e");
  });

  // 3 stars
  $("#st3 .st-r").on("click", () => {
    $(".st-l").attr("class", "st-l");
    $(".st-r").attr("class", "st-r");
    $("#st3 .st-r").addClass("checked");
    $(".star > *").css("background-color", "#fff");
    $("#st1 > *, #st2 > *, #st3 > *").css("background-color", "#2e7f2e");
  });

  // 3.5 stars
  $("#st4 .st-l").on("click", () => {
    $(".st-l").attr("class", "st-l");
    $(".st-r").attr("class", "st-r");
    $("#st4 .st-l").addClass("checked");
    $(".star > *").css("background-color", "#fff");
    $("#st1 > *, #st2 > *, #st3 > *, #st4 .st-l").css("background-color", "#2e7f2e");
  });

  // 4 stars
  $("#st4 .st-r").on("click", () => {
    $(".st-l").attr("class", "st-l");
    $(".st-r").attr("class", "st-r");
    $("#st4 .st-r").addClass("checked");
    $(".star > *").css("background-color", "#fff");
    $("#st1 > *, #st2 > *, #st3 > *, #st4 > *").css("background-color", "#2e7f2e");
  });

  // 4.5 stars
  $("#st5 .st-l").on("click", () => {
    $(".st-l").attr("class", "st-l");
    $(".st-r").attr("class", "st-r");
    $("#st5 .st-l").addClass("checked");
    $(".star > *").css("background-color", "#fff");
    $("#st1 > *, #st2 > *, #st3 > *, #st4 > *, #st5 .st-l").css(
      "background-color",
      "#2e7f2e"
    );
  });

  // 5 stars
  $("#st5 .st-r").on("click", () => {
    $(".st-l").attr("class", "st-l");
    $(".st-r").attr("class", "st-r");
    $("#st5 .st-r").addClass("checked");
    $(".star > *").css("background-color", "#fff");
    $("#st1 > *, #st2 > *, #st3 > *, #st4 > *, #st5 > *").css(
      "background-color",
      "#2e7f2e"
    );
  });
}

async function addReview(reviewObj) {
  try {
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let reviewArray = userDoc.data().reviews;

    reviewArray.push(reviewObj); //push new review object to old array

    await updateDoc(doc(db, "GameDB", user.uid), {
      reviews: reviewArray,
    }).then(() => checkReviewBtn(1, gameID));
  } catch (error) {
    console.log();
  }
}

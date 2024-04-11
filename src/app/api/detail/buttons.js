/*
  author: Matthew Wolf
  file: buttons.js
  purpose: holds functions for user buttons on the details page
*/

import { auth, db } from "../../credentials";
import Swal from "sweetalert2";
import { doc, updateDoc } from "firebase/firestore";
import { FeedbackMessage, getUserDoc } from "../../model";
import { checkReviewBtn } from "./reviews";
import { onAuthStateChanged } from "firebase/auth";

//----BUTTONS & CHECKS----\\

export async function addUserButtons(gameID, name) {
  $(".detail-buttons").append(`
      <button id="addToFavorites">Add to "Favorites" <i class="fa-solid fa-plus"></i></button>
      <button id="addToPlayed">Add to "Played" <i class="fa-solid fa-plus"></i></button>
      <button id="addToWantToPlay">Add to "To Play" <i class="fa-solid fa-plus"></i></button>
      <button id="addToTopFive">Add to Your Top Five</button>
      <button id="addReview">Add a Review <i class="fa-solid fa-plus"></i></button>
    `);

  try {
    let userDoc = await getUserDoc();
    userDoc = userDoc.data();
    let favCheck = 0;
    let playCheck = 0;
    let wantCheck = 0;
    let reviewCheck = 0;
    let topCheck = 0;

    userDoc.favorites.forEach((game) => {
      if (gameID == game) {
        favCheck++;
      }
    });

    userDoc.played.forEach((game) => {
      if (gameID == game) {
        playCheck++;
      }
    });

    userDoc.toplay.forEach((game) => {
      if (gameID == game) {
        wantCheck++;
      }
    });

    userDoc.reviews.forEach((game) => {
      if (gameID == game.gameId) {
        reviewCheck++;
      }
    });

    for (const property in userDoc.topfive) {
      if (userDoc.topfive[property] == gameID) {
        topCheck++;
      }
    }

    checkFavBtn(favCheck, gameID);
    checkPlayedBtn(playCheck, gameID);
    checkToPlayBtn(wantCheck, gameID);
    checkReviewBtn(reviewCheck, gameID, name);
    checkTopFiveBtn(topCheck, gameID);
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
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

function checkTopFiveBtn(check, gameID) {
  if (check == 1) {
    //you have added the game to Top Five
    $("#addToTopFive")
      .attr("id", "addedToTopFive")
      .attr("class", "addedBtn")
      .html(`On Top Five <i class="fa-solid fa-check"></i>`);
    $("#addedToTopFive").on({
      mouseenter: function () {
        $("#addedToTopFive").html(`Remove <i class="fa-solid fa-minus"></i>`);
      },
      mouseleave: function () {
        $("#addedToTopFive").html(
          `On Top Five <i class="fa-solid fa-check"></i>`
        );
      },
    });
    $("#addedToTopFive").prop("onclick", null).off("click");
    $("#addedToTopFive").on("click", () => removeFromTopFive(gameID));
  } else {
    //game NOT added to Top Five
    $("#addedToTopFive")
      .attr("id", "addToTopFive")
      .attr("class", "")
      .html(`Add to Top Five <i class="fa-solid fa-plus"></i>`);
    $("#addToTopFive").prop("onclick", null).off("click");
    $("#addToTopFive").on("click", () => topFivePrompt(gameID));
  }
}

//----ADD & REMOVE FUNCTIONS----\\

async function addToFavorites(gameID) {
  try {
    let userDoc = await getUserDoc();
    let favArray = userDoc.data().favorites;
    favArray.push(gameID);

    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      favorites: favArray,
    }).then(() => {
      FeedbackMessage("success", "Success", "Added to Favorites!");
      checkFavBtn(1, gameID);
    });
  } catch (e) {
    //toast message here
    FeedbackMessage("error", "Error", error.message);
  }
}

async function removeFromFavorites(gameID) {
  try {
    let userDoc = await getUserDoc();
    let favArray = userDoc.data().favorites;

    favArray.forEach((game, idx) => {
      if (game == gameID) {
        favArray.splice(idx, 1);
      }
    });

    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      favorites: favArray,
    }).then(() => {
      FeedbackMessage("success", "Success", "Removed from Favorites.");
      checkFavBtn(0, gameID);
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

async function addToPlayed(gameID) {
  try {
    let userDoc = await getUserDoc();
    let playedArray = userDoc.data().played;
    playedArray.push(gameID);

    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      played: playedArray,
    }).then(() => {
      FeedbackMessage("success", "Success", "Added to Played");
      checkPlayedBtn(1, gameID);
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

async function removeFromPlayed(gameID) {
  try {
    let userDoc = await getUserDoc();
    let playedArray = userDoc.data().played;

    playedArray.forEach((game, idx) => {
      if (game == gameID) {
        playedArray.splice(idx, 1);
      }
    });

    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      played: playedArray,
    }).then(() => {
      FeedbackMessage("success", "Success", "Removed from Played");
      checkPlayedBtn(0, gameID);
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

async function addToWantToPlay(gameID) {
  try {
    let userDoc = await getUserDoc();
    let wantArray = userDoc.data().toplay;
    wantArray.push(gameID);

    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      toplay: wantArray,
    }).then(() => {
      FeedbackMessage("success", "Success", 'Added to "To Play"');
      checkToPlayBtn(1, gameID);
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

async function removeFromWantToPlay(gameID) {
  try {
    let userDoc = await getUserDoc();
    let wantArray = userDoc.data().toplay;
    wantArray.forEach((game, idx) => {
      if (game == gameID) {
        wantArray.splice(idx, 1);
      }
    });

    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      toplay: wantArray,
    }).then(() => {
      FeedbackMessage("success", "Success", 'Removed from "To Play"');
      checkToPlayBtn(0, gameID);
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

//----Top Five----\\

function topFivePrompt(gameID) {
  Swal.fire({
    title: "Add to Top 5",
    input: "select",
    background: "#555a68",
    color: `#e9e3e3`,
    inputOptions: {
      1: "1st",
      2: "2nd",
      3: "3rd",
      4: "4th",
      5: "5th",
    },
    inputPlaceholder: "Select a place",
    showCancelButton: true,
    inputValidator: (value) => {
      addToTopFive(value, gameID);
    },
  });
}

async function addToTopFive(place, gameID) {
  try {
    let userDoc = await getUserDoc();
    let topFive = userDoc.data().topfive;
    topFive[place] = gameID.toString();

    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      topfive: topFive,
    }).then(() => {
      checkTopFiveBtn(1, gameID);
      FeedbackMessage("success", "Success", "Added to Top Five!");
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

async function removeFromTopFive(gameID) {
  try {
    let userDoc = await getUserDoc();
    let topFive = userDoc.data().topfive;

    for (const property in topFive) {
      if (topFive[property] == gameID) {
        topFive[property] = "";
      }
    }

    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      topfive: topFive,
    }).then(() => {
      checkTopFiveBtn(0, gameID);
      FeedbackMessage("success", "Success", "Removed from Top Five.");
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

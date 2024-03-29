/*
  author: Matthew Wolf
  file: buttons.js
  purpose: holds functions for user buttons on the details page
*/

import { auth, db } from "../credentials";
import Swal from "sweetalert2";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { showReviews } from "./detail";
import { FeedbackMessage } from "../model";

//----BUTTONS & CHECKS----\\

export async function addUserButtons(gameID) {
  $(".detail-buttons").append(`
      <button id="addToFavorites">Add to "Favorites" <i class="fa-solid fa-plus"></i></button>
      <button id="addToPlayed">Add to "Played" <i class="fa-solid fa-plus"></i></button>
      <button id="addToWantToPlay">Add to "To Play" <i class="fa-solid fa-plus"></i></button>
      <button id="addToTopFive">Add to Your Top Five</button>
      <button id="addReview">Add a Review <i class="fa-solid fa-plus"></i></button>
    `);

  try {
    let userDoc = await getDoc(doc(db, "GameDB", auth.currentUser.uid));
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
    checkReviewBtn(reviewCheck, gameID);
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

function checkReviewBtn(check, gameID) {
  showReviews(gameID);

  if (check == 1) {
    //you have added a review
    $("#addReview")
      .attr("id", "addedReview")
      .attr("class", "addedBtn-review")
      .html(`Edit Your Review <i class="fa-solid fa-check"></i>`);
    $("#addedReview").prop("onclick", null).off("click");
    $("#addedReview").on("click", () => editReviewPrompt(gameID));
    if ($("#deleteReview").length == 0) {
      $(".detail-buttons").append(
        `<button id="deleteReview">Delete Review <i class="fa-solid fa-trash"></i></button>`
      );
    }
    $("#deleteReview").on("click", () => deleteReviewPrompt(gameID));
  } else {
    //game NOT reviewed
    $("#addedReview")
      .attr("id", "addReview")
      .attr("class", "")
      .html(`Add Review <i class="fa-solid fa-plus"></i>`);
    $("#addedReview").prop("onclick", null).off("click");
    $("#addReview").on("click", () => addReviewPrompt(gameID));
    $("#deleteReview").remove();
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
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let favArray = userDoc.data().favorites;
    favArray.push(gameID);

    await updateDoc(doc(db, "GameDB", user.uid), {
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
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let playedArray = userDoc.data().played;
    playedArray.push(gameID);

    await updateDoc(doc(db, "GameDB", user.uid), {
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
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let wantArray = userDoc.data().toplay;
    wantArray.push(gameID);

    await updateDoc(doc(db, "GameDB", user.uid), {
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
    let userDoc = await getDoc(doc(db, "GameDB", auth.currentUser.uid));
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
    let userDoc = await getDoc(doc(db, "GameDB", auth.currentUser.uid));
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

//----Reviews----\\

function addReviewPrompt(gameID) {
  let reviewObj = {};
  addEditPrompt("add", "New Review", "Add review", reviewObj, gameID);
}

async function editReviewPrompt(gameID) {
  let reviewObj;

  try {
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let reviewArray = userDoc.data().reviews;

    reviewArray.forEach((review) => {
      if (review.gameId == gameID) {
        reviewObj = review;
      }
    });
  } catch (error) {
    console.log(error.message);
  }

  addEditPrompt("edit", "Edit Review", "Update review", reviewObj, gameID);
}

function addEditPrompt(type, title, buttonText, reviewObj, gameID) {
  let reviewText;

  if (type == "add") {
    reviewText = "";
  } else if (type == "edit") {
    reviewText = reviewObj.reviewText;
  }

  Swal.fire({
    title: `${title}`,
    background: "#555a68",
    color: `#e9e3e3`,
    confirmButtonText: `${buttonText}`,
    confirmButtonColor: "#04724D",
    showCancelButton: true,
    cancelButtonText: "Cancel",
    cancelButtonColor: "#e15554",
    html: `
            <textarea id="reviewText" class="swal2-textarea" placeholder="Review here...">${reviewText}</textarea>
            <div id="starScore">
              <div class="star" id="st1">
                <div id="score_0.5" class="st-l"></div>
                <div id="score_1" class="st-r"></div>
              </div>
              <div class="star" id="st2">
                <div id="score_1.5" class="st-l"></div>
                <div id="score_2" class="st-r"></div>
              </div>
              <div class="star" id="st3">
                <div id="score_2.5" class="st-l"></div>
                <div id="score_3" class="st-r"></div>
              </div>
              <div class="star" id="st4">
                <div id="score_3.5" class="st-l"></div>
                <div id="score_4" class="st-r"></div>
              </div>
              <div class="star" id="st5">
                <div id="score_4.5" class="st-l"></div>
                <div id="score_5" class="st-r"></div>
              </div>
            </div>
          `,
    preConfirm: () => {
      let reviewText = $("#reviewText").val();
      let starScore = $(".checked").attr("id").split("_")[1];
      let reviewObj = {};

      if (type == "add") {
        reviewObj = {
          reviewText: reviewText,
          starScore: starScore.toString(),
          likes: [],
          gameId: gameID,
          user: auth.currentUser.displayName,
        };

        addReview(reviewObj, gameID);
      } else if (type == "edit") {
        reviewObj = {
          reviewText: reviewText,
          starScore: starScore.toString(),
        };

        editReview(reviewObj, gameID);
      }
    },
  });

  if (type == "edit") {
    starSelector(parseFloat(reviewObj.starScore));
  } else {
    starSelector();
  }
}

function starSelector(starScore) {
  // 0.5 stars
  $("#score_0.5").on("click", () => {
    $(".st-l").attr("class", "st-l");
    $(".st-r").attr("class", "st-r");
    $("#st1 .st-l").addClass("checked");
    $(".star > *").css("background-color", "#fff");
    $("#st1 .st-l").css("background-color", "#2e7f2e");
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
    $("#st1 > *, #st2 .st-l").css("background-color", "#2e7f2e");
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
    $("#st1 > *, #st2 > *, #st3 > *, #st4 .st-l").css(
      "background-color",
      "#2e7f2e"
    );
  });

  // 4 stars
  $("#st4 .st-r").on("click", () => {
    $(".st-l").attr("class", "st-l");
    $(".st-r").attr("class", "st-r");
    $("#st4 .st-r").addClass("checked");
    $(".star > *").css("background-color", "#fff");
    $("#st1 > *, #st2 > *, #st3 > *, #st4 > *").css(
      "background-color",
      "#2e7f2e"
    );
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

  if (starScore != null) {
    starScore = starScore.toString();
    starScore = starScore.split(".");
    $(`#score_${starScore[0]}\\.${starScore[1]}`).trigger("click");
  }
}

async function addReview(reviewObj, gameID) {
  try {
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let reviewArray = userDoc.data().reviews;

    reviewArray.push(reviewObj); //push new review object to old array

    await updateDoc(doc(db, "GameDB", user.uid), {
      reviews: reviewArray,
    }).then(() => {
      FeedbackMessage("success", "Success", "Review added!");
      checkReviewBtn(1, gameID);
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

async function editReview(updatedObj, gameID) {
  try {
    let user = auth.currentUser;
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    let reviewArray = userDoc.data().reviews;

    reviewArray.forEach((review) => {
      if (review.gameId == gameID) {
        review.reviewText = updatedObj.reviewText;
        review.starScore = updatedObj.starScore;
      }
    });

    await updateDoc(doc(db, "GameDB", user.uid), {
      reviews: reviewArray,
    }).then(() => {
      FeedbackMessage("success", "Success", "Review updated!");
      checkReviewBtn(1, gameID);
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

function deleteReviewPrompt(gameID) {
  Swal.fire({
    title: "Delete your review?",
    background: "#555a68",
    color: `#e9e3e3`,
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "#e15554",
    showCancelButton: true,
    cancelButtonText: "Cancel",
    cancelButtonColor: "#04724D",
    preConfirm: () => {
      deleteReview(gameID);
    },
  });
}

async function deleteReview(gameID) {
  try {
    let userDoc = await getDoc(doc(db, "GameDB", auth.currentUser.uid));
    let reviewArray = userDoc.data().reviews;

    reviewArray.forEach((review, idx) => {
      if (review.gameId == gameID) {
        reviewArray.splice(idx, 1);
      }
    });

    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      reviews: reviewArray,
    }).then(() => {
      FeedbackMessage("success", "Success", "Review deleted.");
      checkReviewBtn(0, gameID);
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

/*
  author: Matthew Wolf
  file: detail.js
  purpose: functions for displaying the details page
*/

import { auth, apiKey } from "../../credentials";
import { addUserButtons } from "./buttons";
import {
  CloseLoading,
  FeedbackMessage,
  LoadingMessage,
  getAllDocs,
} from "../../extras";
import { checkLikeBtn } from "./reviews";

//----Detail page----\\

export async function viewDetails(gameID) {
  let url = `https://api.rawg.io/api/games/${gameID}?key=${apiKey}`;

  try {
    await fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        $(".banner-container").css(
          "background-image",
          `linear-gradient(rgba(66, 62, 62, 0.7), rgba(0, 0, 0, 0.7)),
          url(${data.background_image})`
        );
        $(".banner-container p").html(`${data.name}`);

        leftBar(data, gameID);
        rightContent(data, gameID);
      })
      .then(async () => {
        await showReviews(gameID);
        CloseLoading();
      });
  } catch (error) {
    const errorTimeout = setTimeout(() => {
      viewDetails(gameID);
    }, 3000);
  }
}

function leftBar(data, gameID) {
  let rating;

  if (data.esrb_rating === null) {
    rating = "No  rating";
  } else {
    rating = data.esrb_rating.slug;
  }

  $("#genres").empty();

  //genres
  data.genres.forEach((genre, idx) => {
    idx != 0 ? $("#genres").append(` | `) : idx;
    $("#genres").append(`<span>${genre.name}</span>`);
  });

  $("#tags").empty();

  //tags
  data.tags.forEach((tag, idx) => {
    idx != 0 ? $("#tags").append(` | `) : idx;
    $("#tags").append(`<span>${tag.name}</span>`);
  });

  $("#stores").empty();

  //storefronts
  data.stores.forEach((store, idx) => {
    idx != 0 ? $("#stores").append(` | `) : idx;
    $("#stores").append(
      `<a href="http://${store.store.domain}">${store.store.name}</a>`
    );
  });

  //rating image
  if (rating == "No ESRB rating") {
    $(".detail-left img").attr("alt", rating);
    $(".detail-left img").css("width", "100%");
  } else {
    $(".detail-left img").attr("src", `./assets/esrb_${rating}.png`);
  }

  //if logged in, display user buttons
  if (auth.currentUser != null) {
    addUserButtons(gameID, data.name);
  }
}

function rightContent(data) {
  $("#pubs").empty();
  $("#devs").empty();
  $(".detail-bar .platforms").empty();

  let date = new Date(data.released);
  var dobArr = date.toDateString().split(" ");
  var dobFormat = dobArr[2] + " " + dobArr[1] + " " + dobArr[3];
  let metascore = data.metacritic;

  if (date == null) {
    date = "TBA";
  } else if (metascore == null) {
    metascore = "N/A";
  }

  $(".detail-bar h4").html(`${dobFormat}`);

  //metascore with color based on score
  $(".detail-bar .metascore h3").html(`${metascore}`);
  if (metascore <= 100 && metascore >= 75) {
    $(".detail-bar .metascore h3").css("background-color", "#66CC33");
    $(".detail-bar .metascore h3").css("color", "#fff");
  } else if (metascore <= 74 && metascore >= 50) {
    $(".detail-bar .metascore h3").css("background-color", "#FFCC33");
    $(".detail-bar .metascore h3").css("color", "#000");
  } else if (metascore <= 49 && metascore >= 0) {
    $(".detail-bar .metascore h3").css("background-color", "#FF0000");
    $(".detail-bar .metascore h3").css("color", "#fff");
  }

  //display platforms on top bar
  data.parent_platforms.forEach((platform) => {
    platform = platform.platform.slug;
    platform == "pc" ? (platform = "windows") : platform;
    platform == "mac" ? (platform = "apple") : platform;
    $(".detail-bar .platforms").append(
      `<i class="fa-brands fa-${platform}"></i>`
    );
  });

  //display devs and publishers in page
  data.developers.forEach((dev) => {
    $("#devs").append(`${dev.name}`);
    dev.name != data.developers[data.developers.length - 1].name
      ? $("#devs").append(", ")
      : "";
  });

  data.publishers.forEach((pub) => {
    $("#pubs").append(`${pub.name}`);
    pub.name != data.publishers[data.publishers.length - 1].name
      ? $("#pubs").append(", ")
      : "";
  });

  if (data.background_image_additional === null) {
    $("#banner-2").css("display", "none");
    $("#dev-pub").css("margin-bottom", "20px");
  } else {
    $("#banner-2").attr("src", data.background_image_additional);
  }

  $("#desc").html(data.description);
}

//----Reviews display----\\

export async function showReviews(gameID) {
  $("#reviewGallery").empty();

  try {
    const querySnapshot = await getAllDocs();
    let avgScore = 0;
    let idx = 0;

    //each user
    querySnapshot.forEach((doc) => {
      doc = doc.data();

      //thier reviews
      doc.reviews.forEach((review) => {
        //their review for the game on page
        if (review.gameId == gameID) {
          calcAvg(review.starScore, idx);
          let score = review.starScore;
          let stars = ("" + score).split(".")[0];
          let starHalf = ("" + score).split(".")[1];
          let likeCheck = 0;
          let likeCount = review.likes.length;
          likeCount == undefined ? (likeCheck = 0) : likeCount;

          if ($(`#review${idx}`).length == 0) {
            $("#reviewGallery").append(`
            <div class="review-item" id="review${idx}">
              <div class="review-top">
                <h3><span>Review by </span><a href="#user?user=${doc.username}">${doc.username}</a></h3>
                <span id="review-score"></span>
              </div>
              <p class="review-text">${review.reviewText}</p>
              <button id="likeBtn" class="to-like"><i class="fa-solid fa-heart"></i> ${likeCount} Likes</button>
            </div>
          `);

            if (review.reviewText.length > 300) {
              $(`#review${idx} .review-text`).addClass("long-review");
              $(`#review${idx} .review-text`).append(
                `<div class="fade"></div>`
              );
              $(`#review${idx}`).append(
                `<button id="readMore${idx}">Read more</button>`
              );
              $(`#readMore${idx}`).on("click", () => {
                showFullReview(idx);
              });
            }

            //apply stars to review
            for (let i = 1; i <= stars; i++) {
              $(`#review${idx} .review-top #review-score`).append(`&#9733;`);
            }

            //apply half star to review
            if (starHalf != undefined) {
              $(`#review${idx} .review-top #review-score`).append(`&#189;`);
            }
          }

          if (auth.currentUser === null) {
            $(".reviewItem button").attr("class", null).css("cursor", "auto");
          } else {
            review.likes.forEach((username) => {
              if (auth.currentUser.displayName == username) {
                likeCheck++;
              }
            });

            checkLikeBtn(idx, doc.username, gameID, likeCheck, likeCount);
          }
          idx++;
        }
      });
    });

    function calcAvg(score) {
      avgScore += parseFloat(score);
    }

    if (avgScore > 0) {
      avgScore /= idx;
      avgScore = Math.round(avgScore * 100) / 100;
    }

    avgScore.toString();

    $("#reviewAvg").html(`Average Rating: ${avgScore} Stars`);
    if ($(".review-item").length == 0) {
      $("#reviewGallery").html(
        `<p id="emptyText">No reviews here yet. You can be the first!</p>`
      );
    }
  } catch (error) {
    const errorTimeout = setTimeout(() => {
      showReviews(gameID);
    }, 3000);
  }
}

function showFullReview(idx) {
  idx = idx - 1;
  $(`#review${idx} .review-text`).removeClass("long-review");
  $(`#review${idx} .review-text .fade`).remove();
  $(`#review${idx} #readMore${idx}`).remove();
}

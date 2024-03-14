/*
  author: Matthew Wolf
  file: detail.js
  purpose: holds functions for the details page
*/

import { auth, db, apiKey } from "../credentials";
import { collection, getDocs, query, updateDoc } from "firebase/firestore";
import { addUserButtons } from "./buttons";
import { CloseLoading, FeedbackMessage, LoadingMessage } from "../model";

//----SHOW DETAIL PAGE----\\

export function viewDetails(gameID) {
  LoadingMessage();
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
  }).then(() => {
    CloseLoading();
  });
  
  showReviews(gameID);
}

//----REVIEWS----\\

export async function showReviews(gameID) {
  $("#reviewGallery").empty();

  try {
    const q = query(collection(db, "GameDB"));
    const querySnapshot = await getDocs(q);
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

          $("#reviewGallery").append(`
            <div class="review-item" id="review${idx}">
              <div class="review-top">
                <h3><span>Review by </span><a href="#user?user=${review.user}">${review.user}</a></h3>
                <span id="review-score"></span>
              </div>
              <p class="review-text">${review.reviewText}</p>
              <button class="to-like"><i class="fa-solid fa-heart"></i> ${likeCount} Likes</button>
            </div>
          `);

          //apply stars to review
          for (let i = 1; i <= stars; i++) {
            $(`#review${idx} .review-top #review-score`).append(`&#9733;`);
          }

          //apply half star to review
          if (starHalf != undefined) {
            $(`#review${idx} .review-top #review-score`).append(`&#189;`);
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
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

function checkLikeBtn(reviewIndex, username, gameID, check, likeCount) {
  //like is added
  if (check == 1) {
    $(`#review${reviewIndex} .to-like`).attr("class", "liked");
    $(`#review${reviewIndex} button`).html(
      `<i class="fa-solid fa-heart"></i> ${likeCount} Likes`
    );
    $(`#review${reviewIndex} .liked`).prop("onclick", null).off("click");
    $(`#review${reviewIndex} .liked`).on("click", () =>
      removeLike(reviewIndex, username, gameID)
    );
  } else {
    $(`#review${reviewIndex} .liked`).attr("class", "to-like");
    $(`#review${reviewIndex} button`).html(
      `<i class="fa-solid fa-heart"></i> ${likeCount} Likes`
    );
    $(`#review${reviewIndex} .to-like`).prop("onclick", null).off("click");
    $(`#review${reviewIndex} .to-like`).on("click", () =>
      addLike(reviewIndex, username, gameID)
    );
  }
}

async function addLike(reviewIndex, username, gameID) {
  try {
    const q = query(collection(db, "GameDB"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      //if the user matches the one to be liked
      if (doc.data().username == username) {
        let reviewArr = doc.data().reviews;

        //for each of their reviews
        reviewArr.forEach((review, idx) => {
          //find the review for the game you liked
          if (review.gameId == gameID) {
            let likesArr = review.likes;
            let likeCount = 0;

            likesArr.push(auth.currentUser.displayName);
            likeCount = likesArr.length;

            reviewArr[idx] = {
              gameId: review.gameId,
              likes: likesArr,
              reviewText: review.reviewText,
              starScore: review.starScore,
              user: review.user,
            };

            updateLikes(
              doc.ref,
              reviewArr,
              reviewIndex,
              username,
              gameID,
              1,
              likeCount
            );
          }
        });
      }
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

async function removeLike(reviewIndex, username, gameID) {
  try {
    const q = query(collection(db, "GameDB"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      //if the user matches the targeted one
      if (doc.data().username == username) {
        let reviewArr = doc.data().reviews;

        //for each of their reviews
        reviewArr.forEach((review, idx) => {
          //find the review for the game you liked
          if (review.gameId == gameID) {
            let likesArr = review.likes;
            let likeCount = 0;

            likesArr.forEach((name, idx) => {
              if (name == auth.currentUser.displayName) {
                likesArr.splice(idx, 1);
                likeCount = likesArr.length;
              }
            });

            reviewArr[idx] = {
              gameId: review.gameId,
              likes: likesArr,
              reviewText: review.reviewText,
              starScore: review.starScore,
              user: review.user,
            };

            updateLikes(
              doc.ref,
              reviewArr,
              reviewIndex,
              username,
              gameID,
              0,
              likeCount
            );
          }
        });
      }
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

async function updateLikes(
  ref,
  reviewArr,
  reviewIndex,
  username,
  gameID,
  check,
  likeCount
) {
  try {
    await updateDoc(ref, { reviews: reviewArr }).then(() => {
      checkLikeBtn(reviewIndex, username, gameID, check, likeCount);
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

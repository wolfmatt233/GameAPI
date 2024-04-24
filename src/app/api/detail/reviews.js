import { auth, db } from "../../credentials";
import Swal from "sweetalert2";
import { doc, updateDoc } from "firebase/firestore";
import { showReviews } from "./detail";
import { showUserReviews } from "../../user/display-user-info";
import {
  FeedbackMessage,
  checkProfanity,
  getAllDocs,
  getUserDoc,
} from "../../extras";

//----Reviews----\\

export function checkReviewBtn(check, gameID, name) {
  if (check == 1) {
    //you have added a review
    $("#addReview")
      .attr("id", "addedReview")
      .attr("class", "addedBtn-review")
      .html(`Edit Your Review <i class="fa-solid fa-check"></i>`);
    $("#addedReview").prop("onclick", null).off("click");
    $("#addedReview").on("click", () => editReviewPrompt(gameID, name));
    if ($("#deleteReview").length == 0) {
      $(".detail-buttons").append(
        `<button id="deleteReview">Delete Review <i class="fa-solid fa-trash"></i></button>`
      );
    }
    $("#deleteReview").on("click", () => deleteReviewPrompt(gameID, name));
  } else {
    //game NOT reviewed
    $("#addedReview")
      .attr("id", "addReview")
      .attr("class", "")
      .html(`Add Review <i class="fa-solid fa-plus"></i>`);
    $("#addReview").prop("onclick", null).off("click");
    $("#addReview").on("click", () => addPrompt(gameID, name));
    $("#deleteReview").remove();
  }
}

//----Modal/functions for add, edit, delete----\\

export async function editReviewPrompt(gameID, name) {
  let reviewObj;

  try {
    let userDoc = await getUserDoc();
    let reviewArray = userDoc.data().reviews;

    reviewArray.forEach((review) => {
      if (review.gameId == gameID) {
        reviewObj = review;
      }
    });
  } catch (error) {
    console.log(error.message);
  }

  editPrompt(reviewObj, gameID, name);
}

export function addPrompt(gameID, name) {
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

      if (checkProfanity([reviewText]) == true) {
        return Swal.showValidationMessage(`No profanity allowed`);
      }

      reviewText = reviewText.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi,
        ""
      );

      let reviewObj = {
        reviewText: reviewText,
        starScore: starScore.toString(),
        likes: [],
        gameId: gameID,
        gameName: name,
      };

      addReview(reviewObj, gameID, name);
    },
  });

  starSelector();
}

export function editPrompt(reviewObj, gameID, name) {
  let reviewText = reviewObj.reviewText;

  Swal.fire({
    title: "Edit Review",
    background: "#555a68",
    color: `#e9e3e3`,
    confirmButtonText: "Update review",
    confirmButtonColor: "#04724D",
    showCancelButton: true,
    cancelButtonText: "Cancel",
    cancelButtonColor: "#e15554",
    html: `
      <h3 id="editReviewTitle">Review for ${reviewObj.gameName}</h3>
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
      reviewText = $("#reviewText").val();
      let starScore = $(".checked").attr("id").split("_")[1];

      if (checkProfanity([reviewText]) == true) {
        return Swal.showValidationMessage(`No profanity allowed`);
      }

      reviewText = reviewText.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi,
        ""
      );

      reviewObj = {
        reviewText: reviewText,
        starScore: starScore.toString(),
      };

      editReview(reviewObj, gameID, name);
    },
  });

  starSelector(parseFloat(reviewObj.starScore));
}

export function starSelector(starScore) {
  // 0.5 stars
  $("#st1 .st-r").on("click", () => {
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

  if (starScore) {
    starScore = starScore.toString();
    let halfScore = starScore.split(".")[1];
    starScore = starScore.split(".")[0];
    if (halfScore != undefined) {
      $(`#score_${starScore}\\.${halfScore}`).trigger("click");
    } else {
      $(`#score_${starScore}`).trigger("click");
    }
  }
}

export function deleteReviewPrompt(gameID, name) {
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
      deleteReview(gameID, name);
    },
  });
}

//----Add, edit, delete functions----\\

export async function addReview(reviewObj, gameID, name) {
  try {
    let userDoc = await getUserDoc();
    let reviewArray = userDoc.data().reviews;

    reviewArray.push(reviewObj);

    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      reviews: reviewArray,
    }).then(() => {
      FeedbackMessage("success", "Success", "Review added!");
      checkReviewBtn(1, gameID, name);
      showReviews(gameID);
    });
  } catch (error) {
    console.log(error.message);
  }
}

export async function editReview(updatedObj, gameID, name) {
  try {
    let userDoc = await getUserDoc();
    let reviewArray = userDoc.data().reviews;

    reviewArray.forEach((review) => {
      if (review.gameId == gameID) {
        review.reviewText = updatedObj.reviewText;
        review.starScore = updatedObj.starScore;
      }
    });

    await updateDoc(doc(db, "GameDB", auth.currentUser.uid), {
      reviews: reviewArray,
    }).then(() => {
      FeedbackMessage("success", "Success", "Review updated!");
      if (window.location.hash.split("?")[0] == "#user") {
        showUserReviews();
      }
      checkReviewBtn(1, gameID, name);
      showReviews(gameID);
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

export async function deleteReview(gameID, name) {
  try {
    let userDoc = await getUserDoc();
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
      if (window.location.hash.split("?")[0] == "#user") {
        showUserReviews(); //refresh user page reviews
      }
      checkReviewBtn(0, gameID, name);
      showReviews(gameID); //refresh detail page reviews
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

//----Likes for reviews----\\

export function checkLikeBtn(reviewIndex, username, gameID, check, likeCount) {
  //like is added
  if (check == 1) {
    $(`#review${reviewIndex} .to-like`).attr("class", "liked");
    $(`#review${reviewIndex} #likeBtn`).html(
      `<i class="fa-solid fa-heart"></i> ${likeCount} Likes`
    );
    $(`#review${reviewIndex} .liked`).prop("onclick", null).off("click");
    $(`#review${reviewIndex} .liked`).on("click", () =>
      removeLike(reviewIndex, username, gameID)
    );
  } else {
    $(`#review${reviewIndex} .liked`).attr("class", "to-like");
    $(`#review${reviewIndex} #likeBtn`).html(
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
    const querySnapshot = await getAllDocs();

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

            console.log(reviewArr);

            reviewArr[idx] = {
              gameId: review.gameId,
              likes: likesArr,
              reviewText: review.reviewText,
              starScore: review.starScore,
            };
            console.log("after", reviewArr);

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
    console.log(error);
  }
}

async function removeLike(reviewIndex, username, gameID) {
  try {
    const querySnapshot = await getAllDocs();

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
    console.log(error);
  }
}

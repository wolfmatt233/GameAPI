import { auth, db } from "../../credentials";
import Swal from "sweetalert2";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { showReviews } from "./detail";
import { showUserReviews } from "../../user/display-user-info";

//----Reviews----\\

export function checkReviewBtn(check, gameID, name) {
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
    $("#addReview").on("click", () => addReviewPrompt(gameID, name));
    $("#deleteReview").remove();
  }
}

//----Modal/functions for add, edit, delete----\\

export function addEditPrompt(
  type,
  title,
  buttonText,
  reviewObj,
  gameID,
  name
) {
  let reviewText;

  if (type == "add") {
    reviewText = "";
  } else if (type == "edit") {
    reviewText = reviewObj.reviewText;
    name = reviewObj.name;
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
          gameName: name,
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

  if (starScore != null) {
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

export function addReviewPrompt(gameID, name) {
  let reviewObj = {};
  addEditPrompt("add", "New Review", "Add review", reviewObj, gameID, name);
}

export async function editReviewPrompt(gameID) {
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

export function deleteReviewPrompt(gameID) {
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

//----Add, edit, delete functions----\\

export async function addReview(reviewObj, gameID) {
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

export async function editReview(updatedObj, gameID) {
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
      showUserReviews();
      checkReviewBtn(1, gameID);
    });
  } catch (error) {
    FeedbackMessage("error", "Error", error.message);
  }
}

export async function deleteReview(gameID) {
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
      showUserReviews();
      checkReviewBtn(0, gameID);
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

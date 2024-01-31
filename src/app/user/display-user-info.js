import { doc, getDoc } from "firebase/firestore";

export function loggedInButtons(user) {
  if (user !== null) {
    $(".nav-container").empty().append(`
    <a href="#browse" class="nav-link">Browse</a>
    <a id="nav-user" href="#user-personal" class="nav-link">
      <span>${user.displayName}</span>
      <i class="fa-solid fa-user"></i>
    </a>
    <button id="logout-btn">
      Log Out
      <i class="fa-solid fa-arrow-right-from-bracket"></i>
    </button>
  `);
  } else {
    $(".nav-container").empty().append(`
      <a href="#browse" class="nav-link">Browse</a>
      <button id="login-btn">Log In</button>
      <button class="signup-btn">Create Account</button>
    `);
  }
}

export async function showUserInfo(user, db, apiKey) {
  try {
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    userDoc = userDoc.data();

    $("#top-five .grid-row").html("");
    $("#user-content #user-info-name").html(`${user.displayName}`);
    if (user.photoURL !== null) {
      $(".user-pic-name img").attr("src", user.photoURL);
    }
    $("#user-info-bio").html(`${userDoc.bio}`); //show bio

    //search api for top five games
    userDoc.topfive.forEach((gameID) => {
      let url = `https://api.rawg.io/api/games/${gameID}?key=${apiKey}`;
      $.getJSON(url, (data) => {
        let year = data.released.split("-");
        $("#top-five .grid-row").append(`
          <a href="#detail_${gameID}" class="user-grid-item">
            <img src="${data.background_image}" alt="image" />
            <div class="item-details">
              <div>
                <p class="details-title">${data.name}</p>
                <p class="details-year">${year[0]}</p>
              </div>
            </div>
          </a>
        `);
      });
    });

    //if top five is not full, replace last few on page with empty containers
    if (userDoc.topfive.length - 5 !== 0) {
      let count = userDoc.topfive.length - 5;
      for (let i = 0; i < count; i++) {
        $("#top-five .grid-row").append(`
          <a class="user-grid-item">
            <img src="./assets/plus.png" alt="" />
            <div class="item-details">
              <div>
                <p class="details-title"></p>
                <p class="details-year"></p>
              </div>
            </div>
          </a>
        `);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

export async function showUserItems(user, db, apiKey, title) {
  try {
    let accessArray = [];
    let userDoc = await getDoc(doc(db, "GameDB", user.uid));
    userDoc = userDoc.data();

    $("#user-title").html(title);

    if (title == "Favorites") {
      accessArray = userDoc.favorites;
    } else if(title == "To Play") {
      accessArray = userDoc.toplay
    } else if(title == "Played") {
      accessArray = userDoc.played
    }
    accessArray.forEach((gameID) => {
      let url = `https://api.rawg.io/api/games/${gameID}?key=${apiKey}`;

      $.getJSON(url, (data) => {
        let year = data.released.split("-");
        $("#user-content #browse-grid").append(`
          <a href="#detail_${gameID}" class="grid-item">
            <img src="${data.background_image}" alt="image" />
            <div class="item-details">
              <div>
                <p class="details-title">${data.name}</p>
                <p class="details-year">${year[0]}</p>
              </div>
            </div>
          </a>
        `);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
}

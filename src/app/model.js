export function changeRoute() {
  let hashTag = window.location.hash;
  let pageID = hashTag.replace("#", "");

  switch (pageID) {
    case "":
      $.get(`pages/home.html`, (data) => {
        $("#app").html(data);
      });
      break;
  }
}

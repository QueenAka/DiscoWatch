const id = document.querySelector("awid").innerHTML;
run();

function run() {
  fetch(`/api/${id}/status`)
    .then((res) => res.json())
    .then((data) => {
      const card = document.querySelector("#image");
      const actsElm = document.getElementById("activities");
      actsElm.innerHTML = "";
      const statusElm = document.getElementById("status");
      const hstatus = ["Online", "Offline", "Do Not Disturb", "Idle"];
      const mstatus = ["online", "offline", "dnd", "idle"];
      statusElm.innerText = hstatus[mstatus.indexOf(data.status)];
      const statusIcon = document.createElement("img");
      statusIcon.src = `/icons/${data.status}.svg`;
      statusIcon.classList = "status-icon";
      card.appendChild(statusIcon);
      data.activities.forEach((act) => {
        if (act.type == 4) statusElm.innerText = act.state;
        else {
          const acts = ["Playing", "Streaming", "Listening to", "Watching"];
          const actElm = document.createElement("div");
          actElm.classList = "act";
          const actName = document.createElement("span");
          actName.classList = "act-name";
          actName.innerText = `${acts[act.type]} ${act.name}`;
          const actDetails = document.createElement("span");
          actDetails.classList = "act-details";
          actDetails.innerText = act.details;
          const actState = document.createElement("span");
          actState.classList = "act-state";
          actState.innerText = act.state;
          const actImg = document.createElement("img");
          let imgSrc = "/icons/missing.svg";
          if (act.assets) {
            imgSrc = act.assets.largeImage;
            if (imgSrc && imgSrc.startsWith("spotify:")) {
              imgSrc = `https://i.scdn.co/image/${imgSrc.split(":")[1]}`;
            } else if (imgSrc) {
              imgSrc = `https://cdn.discordapp.com/app-assets/${act.applicationId}/${imgSrc}`;
            }
          }
          actImg.src = imgSrc;
          actElm.appendChild(actImg);
          const actShit = document.createElement("div");
          actShit.classList = "act-shit";
          actShit.appendChild(actName);
          actShit.appendChild(actDetails);
          actShit.appendChild(actState);
          actElm.appendChild(actShit);
          actsElm.appendChild(actElm);
        }
      });
    });
}

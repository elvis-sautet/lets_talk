let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = {
  audioTrack: null,
  videoTrack: null,
};

let config = {
  appID: "enter your app id",
  token: "enter your token here",
  uid: null,
  channel: "enter your channel name here",
  role: "", //host or audience
  audienceLatency: 2,
};

let remoteTracks = {};

//elements
const joinButton = document.getElementById("join__button");
const videoTrackDiv = document.getElementById("video__tracks");
joinButton.addEventListener("click", async () => {
  await joinStream();
});

//join a stream
let joinStream = async () => {
  try {
    //client joining the stream

    client.on("user-published", handleUserJoined);
    client.on("user-unpublished", handleUserLeft);
    // allow audioTrack and videoTrack to be set to null
    client.setClientRole("audience", {
      level: localTracks.audioTra,
    });

    config.uid = await client.join(
      config.appID,
      config.channel,
      config.token || null,
      config.uid || null
    );

    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();

    //create a video screen and embed it in the page
    let videoPlayer = `<div class="video-screen" id="video-wrapper${config.uid}">
  		<p class="user__id">${config.uid}</p>
		<div class="video__player !h-100 !w-100 relative" id="stream-${config.uid}">
		</div>
		</div>

	`;

    //attach the video screen to the page
    videoTrackDiv.insertAdjacentHTML("beforeend", videoPlayer);

    // play the localvideo tracks
    localTracks.videoTrack.play("stream-" + config.uid);

    //wait to see if the video is playing,and audio is playing
    await client.publish(Object.values(localTracks));
  } catch (error) {
    //later show an alert message to the user;
    console.error("an error occured", error);
  }
};

//subscribe to the remote stream
async function subscribe(user, mediaType) {
  const uid = user.uid;

  //subscribe to a remote user

  if (mediaType === "video") {
    let videoPlayer = `<div class="video-screen" id="video-wrapper${user.uid}">
  		<p class="user__id">${user.uid}</p>
		<div class="video__player !h-100 !w-100 relative" id="stream-${user.uid}">
		</div>
		</div>
	`;

    //attach the video screen to the page
    videoTrackDiv.insertAdjacentHTML("beforeend", videoPlayer);
    user.videoTrack.play(`stream-${user.uid}`, {
      fit: "contain",
    });
  }
  if (mediaType === "audio") {
    user.audioTrack.play();
  }

  await client.subscribe(user.uid, mediaType);
  console.log("subscribe success");
}

//user join the stream
let handleUserJoined = async (user, mediaType) => {
  try {
    console.log("...user joined...", user, mediaType);
    const id = user.uid;
    //set the remote tracks
    remoteTracks[user.id] = user;
    subscribe(user, mediaType);

    //call the subscribe function to subscribe to the remote stream
  } catch (error) {
    console.error("an error occured", error);
  }
};

let handleUserLeft = async (user, mediaType) => {
  try {
    console.log("...user left...", user, mediaType);
    //remove the remote tracks
    delete remoteTracks[user.uid];
    //remove the video screen
    let videoScreen = document.getElementById("video-wrapper" + user.uid);
    videoScreen.remove();
    let audioTrack = document.getElementById("audio-wrapper" + user.uid);
    audioTrack.remove();
  } catch (error) {
    console.error("an error occured", error);
  }
};

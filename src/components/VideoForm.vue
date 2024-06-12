<script setup>
import { ref, onMounted, computed, defineModel, watch } from "vue";
import axios from 'axios'
import SelectSource from "./SelectSource.vue";

import { useGlobal } from '../global.js'
const global = useGlobal()

import { useRouter } from 'vue-router'
const router = useRouter()

import Action from '../components/Action.vue';

const videoDownload = false;
const maxVideosPerHour = 1;
const maxVideoSeconds = 5;

const state = ref("loaded")
const sender = ref(null);
const message = ref(null);

const actionPrimary = ref('choose VIDEO and AUDIO source')

const autoConnect = ref(false);
const videoFormat = "webm";
const recording = ref(false);
const recordingDatetimeStart = ref(null);
const recordingInfoInterval = ref(null);
let recorder = null;
let stream = null;
const sourcesVideo = ref([]);
const sourcesAudio = ref([]);
const sourceVideo = defineModel("sourceVideo", {
  type: String,
  default: null,
});
const sourceAudio = defineModel("sourceAudio", {
  type: String,
  default: null,
});
const sourcesSelected = computed(() => sourceVideo.value && sourceAudio.value);

const getSources = async () => {
  navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  const devices = await navigator.mediaDevices.enumerateDevices();
  sourcesVideo.value = devices.filter((device) => device.kind === "videoinput");
  sourcesAudio.value = devices.filter((device) => device.kind === "audioinput");
};

const logCheck = async () => {
  if (global.isLocalhost.value) {
    console.log("localhost, skipping log check");
    return;
  }
  const timestampLatest = localStorage.getItem("timestamp-latest") || (new Date()).getTime();
  // check difference in hours between now and last check
  const hoursPassed = (new Date() - timestampLatest) / 1000 / 60 / 60;
  if(hoursPassed > 1) localStorage.setItem("video-count", 0);
  const videoCount = localStorage.getItem("video-count") || 0;
  console.log("hoursPassed (from last video) ", hoursPassed, " hour(s) ago, video count", videoCount);
}

const logVideo = async () => {
  localStorage.setItem("timestamp-latest", (new Date()).getTime());
  const videoCount = localStorage.getItem("video-count") || 0;
  localStorage.setItem("video-count", parseInt(videoCount)+1);
}

const isPermissionGranted = async () => {
  try {
    const res = await navigator.permissions.query({ name: "camera" });
    if (res.state === "granted") {
      console.log("Permission granted");
      getSources();
    } else if (res.state === "denied") {
      console.log("Permission denied");
    } else if (res.state === "prompt") {
      console.log("Permission prompt");
      requestCameraAccess();
    }
  } catch (error) {
    console.error("Error checking camera permissions:", error);
  }
};

const requestCameraAccess = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("Camera access granted");
    getSources();
    stream.getTracks().forEach(track => track.stop());
  } catch (error) {
    console.error("Camera access denied:", error);
  }
};


const setRecordingInfo = () => {
  const duration = new Date() - recordingDatetimeStart.value;
  const date = new Date(duration);
  if (duration > maxVideoSeconds * 1000) {
    stopRecording();
    return;
  }
  actionPrimary.value = date.toISOString().substr(11, 8);
};


const setupRecording = async () => {
  // as user form name and message
  sender.value = prompt("enter your name or email", "anonymous");
  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: sourceVideo.value,
    },
    audio: {
      deviceId: sourceAudio.value,
    },
  });
  const videoDiv = document.getElementById("video");
  const video = document.createElement("video");
  //videoDiv.innerHTML = ""; this remove actionPrimary button
  video.style.transform = "scaleX(-1)";
  video.style.height = "100%";
  video.style.objectFit = "cover";
  video.style.borderRadius = "8px";
  videoDiv.appendChild(video);
  video.srcObject = stream;
  video.volume = 0;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("muted", "");
  await video.play();
  state.value = "ready"
  actionPrimary.value = `click to record ${maxVideoSeconds}s`; ;

  // set video and audio sources in local storage to re-use them
  localStorage.setItem("sourceVideo", sourceVideo.value);
  localStorage.setItem("sourceAudio", sourceAudio.value);
};

// async function to convert a blob to base64
const blobToBase64 = async (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      resolve(reader.result);
    };
  });
};


const startRecording = async () => {
  const chunks = [];
  recorder = new MediaRecorder(stream);   
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = async () => {
    console.log("recording stopped");
    await saveVideo(chunks)
  };
  recorder.start();
  recordingDatetimeStart.value = new Date();
  setRecordingInfo();
  recordingInfoInterval.value = setInterval(setRecordingInfo, 1000);
  recording.value = true;
};

const stopRecording = () => {
  recorder.stop();
  clearInterval(recordingInfoInterval.value);
  recording.value = false;
};

const setAutoConnect = () => {
  localStorage.setItem("autoConnect", autoConnect.value);
};


const getIp = async () => {
  const response = await axios.get("https://api.ipify.org?format=json");
  console.log("ip", response.data.ip);
};

onMounted(async () => {
  await logCheck();
  await getIp();
  await getSources()
  await isPermissionGranted()
  autoConnect.value = localStorage.getItem("autoConnect") === "true";
  const previousSourceVideo = localStorage.getItem("sourceVideo");
  const previousSourceAudio = localStorage.getItem("sourceAudio");
  if( 
    autoConnect.value &&
    previousSourceVideo && previousSourceAudio
    && sourcesVideo.value.find((source) => source.deviceId === previousSourceVideo)
    && sourcesAudio.value.find((source) => source.deviceId === previousSourceAudio)
  ) {
    sourceVideo.value = previousSourceVideo;
    sourceAudio.value = previousSourceAudio;
    //setupRecording();
  }
});

watch(sourceAudio, async () => {
  if(sourceVideo.value && sourceAudio.value) {
    await setupRecording();
  }
});


const handleActionPrimary = () => {
  console.log("actionPrimary", actionPrimary.value, "state", state.value);
  switch (state.value) {
    case "loaded":
      break;
    case "ready":
      startRecording();
      state.value = "recording";
      actionPrimary.value = "click to stop";
      break;
    case "recording":
      stopRecording();
      state.value = "saving";
      actionPrimary.value = "saving, please wait...";
      break;
    default:
      break;
  }
}

const saveVideo = async (chunks) => {
  state.value = "saving";
  actionPrimary.value = "Saving";
  const blob = new Blob(chunks, { type: `video/${videoFormat}` });
  const url = URL.createObjectURL(blob);
  if(videoDownload){
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = `video.${videoFormat}`;
    a.click();
    window.URL.revokeObjectURL(url);
  } else {
    const response = await axios.post("/api/create", {
      message: (message.value || ""),
      sender: sender.value,
      video: await blobToBase64(blob),
    });
    console.log("response", response);
    logVideo()
  }

  router.push("/");
  /*
  
  */
};



</script>

<template>
  <div class="flex items-center justify-center h-screen w-full">
    <div class="px-4 py-4 w-full max-w-lg min-w-80">
      <!--<h1 class="text-2xl font-bold mb-2 text-center">Record a video</h1>-->
      <form action="" class="p-0">
        <div class="bg-white rounded-lg p-4">
          <div class="flex items-center">
            <div class="w-4/12 pr-3">
              <label class="" for="autoConnect">Auto connect</label>
            </div>
            <div class="w-8/12">
              <input
                type="checkbox"
                id="autoConnect"
                v-model="autoConnect"
                @change="setAutoConnect"
              />
            </div>
          </div>
          <div v-if="!sourcesSelected" id="sources" class="mt-4">
            <div class="flex items-center">
              <div class="w-4/12 pr-3">
                <label class="" for="source">Video</label>
              </div>
              <div class="w-8/12">
                <SelectSource :sources="sourcesVideo" v-model="sourceVideo" />
              </div>
            </div>
            <template v-if="sourceVideo">
              <div class="flex items-center mt-4">
                <div class="w-4/12 pr-3">
                  <label class="" for="source">Audio</label>
                </div>
                <div class="w-8/12">
                  <SelectSource :sources="sourcesAudio" v-model="sourceAudio" />
                </div>
              </div>
            </template>
          </div>
        </div>

        <div id="video" class="bg-white/25 relative rounded-lg my-4">
          <Action id="actionPrimary" :text="actionPrimary" @click="handleActionPrimary"/>
        </div>
        
        <div v-if="sender" class="bg-white rounded-lg p-4">
          <div>
            <label for="sender" class="block leading-6 text-gray-900">Sender</label>
            <div class="mt-2">
              <input type="text" disabled v-model="sender" name="sender" id="sender" class="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600" :placeholder="sender" aria-describedby="sender-description">
            </div>
          </div>

          <div class="mt-4">
            <div class="mt-2">
              <textarea rows="2" v-model="message" placeholder="optional message" name="message" class="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"></textarea>
            </div>
          </div>
        </div>
      </form>
    </div>

  </div>
</template>

<style lang="scss" scoped>
  #actionPrimary {
    font-size: 5vw;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    white-space: nowrap;

    @media screen and (max-width: 768px){
      font-size: 2.2rem;
      white-space: normal;
      width: 100%;
    }
  }

  .h-screen {
    @media screen and (max-width: 768px) {
      height: 82vh;
    }
  }

  .bg-white {
    box-shadow: 1px 1px 16px rgba(0, 0, 0, 0.3);
  }

  #video {
    aspect-ratio: 4/3;
    backdrop-filter: blur(1rem);
    position: relative;
    display: flex;
    justify-content: center;
  }
</style>
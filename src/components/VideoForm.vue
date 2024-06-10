<script setup>
import { ref, onMounted, computed, defineModel, watch } from "vue";
import axios from 'axios'
import SelectSource from "./SelectSource.vue";

import { useRouter } from 'vue-router'
const router = useRouter()

const autoConnect = ref(false);
const videoFormat = "webm";
const recording = ref(false);
const recordingDatetimeStart = ref(null);
const recordingInfoInterval = ref(null);
const recordingInfo = ref(null);
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

const getSources = async () => {
  navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  const devices = await navigator.mediaDevices.enumerateDevices();
  sourcesVideo.value = devices.filter((device) => device.kind === "videoinput");
  sourcesAudio.value = devices.filter((device) => device.kind === "audioinput");
  console.log("devices", devices);
};

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
  recordingInfo.value = date.toISOString().substr(11, 8);
};


const setupRecording = async () => {
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
  videoDiv.innerHTML = "";
  videoDiv.style.transform = 'scale(-1, 1)';
  videoDiv.appendChild(video);
  video.srcObject = stream;
  video.volume = 0;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("muted", "");
  await video.play();

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
  recorder.onstop = async (e) => {
    const blob = new Blob(chunks, { type: `video/${videoFormat}` });
    const url = URL.createObjectURL(blob);
    const response = await axios.post("/api/create", {
      message: "test video",
      sender: "test sender",
      video: await blobToBase64(blob),
    });
    console.log("response", response);
    router.push("/");
    /*
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = `video.${videoFormat}`;
    a.click();
    window.URL.revokeObjectURL(url);
    */
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

onMounted(async () => {
  //return
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
    setupRecording();
  }
});

watch(sourceAudio, async () => {
  if(sourceVideo.value && sourceAudio.value) {
    await setupRecording();
  }
});
</script>

<template>
  <div class="flex items-center justify-center h-screen w-full">
    <div class="px-4 py-4 w-full max-w-lg">
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
          <div id="sources" class="mt-2">
            <div class="flex items-center mb-2">
              <div class="w-4/12 pr-3">
                <label class="" for="source">Video</label>
              </div>
              <div class="w-8/12">
                <SelectSource :sources="sourcesVideo" v-model="sourceVideo" />
              </div>
            </div>
            <template v-if="sourceVideo">
              <div class="flex items-center mt-2">
                <div class="w-4/12 pr-3">
                  <label class="" for="source">Audio</label>
                </div>
                <div class="w-8/12">
                  <SelectSource 
                    class="mb-1 inline-block" 
                    :sources="sourcesAudio" 
                    v-model="sourceAudio"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>

        <div id="video" class="bg-white/50 rounded-lg overflow-hidden my-4"></div>
        
        <div class="bg-white rounded-lg p-4">
          <div class="mb-4">
            <label for="sender" class="block leading-6 text-gray-900">Sender</label>
            <div class="mt-2">
              <input type="sender" name="email" id="email" class="block w-full rounded-md border-0 p-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="you@example.com" aria-describedby="email-description">
            </div>
          </div>
        
          <label for="message" class="block leading-6 text-gray-900">Add your message</label>
            <div class="mt-2">
              <textarea rows="3" name="message" class="block w-full rounded-md border-0 p-4 mb-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"></textarea>
            </div>
          
          <template v-if="sourceVideo && sourceAudio">
            <button type="submit" @click="() => {recording ? stopRecording() : startRecording()}" class="bg-blue-500 text-white px-4 me-2 py-2 rounded w-full">
              {{ recording ? "Stop recording" : "Record video" }}
            </button>
            <div v-if="recording" class="inline">
              <span>{{ recordingInfo }}</span>
            </div>
          </template>
        </div>
      </form>
    </div>

  </div>
  <a 
    href="" 
    id="instructions"
    @click="() => router.push('/')"
  >
    go back to list...
  </a>
</template>

<style lang="scss" scoped>
  #video {
    aspect-ratio: 4/3;
    backdrop-filter: blur(1rem);
  }
</style>
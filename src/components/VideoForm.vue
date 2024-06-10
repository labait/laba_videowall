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
  <div class="flex justify-center align-middle h-screen ">
    <div class="w-2/3">
      <div class="p-4">
        <h1 class="text-2xl font-bold mb-2 text-center">Record a video</h1>
        <div class="md:flex md:items-center mb-2">
          <div class="md:w-3/12">
            <label class="text-lg " for="autoConnect">Auto connect</label>
          </div>
          <div class="md:w-9/12">
            <input
              type="checkbox"
              id="autoConnect"
              v-model="autoConnect"
              @change="setAutoConnect"
            />
          </div>
        </div>
        <div id="sources" class="mb-2">
          <div class="md:flex md:items-center mb-2">
            <div class="md:w-3/12">
              <label class="text-lg " for="source">Video</label>
            </div>
            <div class="md:w-9/12">
              <SelectSource :sources="sourcesVideo" v-model="sourceVideo" />
            </div>
          </div>
          <template v-if="sourceVideo">
            <div class="md:flex md:items-center mb-2">
              <div class="md:w-3/12">
                <label class="text-lg " for="source">Audio</label>
              </div>
              <div class="md:w-9/12">
                <SelectSource 
                  class="mb-1 inline-block" 
                  :sources="sourcesAudio" 
                  v-model="sourceAudio"
                />
              </div>
            </div>
          </template>
        </div>

        <div id="video" class="mb-2"></div>
        
        <template v-if="sourceVideo && sourceAudio">
          <button @click="() => {recording ? stopRecording() : startRecording()}" class="bg-blue-500 text-white px-4 me-2 py-2 rounded w-full">
            {{ recording ? "Stop recording" : "Record video" }}
          </button>
          <div v-if="recording" class="inline">
            <span>{{ recordingInfo }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
<script setup>
import { ref, onMounted, computed, defineModel } from "vue";
import SelectSource from "./SelectSource.vue";

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
  videoDiv.appendChild(video);
  video.srcObject = stream;
  video.volume = 0;
  await video.play();
};


const startRecording = async () => {
  const chunks = [];
  recorder = new MediaRecorder(stream);   
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = (e) => {
    const blob = new Blob(chunks, { type: `video/${videoFormat}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = `video.${videoFormat}`;
    a.click();
    window.URL.revokeObjectURL(url);
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

onMounted(async () => {
  await getSources();
});
</script>

<template>
  <div class="flex justify-center">
    <div class="w-1/2">
      <div class="p-4">
        <h1 class="text-2xl font-bold mb-2">Record a video</h1>
        <div id="sources" class="mb-2">
          <div class="md:flex md:items-center mb-2">
            <div class="md:w-1/4">
              <label class="text-lg " for="source">Video</label>
            </div>
            <div class="md:w-3/4">
              <SelectSource :sources="sourcesVideo" v-model="sourceVideo" />
            </div>
          </div>
          <template v-if="sourceVideo">
            <div class="md:flex md:items-center mb-2">
              <div class="md:w-1/4">
                <label class="text-lg " for="source">Audio</label>
              </div>
              <div class="md:w-3/4">
                <SelectSource 
                  class="mb-1 inline-block" 
                  :sources="sourcesAudio" 
                  v-model="sourceAudio"
                  @update:modelValue="setupRecording" 
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

<style lang="">
</style>
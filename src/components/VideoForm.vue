<script setup>
import { ref, onMounted, computed } from "vue";

const recording = ref(false);
const recordingDatetimeStart = ref(null);
const recordingInfoInterval = ref(null);
const recordingInfo = ref(null);
let recorder = null;
let stream = null;

const setRecordingInfo = () => {
  const duration = new Date() - recordingDatetimeStart.value;
  const date = new Date(duration);
  recordingInfo.value = date.toISOString().substr(11, 8);
};

const setVideo = async () => {
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const videoDiv = document.getElementById("video");
  const video = document.createElement("video");
  videoDiv.innerHTML = "";
  videoDiv.appendChild(video);
  video.srcObject = stream;
  await video.play();
};

// record the video from the webcam
const startRecording = async () => {
  const chunks = [];
  recorder = new MediaRecorder(stream);   
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = (e) => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = "video.webm";
    a.click();
    window.URL.revokeObjectURL(url);
  };
  recorder.start();
  recordingDatetimeStart.value = new Date();
  setRecordingInfo();
  recordingInfoInterval.value = setInterval(setRecordingInfo, 1000);
  recording.value = true;
  //await new Promise((resolve) => setTimeout(resolve, 5000));
};

const stopRecording = () => {
  recorder.stop();
  clearInterval(recordingInfoInterval.value);
  recording.value = false;
};

onMounted(async () => {
  await setVideo();
});
</script>

<template>
  <div class="flex justify-center">
    <div class="w-1/2">
      <div class="p-4">
        <h1 class="text-2xl font-bold">Video</h1>
        <div id="video" class="mb-4"></div>
        <button @click="() => {
          recording ? stopRecording() : startRecording();
        }" class="bg-blue-500 text-white px-4 me-2 py-2 rounded">
          {{ recording ? "Stop recording" : "Record video" }}
        </button>
        <div v-if="recording" class="inline">
          <span>{{ recordingInfo }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="">
</style>
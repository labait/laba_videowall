<script setup>
import { ref } from "vue";

const recording = ref(false);

// record the video from the webcam
const recordVideo = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const video = document.createElement("video");
  document.body.appendChild(video);
  video.srcObject = stream;
  await video.play();
  const recorder = new MediaRecorder(stream);
  const chunks = [];
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
  recording.value = true;
  await new Promise((resolve) => setTimeout(resolve, 5000));
  recorder.stop();
  recording.value = false;
};
</script>

<template>
  <div>
    <h1>Video Form</h1>
    <button @click="recordVideo">{{ recording ? "Stop recording" : "Record video" }}</button>
  </div>
</template>

<style lang="">
</style>
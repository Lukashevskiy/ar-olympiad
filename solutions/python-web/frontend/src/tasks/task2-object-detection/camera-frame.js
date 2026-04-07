function getArVideoElement() {
  return document.querySelector('video');
}

export async function captureCameraFrame() {
  const video = getArVideoElement();
  if (!video || !video.videoWidth || !video.videoHeight) {
    throw new Error('camera-frame-unavailable');
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  return {
    imageBase64: canvas.toDataURL('image/jpeg', 0.92),
    width: canvas.width,
    height: canvas.height
  };
}

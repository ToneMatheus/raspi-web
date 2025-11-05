import { useEffect, useRef } from "react";
import videoSrc from "../assets/back.mp4";

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.25; // 🎚️ 0.5 = half speed, 2.0 = double speed
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <source src={videoSrc} type="video/mp4" />
    </video>
  );
}

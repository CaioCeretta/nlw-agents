/** biome-ignore-all lint/suspicious/noConsole: dev only */

import { useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

type RoomParams = {
  roomId: string;
};

const isRecordingSupported =
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getUserMedia === "function" &&
  typeof window.MediaRecorder === "function";

export const RecordRoomAudio = () => {
  const params = useParams<RoomParams>();
  const [isRecording, setIsRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  if (!params.roomId) {
    return <Navigate replace to="/" />;
  }

  async function uploadAudio(audio: Blob) {
    /// application/multipart-formdata

    const formData = new FormData();

    formData.append("file", audio, "audio.webm");

    const response = await fetch(
      `http://localhost:3333/rooms/${params.roomId}/audio`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = response.json();

    console.log(result);
  }

  function stopRecording() {
    setIsRecording(false);
    if (recorder.current && recorder.current.state !== "inactive") {
      recorder.current.stop();
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }

  function createRecorder(audio: MediaStream) {
    recorder.current = new MediaRecorder(audio, {
      mimeType: "audio/webm",
      audioBitsPerSecond: 64_000,
    });

    recorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        uploadAudio(event.data);
      }
    };

    recorder.current.onstart = () => {
      console.log("Initiated Recording");
    };

    recorder.current.onstop = () => {
      console.log("Finished Recording");
    };

    recorder.current.start();
  }

  async function startRecording() {
    if (!isRecordingSupported) {
      alert("Your browser does not support recording");
    }

    setIsRecording(true);

    try {
      const audio = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44_100,
        },
      });

      createRecorder(audio);

      intervalRef.current = setInterval(() => {
        recorder.current?.stop();

        createRecorder(audio);
      }, 5000);
    } catch (error) {
      console.error("Error while starting recording:", error);
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      {isRecording ? (
        <div className="flex flex-col items-center">
          <Button onClick={stopRecording}>Stop Recording</Button>
          <p>Stop</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Button onClick={startRecording}>Start Recording</Button>
          <p>Paused</p>
        </div>
      )}
    </div>
  );
};

export default RecordRoomAudio;

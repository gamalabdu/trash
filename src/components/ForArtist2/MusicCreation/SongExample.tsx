import WavesurferPlayer from "@wavesurfer/react";
import React, { useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";

interface ISongExampleProps {
  song: {
    title: string;
    artist: string;
    final: string;
    demo: string;
  };
}

const SongExample = (props: ISongExampleProps) => {


  const { song } = props;

  type Song = {
    title: string;
    artist: string;
    final: string;
    demo: string;
  };

  const [playingDemo, setPlayingDemo] = useState(false);
  const [playingFinal, setPlayingFinal] = useState(false);
  const [wavesurferDemo, setWavesurferDemo] = useState<WaveSurfer | null>(null);
  const [wavesurferFinal, setWavesurferFinal] = useState<WaveSurfer | null>(null);

  const onReadyDemo = (ws: WaveSurfer) => {
    setWavesurferDemo(ws);
    ws.on("finish", () => {
      setPlayingDemo(false);
    });
  };

  const onReadyFinal = (ws: WaveSurfer) => {
    setWavesurferFinal(ws);
    ws.on("finish", () => {
      setPlayingFinal(false);
    });
  };

  const onPlayPauseDemo = () => {
    if (wavesurferDemo) {
      wavesurferDemo.playPause();
      setPlayingDemo(!playingDemo);
    }
  };

  const onPlayPauseFinal = () => {
    if (wavesurferFinal) {
      wavesurferFinal.playPause();
      setPlayingFinal(!playingFinal);
    }
  };

  const screenWidth = window.innerWidth;

  return (
    <div className="song-example">
      <div className="example">
        <div>{song.artist + " - " + song.title + " " + " Demo"}</div>
        <WavesurferPlayer
          height={50}
          width={350}
          waveColor="#b7c0c4"
          url={song.demo}
          onReady={onReadyDemo}
          normalize={true}
        />
        <div className="player-button" onClick={() => onPlayPauseDemo()}>
          {playingDemo ? <FaPause size={screenWidth === 800 ? 30 : 14} /> : <FaPlay size={screenWidth === 800 ? 30 : 14} />}
        </div>
      </div>
      <div className="example">
        <div>{song.artist + " - " + song.title + " " + " Final"}</div>
        <WavesurferPlayer
          height={50}
          width={350}
          waveColor="#b7c0c4"
          url={song.final}
          onReady={onReadyFinal}
          normalize={true}
        />
        <div className="player-button" onClick={() => onPlayPauseFinal()}>
          {playingFinal ? <FaPause size={screenWidth === 800 ? 30 : 14} /> : <FaPlay size={screenWidth === 800 ? 30 : 14} />}
        </div>
      </div>
    </div>
  );
};

export default SongExample;





import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import "./styles.css";
import TextScramble from "@twistezo/react-text-scramble";
import { createClient } from "@sanity/client";
import WavesurferPlayer from "@wavesurfer/react";
import WaveSurfer from "wavesurfer.js";
import { FaPause, FaPlay } from "react-icons/fa";
import SongExample from "./SongExample";
import { Link } from "react-router-dom";

const MusicCreation = () => {


  const title = "Music Creation"

  type Song = {
    title: string;
    artist: string;
    final: string;
    demo: string;
  };

  type CoverArt = {
    title: string
    artist: string
    image: string
    link: string
  }



  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const [songs, setSongs] = useState<Song[]>([]);

  const [ albumCovers, setAlbumCovers ] = useState<CoverArt[]>([])
  

  const [playingDemo, setPlayingDemo] = useState(false);
  const [playingFinal, setPlayingFinal] = useState(false);
  const [wavesurferDemo, setWavesurferDemo] = useState<WaveSurfer | null>(null);
  const [wavesurferFinal, setWavesurferFinal] = useState<WaveSurfer | null>(null);

  const [playing, setPlaying] = useState(false);

  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)


  const sanityClient = createClient({
    projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
    dataset: process.env.REACT_APP_SANITY_DATASET,
    useCdn: true, // set to `false` to bypass the edge cache
    apiVersion: "2024-01-14", // use current date (YYYY-MM-DD) to target the latest API version
    token: process.env.REACT_APP_SANITY_TOKEN,
    ignoreBrowserTokenWarning: true,
  });


  const getMusic = async () => {

    await sanityClient.fetch(`
    *[_type == "productionPage"]{
    title,
    artist,
    final{
      asset->{
        url
      }
    },
    demo{
      asset->{
        url
      }
    },
  }
  `)
  .then((musicData) => {

    let musicDataTemp = musicData;

      let musicEntries: Song[] = musicDataTemp.map((song: any) => ({
        title: song.title,
        artist: song.artist,
        final: song.final.asset.url,
        demo: song.demo.asset.url,
      }));

      setSongs(musicEntries);

  })


  };



  const getAlbumCovers = async () => {

    await sanityClient.fetch(`
    *[_type == "productionPageAlbums"]{
    title,
    artist,
    coverArt{
      asset->{
        url
      }
    },
    link
  }
  `)
  .then((albumWorkData) => {

    let albumWorksDataTemp = albumWorkData;

      let imageEntries: CoverArt[] = albumWorksDataTemp.map((image: any) => ({
        title: image.title,
        artist: image.artist,
        image: image.coverArt.asset.url,
        link: image.link
      }));

      setAlbumCovers(imageEntries);

  })

  }




  useEffect(() => {

    window.scrollTo(0, 0)
    
    document.title = `TRASH - ${title}`; // Update the document title

    getMusic()
    getAlbumCovers()

  }, [])




  const scrambleTexts = ["produce", "mix", "master", "write"];

  const fadeOut = {
    hidden: {
      opacity: 0,
      y: 200,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        ease: "easeInOut",
        duration: 1.6,
      },
    },
    exit: {
      opacity: 0,
      y: -200,
      transition: {
        ease: "easeInOut",
        duration: 1.6,
      },
    },
  };


  const screenWidth = window.innerWidth;



  const onReadyDemo = (ws: WaveSurfer) => {
    setWavesurferDemo(ws);
    setPlayingDemo(false);
    ws.on('finish', () => {
      setCurrentSongIndex((prevIndex) => (prevIndex === songs.length - 1 ? 0 : prevIndex + 1));
      setPlayingDemo(false);
    });
  };

  const onReadyFinal = (ws: WaveSurfer) => {
    setWavesurferFinal(ws);
    setPlayingFinal(false);
    ws.on('finish', () => {
      setCurrentSongIndex((prevIndex) => (prevIndex === songs.length - 1 ? 0 : prevIndex + 1));
      setPlayingFinal(false);
    });
  };



  const onPlayPauseDemo = () => {
    wavesurferDemo && wavesurferDemo.playPause();
    setPlayingDemo(!playingDemo);
  };

  const onPlayPauseFinal = () => {
    wavesurferFinal && wavesurferFinal.playPause();
    setPlayingFinal(!playingFinal);
  };




  return (
    <motion.div
      className="music-creation-container"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={fadeOut}
    >


      <section className="producing">

      <div className="music-creation-top">
        <div className="step1-text">
          Let us help you &nbsp;
          <TextScramble
            className="text-scramble"
            texts={scrambleTexts}
            letterSpeed={20}
            nextLetterSpeed={50}
            pauseTime={1500}
          />
          &nbsp; your next song.
        </div>
      </div>

        <div className="inner-producing">

         <div className="inner-producing-text">

          Have an idea and need help making it come life? <br />
          Or maybe you have a sound in mind but can't seem to find the right
          instrumental? <br />
          Let us help you craft the song:


         </div>
          
          <div className="examples-container">

            {
              songs && songs.map((song,idx) => {

                return (
                  
                  <SongExample song={song} key={idx} />

                );

              })
            }


          </div>


        </div>

      </section>


      <section className="production-page-section">

              {
                albumCovers.map((album) => {
                  return (
                    <div key={album.title} style={{ cursor:"pointer" }}>
                      <Link to={album.link}>
                      <img className="album-covers-image" src={album.image} />
                      </Link>
                    </div>
                  )
                })
              }


      </section>


    </motion.div>
  );
};

export default MusicCreation;


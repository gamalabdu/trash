import React, { useEffect, useRef, useState } from 'react';
import './styles.css';
import axios from 'axios';
import { FaPlay } from "react-icons/fa6";
import { FaPause } from "react-icons/fa6";
import { FaForward } from "react-icons/fa6";
import { FaBackward } from "react-icons/fa6";
import WaveSurfer from 'wavesurfer.js'
import { useWavesurfer } from '@wavesurfer/react'
import WavesurferPlayer from '@wavesurfer/react'
import PasswordPage from './PasswordPage/PasswordPage';

const Portfolio = () => {


    const contentful = require('contentful')

    const client = contentful.createClient({
        space: process.env.REACT_APP_CONTENTFUL_SPACE,
        environment: process.env.REACT_APP_CONTENTFUL_ENVIRONMENT,
        accessToken: process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN,
      })

      

    type SongEntry = {
        title: string,
        artist: string,
        image: string,
        music: string,
        id: number
    }

    const [loading, setLoading] = useState(false);

    const [currentSongIndex, setCurrentSongIndex] = useState(0);

    const [songs, setSongs] = useState<SongEntry[]>([]);

    const [playing, setPlaying] = useState(false);

    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)

    const [password, setPassword] = useState<string>("")
    
    const [authenticated, setAuthenticated] = useState(false);

    const authenticateUser = () => {
      if (password === 'Welcome2024') {
        setAuthenticated(true);
      }
    }


      const onPlayPause = () => {
        wavesurfer && wavesurfer.playPause()
        setPlaying(true)
      }

      const onReady = (ws: WaveSurfer) => {

        setWavesurfer(ws)
        setPlaying(false)

        ws.on('finish', () => {

            setCurrentSongIndex((prevIndex) => (prevIndex === songs.length - 1 ? 0 : prevIndex + 1));
            setPlaying(false);
        })
 
      }




      const handleSongItemClick = (index : number) => {
        setCurrentSongIndex(index);
        setPlaying(true); // Start playing the clicked song
      }



    const screenWidth = window.innerWidth;




    useEffect(() => {


        const getMusic = async () => {

            try {
                
                client.getEntries({
                    content_type: "song",
                    select: 'fields.title,fields.artist,fields.coverArt,fields.music,fields.id',
                  })

                .then( (entry: any) => {

                    let myResponse = entry.items;

                    myResponse.sort((a : any, b : any ) => a.fields.id - b.fields.id);

                    // console.log(myResponse)

                    let songEntries: SongEntry[] = myResponse.map((entry : any) => ({
                                title: entry.fields.title,
                                artist: entry.fields.artist,
                                image: entry.fields.coverArt.fields.file.url,
                                music: entry.fields.music.fields.file.url,
                                id: entry.fields.id
                            }));
            
                            setSongs(songEntries);


                })

                .catch(console.error)
    
                setLoading(true);
    

            } catch (error) {

                console.error("Error fetching music:", error);

            } finally {
                
                setLoading(false);
            }
        }

        getMusic()
        
    }, []);



    if (loading) {

        return <div> Loading... </div>

    }


    


    return (


			<div className='portfolio-container'>
                
                {

                  authenticated ? 

                
                  songs.length === 0 ? 
                
                    null 
                    
                    : 

					<div className='music-player-container'>

						<div className='player-half'>
							<img className='album-work' style={{ opacity: loading ? 0 : 1 }} src={songs[currentSongIndex].image} />
							<div className='artist-name'>{songs[currentSongIndex].artist}</div>
							<div className='song-title'>{songs[currentSongIndex].title}</div>

							<WavesurferPlayer
								height={50}
                                width={350}
								waveColor='#b7c0c4'        
								url={songs[currentSongIndex].music}
								onReady={onReady}
                                normalize={true}
								onPlay={() => setPlaying(true)}
								onPause={() => setPlaying(false)}
							/>
							<div className='buttons-container'>
								<div className='player-btn' onClick={
                                    () => setCurrentSongIndex((prevIndex) => (prevIndex === 0 ? songs.length - 1 : prevIndex - 1))
                                }>
									<FaBackward size={ screenWidth === 800 ? 30 : 14} />
								</div>
								<div
									className='player-btn'
									onClick={() => {
                                        onPlayPause()
										setPlaying(!playing)
									}}>
									{ playing ? <FaPause size={ screenWidth === 800 ? 30 : 14} /> : <FaPlay size={ screenWidth === 800 ? 30 : 14} />}
								</div>
								<div className='player-btn' 
                                onClick={
                                    () => setCurrentSongIndex((prevIndex) => (prevIndex === songs.length - 1 ? 0 : prevIndex + 1))
                                }>
									<FaForward size={ screenWidth === 800 ? 30 : 14} />
								</div>
							</div>
						</div>


                        <div className='song-list-half'>

                            <div className='song-list-container'>
                                    {
                                        songs.map((song,idx) => {
                                            return (
                                                <div 
                                                className={`song-item${idx === currentSongIndex ? '-active' : ''}`} 
                                                key={idx} 
                                                onClick={() => handleSongItemClick(idx)}
                                                >
                                                    {song.artist + ' - ' + song.title}
                                                </div>
                                            )
                                        })
                                    }
                            </div>


                        </div>


					</div>

                    :

                    <PasswordPage password={password} setPassword={setPassword} authenticateUser={authenticateUser} />

				}

			</div>

		)     
}

export default Portfolio;





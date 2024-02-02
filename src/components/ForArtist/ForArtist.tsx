import React from 'react'
import './styles.css'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

const ForArtist = () => {

	const title = 'For Artist'

	const DynamicPage = ( title : string ) => {
		useEffect(() => {
		  document.title = `TRASH - ${title}`; // Update the document title
		}, [title]);
	  }
  
	  DynamicPage(title)

	const googleDriveUrl = 'uc?id='

	const googleUrl = 'uc?export=view&id='

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])

	const fadeOut = {
		hidden: {
			opacity: 0,
			y: 200,
		},
		show: {
			opacity: 1,
			y: 0,
			transition: {
				ease: 'easeInOut',
				duration: 1.6,
			},
		},
		exit: {
			opacity: 0,
			y: -200,
			transition: {
				ease: 'easeInOut',
				duration: 1.6,
			},
		},
	}

	return (
		
		<motion.div
			className='for-artist-container'
			initial='hidden'
			animate='show'
			exit='exit'
			variants={fadeOut}>



			<div className='top-container'>
				<div className='artist-text'> TRASH FOR ARTIST </div>
				<img
					className='trippie'
					src={
						'https://drive.google.com/uc?id=1PkMiKPXIUWt0SUszfr7QsQwLzmek_S3f'
					}
					alt='trippie'
				/>
			</div>

			<div className='intro'>
				<div className='left-intro'>
					<div style={{ width: '100%', padding: '10px', fontSize: '2.5vw' }}>
						<div
							style={{
								fontWeight: '800',
								marginBottom: '16px',
								textDecoration: 'underline',
							}}>
							<div> 1 </div> MUSIC CREATION
						</div>
						Focus on making the music and perfecting your craft. We'll focus on making sure it sounds innovative.
					</div>
				</div>

				<div className='right-intro'>
				Our dedicated team of musicians and instrumentalists work with new and established artists to help develop, produce, mix and master your music. Top to bottom
				</div>
			</div>

			<div className='intro-black'>
				<div className='left-intro-black'>
					<div style={{ width: '100%', padding: '10px', fontSize: '2.5vw' }}>
						<div
							style={{
								fontWeight: '800',
								marginBottom: '16px',
								textDecoration: 'underline',
							}}>
							<div> 2 </div> ASSET CREATION
						</div>
						Our in-house creative team have created artworks, canvases, music videos, digital booklets, press photos, banners, avatars, and graphics that have been seen by millions. 
					</div>
				</div>

				<div className='right-intro-black'>
					<div>
					TRASH prides itself on helping artists find their style while also showcasing our own
					</div>
				</div>
			</div>

			<div className='branding'>
				<div className='left-branding'>
					<div className='left-branding-picture'>
						<img
							className='ellaGhost'
							src={
								'https://drive.google.com/uc?id=1mRkoZskdzDMXeaQr79HwEyzuO_Hl24EA'
							}
							alt='isabella-ghost'
						/>
					</div>

					<div className='left-branding-text'>
						<div> 3 </div>
						<div
							style={{
								fontWeight: '800',
								marginBottom: '16px',
								textDecoration: 'underline',
							}}>
							BRANDING
						</div>
						<div>
						   Research, trend exploration, and audience insights help us create a custom strategy to captivate your listeners. Oftentimes rebranding an already established image but occasionally creating a brand from scratch.
						</div>
					</div>
				</div>

				<div className='right-branding'>
					<img
						src={
							'https://drive.google.com/uc?id=1anSI8o8T6fJUGLf35DNfaucqqyeITAzP'
						}
						className='branding-pic'
						alt='branding-pic'
					/>
				</div>
			</div>

			<div className='digital-black'>
				<div className='left-digital-black'>
					<img
						src={
							'https://drive.google.com/uc?id=1RtRTmR9VEx_qXI8dtwIpU6njPOwuHJX0'
						}
						className='ella-site'
						alt='ella-site'
					/>
				</div>

				<div className='right-digital-black'>
					<div>
						<div> 4 </div>
						<div style={{ textDecoration: 'underline' }}>DIGITAL</div>
						Social Media Management, EPK Development, Artist Website Design, Digital Advertising, Campaign Microsites, Web App. Devo and more...
					</div>
				</div>
			</div>

			<div className='content'>
				<div className='right-content'>
					<video
						className='jaz-canvas'
						src={
							'https://drive.google.com/uc?id=1usYOFrF7Of1isuAtXPb5yQb5slY6dQjO'
						}
						loop
						autoPlay
						muted
						playsInline></video>
				</div>

				<div className='left-content'>
					<div className='left-content-text'>
						<div> 5 </div>
						<div
							style={{
								fontWeight: '800',
								marginBottom: '16px',
								textDecoration: 'underline',
							}}>
							OUTREACH
						</div>
						Access premier opportunities effortlessly through our robust network, thriving since 2009.
					</div>

					<div className='left-branding-picture'>
						<img
							className='ellaGhost'
							src={
								'https://drive.google.com/uc?id=1tnNNOIeB2J9VuBqBRmy2fBcxy-NqUBj-'
							}
							alt='ellaGhost'
						/>
					</div>
				</div>
			</div>


			<div className='growth'>
				
				<div className='right-growth'>
					<img
						src={
							'https://drive.google.com/uc?id=1ruDxnwUWA8LcFpBRjhnaSE78oGK0ubjU'
						}
						className='growth-pic'
						alt='artistGrowth'
					/>
				</div>

				<div className='left-growth'>

					<div className='left-growth-text'>
						<div> 6 </div>
						<div
							style={{
								fontWeight: '800',
								marginBottom: '16px',
								textDecoration: 'underline',
							}}>
							GROWTH
						</div>
						<div>
						Completing our cycle, your product is fully polished and released into the world. We'll ensure that we maximize not only our efforts but our value as well. 
						</div>
					</div>

					<div className='left-branding-picture'>
						<img
							className='ellaGhost'
							src={
								'https://drive.google.com/uc?id=13k_AfXMLI99dE6mv_VHP8ulSxP2doW5o'
							}
							alt='mariaPic'
						/>
					</div>

				</div>



			</div>




		</motion.div>
	)
}

export default ForArtist

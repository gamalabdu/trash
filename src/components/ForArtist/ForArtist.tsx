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
							<div> 1 </div> Create{' '}
						</div>
						Focus on making music and perfecting your craft. We'll focus on
						making sure it sounds great.
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
							<div> 2 </div> Strategy{' '}
						</div>
						Exceptional projects begin with a solid strategy. Research, trend
						exploration, and audience insights help us create a custom strategy
						to captivate your listeners.
					</div>
				</div>

				<div className='right-intro-black'>
					<div>
						Trend Analysis, Cultural Insights, Creative Direction, Campaign
						Strategy, Marketing Plans, and more.
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
							Logo Design, Identity Development, Cover Artwork, Curation,
							Rebranding, and more.{' '}
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
						Artist Website, Advertising, Campaign Microsites, Web Apps and more.
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
							CONTENT
						</div>
						<div>
							Social Content, Video Production, Photography, Copywriting, Email
							Marketing, Press Releases, and more.{' '}
						</div>
					</div>

					<div className='left-branding-picture'>
						<img
							className='ellaGhost'
							src={
								'https://drive.google.com/uc?id=1CKQ13fWGgilWzYVUyZmNQCqdjnuMxs75'
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
							Influencer Marketing, Social Promotion, Social Automation, Email
							Marketing, Monitoring & Analysis, and more.{' '}
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

import React from 'react'
import './styles.css'
import trippie from '../../assets/images/trippie.jpg'
import isabellaGhost from '../../assets/images/2.png'
import ellaSite from '../../assets/images/whitestudio.jpg'
import brandingPic from '../../assets/images/branding.png'
import jazPic from '../../assets/images/3.png'
import jazCanvas from '../../assets/videos/JazCanvas.mp4'
import artistGrowth from '../../assets/images/artistGrowth.jpeg'
import mariaPic from '../../assets/images/1.png'

import { useEffect } from 'react'

const ForArtist = () => {


	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])


	return (
		<div className='for-artist-container'>
			<div className='top-container'>
				<div className='artist-text'> TRASH FOR ARTIST </div>
				<img className='trippie' src={trippie} alt='trippie' />
			</div>

			<div className='intro'>
				<div className='left-intro'>
					{/* <div style={{ alignContent: 'left', width: '10%' }}> 1 </div> */}
					<div style={{ width: '90%' }}>
						<div
							style={{
								fontWeight: '800',
								marginBottom: '16px',
								textDecoration: 'underline',
							}}>
							<div> 1 </div>
							{' '}Create{' '}
						</div>
						Focus on making music and perfecting your craft. We’ll focus on
						making sure it sounds & looks great.
					</div>
				</div>

				<div className='right-intro'>
					Our dedicated team of creatives works with new and established artists
					to grow fanbases through culturally-relevant branding. We handle press
					kits, stage visuals, distribution strategies and everything in
					between.
				</div>
			</div>

			<div className='intro-black'>
				<div className='left-intro-black'>
					{/* <div style={{ alignContent: 'left', width: '10%', fontSize: '3vw' }}>
						{' '}2{' '}
					</div> */}
					<div style={{ width: '100%', padding:"10px", fontSize:"2.5vw" }}>
						<div
							style={{
								fontWeight: '800',
								marginBottom: '16px',
								textDecoration: 'underline',
							}}>
								<div> 2 </div>
							{' '}Strategy{' '}
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
						<img className='ellaGhost' src={isabellaGhost} alt='isabella-ghost' />
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
							Logo Design, Identity Development, Cover Artwork,
							Curation, Rebranding, and more.{' '}
						</div>
					</div>
				</div>

				<div className='right-branding'>
					<img src={brandingPic} className='branding-pic' alt='branding-pic' />
				</div>
			</div>



			<div className='digital-black'>

				<div className='left-digital-black'>
					<img src={ellaSite} className='ella-site' alt='ella-site' />
				</div>

				<div className='right-digital-black'>
					<div>
            <div> 4 </div>
						<div style={{ textDecoration:"underline"}}>DIGITAL</div> 
            Artist Website, Advertising, Campaign
						Microsites, Mobile Apps, Messenger Bots, and more.
					</div>
				</div>

			</div>




      <div className='content'>

				<div className='right-content'>
					<video className='jaz-canvas' src={jazCanvas} loop muted autoPlay={true}></video>
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
            Social Content, Video Production, Photography, Copywriting, Email Marketing, Press Releases, and more.{' '}
						</div>
					</div>

          <div className='left-branding-picture'>
						<img className='ellaGhost' src={jazPic} alt='ellaGhost'/>
					</div>

				</div>

			</div>





      <div className='growth'>


      <div className='right-growth'>
          <img src={artistGrowth} className='growth-pic' alt='artistGrowth' />
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
            Influencer Marketing, Social Promotion, Social Automation, Email Marketing, Monitoring & Analysis, and more.{' '}
						</div>
					</div>

          <div className='left-branding-picture'>
						<img className='ellaGhost' src={mariaPic} alt='mariaPic' />
					</div>

				</div>




			</div>


      





		</div>
	)
}

export default ForArtist

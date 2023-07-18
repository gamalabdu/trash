import React from 'react'
import './styles.css'
import startUp from '../../assets/images/startups.jpeg'
import strategyTeam from '../../assets/images/teamstartup.jpeg'
import badwillsite from '../../assets/images/badwillsitepic.png'
import brandingPic from '../../assets/images/branding.png'
import jazPic from '../../assets/images/3.png'
import productionPic from '../../assets/images/productionPic.png'
import artistGrowth from '../../assets/images/artistGrowth.jpeg'
import mariaPic from '../../assets/images/1.png'
import phoneLikeTrim from '../../assets/videos/phoneLikeTrim.mp4'
import socialMediaGrowth from '../../assets/images/socialMediaGrowth.png'

import { useEffect } from 'react'

const ForClients = () => {


	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])


	return (
		<div className='for-clients-container'>

			<div className='top-container'>
				<div className='artist-text'> TRASH FOR STARTUPS </div>
				<img className='trippie' src={startUp} />
			</div>


			<div className='intro'>
				<div className='left-intro'>
					<div style={{ alignContent: 'left', width: '10%' }}> 1 </div>
					<div style={{ width: '90%' }}>
						<div
							style={{
								fontWeight: '800',
								marginBottom: '16px',
								textDecoration: 'underline',
							}}>
						<div> 1 </div>
							{' '}Detail{' '}
						</div>
						Our proven growth and design strategies keep your consumers in love with your products.
					</div>
				</div>

				<div className='right-intro'>
				We work with early-stage startups to help scale product marketing efforts, go-to-market planning, social strategy, content production, design or anything you'd need out of a scrappy, results-oriented marketing team.
				</div>
			</div>

			<div className='branding'>

			    <div className='right-branding-client'>
				   Position, launch, and grow your early-stage startup. Break into new markets by understanding your audience and reaching them with compelling marketing campaigns.
				</div>


				<div className='left-branding'>
					<div className='left-branding-picture'>
						<img className='ellaGhost' src={strategyTeam} />
					</div>

					<div className='left-branding-text'>
						<div> 2 </div>
						<div
							style={{
								fontWeight: '800',
								marginBottom: '16px',
								textDecoration: 'underline',
							}}>
							STRATEGY
						</div>
						<div>
						Market Research, Persona Development, Go-To-Market Planning, Content Planning, Marketing Automation.{' '}
						</div>
					</div>
				</div>

			</div>



			<div className='digital-black'>

				<div className='left-digital-black'>
					<img src={badwillsite} className='ella-site' />
				</div>

				<div className='right-digital-black'>
					<div>
            <div> 3 </div>
						<div style={{ textDecoration:"underline"}}>DEVELOPEMENT / DESIGN</div> 
						Websites, eCommerce, Web & Mobile Apps, Interactive Prototypes, Plugin Development, Website Maintenance, and more.
					</div>
				</div>

			</div>




      <div className='production'>

				<div className='right-production'>
				<video className='alex-canvas' src={phoneLikeTrim} loop muted autoPlay={true}></video>
				</div>
        

        <div className='left-production'>

					<div className='left-production-text'>
						<div> 4 </div>
						<div
							style={{
								fontWeight: '800',
								marginBottom: '16px',
								textDecoration: 'underline',
							}}>
							PRODUCTION
						</div>
						<div>
						Product Photography, Marketing Videos, Case Studies, Copywriting, Storyboarding, Motion Graphics.{' '}
						</div>
					</div>

                    <div className='left-branding-picture'>
						<img className='ellaGhost' src={productionPic} />
					</div>

				</div>

			</div>





      <div className='growth'>


      <div className='right-branding-client'>
				   Position, launch, and grow your early-stage startup. Break into new markets by understanding your audience and reaching them with compelling marketing campaigns.
				</div>

        
        <div className='left-growth'>

					<div className='left-growth-text'>
						<div> 5 </div>
						<div
							style={{
								fontWeight: '800',
								marginBottom: '16px',
								textDecoration: 'underline',
							}}>
							GROWTH
						</div>
						<div>
						Performance Marketing, Paid Ads, SEO, SEM, KPI Definitions, Monitoring and Analysis.{' '}
						</div>
					</div>

          <div className='left-branding-picture'>
						<img className='social-growth-pic' src={socialMediaGrowth} />
					</div>

				</div>




			</div>


      





		</div>
	)
}

export default ForClients

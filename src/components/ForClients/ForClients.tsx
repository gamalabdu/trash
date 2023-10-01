import React from 'react'
import './styles.css'
import {motion} from 'framer-motion'
import { useEffect } from 'react'

const ForClients = () => {



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
		show : {
      opacity: 1,
			y: 0,
			transition: {
				ease : 'easeInOut',
				duration: 1.6,
			}
		},
		exit : {
            opacity: 0,
			y: -200,
			transition : {
				ease : 'easeInOut',
				duration: 1.6,
			}
		}
	} 


	return (
		<motion.div  className='for-clients-container'
			initial='hidden'
			animate='show'
			exit='exit'
			variants={fadeOut}
			>

			<div className='top-container'>
				<div className='artist-text'> TRASH FOR STARTUPS </div>
				<img className='trippie' src={'https://drive.google.com/uc?id=1e5zssB5ugbjCVvskVVe9sjTA_OoFaLJ4'} alt="trippie" />
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
						<img className='ellaGhost' src={'https://drive.google.com/uc?id=1Z39YCg210t8pjLtUaogYzyxD_ts64A_o'} alt='strategyTeam' />
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
					<img src={'https://drive.google.com/uc?id=1EcYBfG50ouOShPfPyXkTPJMVGCcf1PqO'} className='ella-site' alt='badwillSite' />
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
				<video className='alex-canvas' src={'https://drive.google.com/uc?id=1taomtmKSuCUEJoVvNIhfdoePGdTdU4fm'} 
				loop
				autoPlay
				muted
				playsInline
				></video>
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
						<img className='ellaGhost' src={'https://drive.google.com/uc?id=1xRz-Y2D00ZiGFF_UkvoHJv5JuR3040QX'} alt='productionPic' />
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
						<img className='social-growth-pic' src={'https://drive.google.com/uc?id=1o6CPXQ7_q9-s-dKJnMyRQa2LA1_74FpU'} alt='socialMediaGrowth' />
					</div>

				</div>




			</div>


      





		</motion.div>
	)
}

export default ForClients

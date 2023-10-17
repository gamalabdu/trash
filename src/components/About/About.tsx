import React, { useState } from 'react'
import './styles.css'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {AnimatePresence, motion} from 'framer-motion'
import {BsChevronDown} from 'react-icons/bs'


const About = () => {

	const [services, setServices] = useState(false)

	const [founders, setFounders] = useState(false)

	const [clients, setClients] = useState(false)


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
		<AnimatePresence mode='wait'>
			<motion.div
				className='about-container'
				initial='hidden'
				animate='show'
				exit='exit'
				variants={fadeOut}
				key={'about-container'}>
				<section className='section' id='mission'>
					<div className='about-title'>Our Mission</div>
					<p>
					Our mission at <span style={{color:"#f93b3b"}}>TRASH</span> is to empower artists and creatives by providing
					comprehensive and innovative solutions that enhance their artistic
					vision and amplify their impact. We are a dynamic creative agency
					specializing in website design, artist development, music production,
					visual storytelling, social media assets, graphic design, photography,
					branding, and creative direction. Through our expertise and
					collaborative approach, we strive to elevate artists to new heights,
					equipping them with the tools and resources necessary to succeed in
					the digital era. We are passionate about cultivating unique artistic
					identities and helping artists realize their full potential. At <span style={{color:"#f93b3b"}}>TRASH</span>,
					we believe in the power of creativity to inspire and connect. Our team
					of talented professionals is dedicated to delivering exceptional
					results, combining cutting-edge technology with artistic innovation.
					We collaborate closely with our clients, fostering a supportive
					environment where their ideas can thrive and evolve.
				</p>
				{/* <p>
					By offering services such as music writing, recording, production,
					mixing, and mastering, we enable artists to bring their sonic visions
					to life with precision and excellence. We also specialize in creating
					captivating visuals, developing engaging social media strategies, and
					designing striking graphics that resonate with audiences. Furthermore,
					we take pride in our ability to develop comprehensive rollouts for
					singles and projects, ensuring strategic planning and seamless
					execution at every stage. Our expertise in creative direction and
					branding allows us to craft cohesive and compelling narratives that
					align with the artists' vision and resonate with their target
					audience. Through our unwavering commitment to excellence and our
					passion for artistic expression, we aim to be a trusted partner and a
					driving force behind the success of our clients. We are dedicated to
					delivering exceptional results that exceed expectations, foster
					meaningful connections, and leave a lasting impact on the artistic
					landscape.
				</p>
				<p>
					At <span style={{color:"#f93b3b"}}>TRASH</span>, we are dedicated to transforming dreams into reality, one
					creative project at a time. Join us on this artistic journey as we
					empower artists, shape culture, and create experiences that captivate
					and inspire."
				</p> */}

					<div className='title-head'>
						<div className='title-icon'> Services   <BsChevronDown className={ services ? 'chevron-down' : 'chevron-up'} size={45} onClick={() => setServices(!services)} /> </div>
						<hr />

							<ul className={services ? 'list': 'list-hidden'}>
								<li className='list-item'>Music Production</li>
								<li className='list-item'>Music Promotion</li>
								<li className='list-item'>Content Creation</li>
								<li className='list-item'>Creative Direction</li>
							</ul>
						
					</div>

					<div className='title-head'>

						<div className='title-icon'> Founders <BsChevronDown className={ founders ? 'chevron-down' : 'chevron-up'} size={50} onClick={() => setFounders(!founders)} /> </div>
						<hr />

							<ul className={founders ? 'list': 'list-hidden'}>

								<div style={{ display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"space-evenly", padding:"1%"}}>

									<div style={{ display:"flex", flexDirection:"column",justifyContent:"center"}}>
										<img className='founder' src='https://drive.google.com/uc?id=1KY10Ha4OWjkIPj5dBVd0Qc2qH9hvcC5H' />
										<div style={{ fontSize:"1vw", textAlign:"center", padding:"10px"}}> Gamal Abdu - Music Producer - Co Founder </div>
									</div>

									<div style={{ display:"flex", flexDirection:"column",justifyContent:"center"}}>
										<img className='founder' src='https://drive.google.com/uc?id=1rBfTFdzfwxP8DNO2moMZ6MltAvxXIC_P' />
										<div style={{ fontSize:"1vw", textAlign:"center", padding:"10px"}}> Alejandro Rodriguez - Creative Director - Co Founder </div>
									</div>

								</div>
							</ul>
						
					</div>



				</section>
				
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
					<Link to='/contact'>
						<div className='about-lower-title'> Work With Us </div>
					</Link>
				</div>

			</motion.div>

		</AnimatePresence>
	)
}

export default About

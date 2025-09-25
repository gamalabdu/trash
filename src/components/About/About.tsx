import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BsChevronDown } from 'react-icons/bs'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'


const About = () => {

	const [services, setServices] = useState(false)
	const [founders, setFounders] = useState(false)
	const [clients, setClients] = useState(false)

	// Update document title
	useDocumentTitle('About')


	const serviceList = [
		'DIGITAL CONSULTATION',
		'MUSIC PRODUCTION', 
		'ARTIST DEVELOPMENT',
		'AUDIO ENGINEERING',
		'CREATIVE DIRECTION',
		'ASSET CREATION',
		'GRAPHIC DESIGN',
		'ART DIRECTION',
		'WEB DESIGN',
		'BRAND STRATEGY',
		'CAMPAIGN DEVELOPMENT',
		'SOCIAL MEDIA MANAGEMENT',
		'INFLUENCER OUTREACH',
		'PRESS PLACEMENTS',
		'PLAYLISTING',
		'ADVERTISING',
		'DIGITAL MARKETING',
		'PUBLIC RELATIONS',
		'BESPOKE BRAND DEVELOPMENT'
	]


	const fadeOut = {
		hidden: {
			opacity: 0,
			y: 20,
			scale: 0.98,
		},
		show: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 20,
				duration: 0.8,
				ease: [0.25, 0.46, 0.45, 0.94],
			}
		},
		exit: {
			opacity: 0,
			y: -20,
			scale: 0.98,
			transition: {
				duration: 0.4,
				ease: [0.25, 0.46, 0.45, 0.94],
			}
		}
	} 

	return (
		<AnimatePresence mode='wait'>
			<motion.div
				className='flex flex-col items-center justify-start text-center min-h-[calc(100dvh-200px)] bg-[var(--color-background)] text-[var(--color-text-primary)] w-full max-w-full pt-8 m-0 overflow-visible'
				initial='hidden'
				animate='show'
				exit='exit'
				variants={fadeOut}
				key={'about-container'}>
				
				<section className='flex flex-col items-center text-center py-4 px-4 md:py-8 md:px-12 lg:px-12 w-full max-w-6xl mx-auto'>
					<motion.h1 
						className='text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-[5px] mb-12 p-0 text-[var(--color-text-primary)] break-words text-center w-full block visible opacity-100'
						style={{ fontFamily: 'var(--font-primary)' }}
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.6 }}
					>
						Our Mission
					</motion.h1>
					<motion.div 
						className='flex flex-col items-center text-center mb-10 w-full'
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4, duration: 0.6 }}
					>
						<p className='text-xl md:text-2xl lg:text-3xl leading-relaxed m-0 mb-6 break-words text-center w-full max-w-4xl' style={{ fontFamily: 'var(--font-primary)' }}>
							Our mission at <span className='text-[#f93b3b]'>TRASH</span> is to empower artists and creatives by providing
							comprehensive and innovative solutions that enhance their artistic
							vision and amplify their impact.
						</p>
						<p className='text-xl md:text-2xl lg:text-3xl leading-relaxed m-0 mb-6 break-words text-center w-full max-w-4xl' style={{ fontFamily: 'var(--font-primary)' }}>
							We are a dynamic creative agency specializing in website design, artist development, music production,
							visual storytelling, social media assets, graphic design, photography,
							branding, and creative direction. Through our expertise and
							collaborative approach, we strive to elevate artists to new heights,
							equipping them with the tools and resources necessary to succeed in
							the digital era.
						</p>
						<p className='text-xl md:text-2xl lg:text-3xl leading-relaxed m-0 mb-6 break-words text-center w-full max-w-4xl' style={{ fontFamily: 'var(--font-primary)' }}>
							We are passionate about cultivating unique artistic
							identities and helping artists realize their full potential. At <span className='text-[#f93b3b]'>TRASH</span>,
							we believe in the power of creativity to inspire and connect. Our team
							of talented professionals is dedicated to delivering exceptional
							results, combining cutting-edge technology with artistic innovation.
							We collaborate closely with our clients, fostering a supportive
							environment where their ideas can thrive and evolve.
						</p>
					</motion.div>
				</section>


				<motion.section 
					className='flex flex-col px-4 py-8 md:px-12 lg:px-12 text-left w-full max-w-6xl mx-auto'
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6, duration: 0.6 }}
				>
					<div className='mb-0'>
						<button 
							className='w-full bg-transparent border-none flex justify-between items-center p-0 cursor-pointer text-[var(--color-text-primary)] transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-4'
							style={{ fontFamily: 'var(--font-primary)' }}
							onClick={() => setServices(!services)}
							aria-expanded={services}
							aria-controls="services-list"
						>
							<span className='text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-[3px] break-words'>Services</span>
							<BsChevronDown 
								className={`transition-all duration-500 ease-in-out ${services ? 'rotate-180' : 'rotate-0'}`} 
								size={32}
								aria-hidden="true" 
							/>
						</button>
						<div className='border-t-[3px] border-[#bbb] mt-0' />
					</div>
					
					<div 
						id="services-list"
						className={`${services ? 'max-h-[900px] py-8' : 'max-h-0 py-0'} flex flex-col gap-4 overflow-hidden transition-all duration-500 ease-in-out list-none`}
						aria-hidden={!services}
					>
						{serviceList.map((service, index) => (
							<motion.div 
								key={service}
								className='text-xl md:text-2xl lg:text-3xl text-[var(--color-text-primary)] my-2 list-none break-words'
								style={{ fontFamily: 'var(--font-primary)' }}
								initial={{ opacity: 0, y: 20 }}
								animate={services ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
								transition={{ delay: services ? index * 0.05 : 0, duration: 0.3 }}
							>
								{service}
							</motion.div>
						))}
					</div>
				</motion.section>




				<motion.section 
					className='flex flex-col justify-center items-center px-4 py-8 md:px-12 lg:px-12 md:py-16 mt-8 w-full max-w-6xl mx-auto'
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8, duration: 0.6 }}
				>
					<Link to='/contact' className='no-underline'>
						<motion.button 
							className='text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-[5px] mb-8 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-4'
							style={{ 
								fontFamily: 'var(--font-primary)',
								border: '2px solid var(--color-text-primary)',
								borderRadius: '8px',
								padding: '10px 15px',
								background: 'transparent',
								color: 'var(--color-text-primary)',
								transition: 'all 200ms ease-in-out'
							}}
							whileHover={{ scale: 1.05, y: -2 }}
							whileTap={{ scale: 0.98 }}
							transition={{ type: "spring", stiffness: 400, damping: 17 }}
						>
							Work With Us
						</motion.button>
					</Link>
				</motion.section>

			</motion.div>

		</AnimatePresence>
	)
}

export default About

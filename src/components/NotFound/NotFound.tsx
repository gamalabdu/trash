import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import noiseTexture from '../../assets/backgrounds/noise.png'

const NotFound = () => {
	// Update document title
	useDocumentTitle('Page Not Found')

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
		<motion.div 
			className='bg-brand-bg text-center min-h-screen-adjusted text-brand-text flex flex-col items-center justify-center relative overflow-hidden'
			initial='hidden'
			animate='show'
			exit='exit'
			variants={fadeOut}
		>
			{/* Grain effect overlay */}
			<div 
				className='absolute inset-0 -left-1/2 -top-full w-[300%] h-[300%] opacity-10 animate-grain pointer-events-none -z-10'
				style={{ backgroundImage: `url(${noiseTexture})` }}
			/>

			<div className='flex flex-col items-center justify-center px-hero-padding-x py-hero-padding-y gap-hero-gap max-w-4xl mx-auto relative z-10'>
				
				{/* 404 Number */}
				<motion.h1 
					className='text-responsive-hero font-bold uppercase tracking-[5px] text-brand-text mb-4'
					style={{ fontFamily: 'var(--font-primary)' }}
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.6 }}
				>
					404
				</motion.h1>

				{/* Main heading */}
				<motion.h2 
					className='text-responsive-content font-bold uppercase tracking-[3px] text-brand-text mb-6 leading-tight'
					style={{ fontFamily: 'var(--font-primary)' }}
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.6 }}
				>
					Page Not Found
				</motion.h2>

				{/* Description */}
				<motion.p 
					className='text-responsive-service font-normal text-brand-secondary mb-8 leading-relaxed max-w-3xl'
					style={{ fontFamily: 'var(--font-primary)' }}
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6, duration: 0.6 }}
				>
					LOOKS LIKE YOU'VE WANDERED INTO UNCHARTED TERRITORY. THE PAGE YOU'RE LOOKING FOR DOESN'T EXIST.
				</motion.p>

				{/* Call to action buttons */}
				<motion.div 
					className='flex flex-col sm:flex-row gap-4 items-center justify-center'
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8, duration: 0.6 }}
				>
					<Link to='/home' className='no-underline'>
						<motion.button 
							className='text-lg md:text-xl font-bold uppercase tracking-[2px] cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-4'
							style={{ 
								fontFamily: 'var(--font-primary)',
								border: '2px solid var(--color-text-primary)',
								borderRadius: '8px',
								padding: '12px 24px',
								background: 'transparent',
								color: 'var(--color-text-primary)',
								transition: 'all var(--transition-normal)'
							}}
							whileHover={{ 
								scale: 1.05, 
								y: -2,
								borderColor: 'var(--color-primary)',
								color: 'var(--color-primary)'
							}}
							whileTap={{ scale: 0.98 }}
							transition={{ type: "spring", stiffness: 400, damping: 17 }}
						>
							Go Home
						</motion.button>
					</Link>

					<Link to='/works' className='no-underline'>
						<motion.button 
							className='text-lg md:text-xl font-bold uppercase tracking-[2px] cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-4'
							style={{ 
								fontFamily: 'var(--font-primary)',
								border: '2px solid var(--color-primary)',
								borderRadius: '8px',
								padding: '12px 24px',
								background: 'var(--color-primary)',
								color: 'white',
								transition: 'all var(--transition-normal)'
							}}
							whileHover={{ 
								scale: 1.05, 
								y: -2,
								backgroundColor: 'var(--color-primary-dark)',
								boxShadow: '0 8px 25px rgba(249, 59, 59, 0.3)'
							}}
							whileTap={{ scale: 0.98 }}
							transition={{ type: "spring", stiffness: 400, damping: 17 }}
						>
							View Our Work
						</motion.button>
					</Link>
				</motion.div>

				{/* Additional helpful links */}
				<motion.div 
					className='flex flex-wrap gap-6 items-center justify-center mt-8 text-brand-secondary'
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1.0, duration: 0.6 }}
				>
					<Link 
						to='/about' 
						className='text-brand-secondary hover:text-brand-red transition-colors duration-300 text-lg uppercase tracking-[1px]'
						style={{ fontFamily: 'var(--font-primary)', textDecoration: 'none' }}
					>
						About
					</Link>
					<Link 
						to='/for-artists' 
						className='text-brand-secondary hover:text-brand-red transition-colors duration-300 text-lg uppercase tracking-[1px]'
						style={{ fontFamily: 'var(--font-primary)', textDecoration: 'none' }}
					>
						For Artists
					</Link>
					<Link 
						to='/press' 
						className='text-brand-secondary hover:text-brand-red transition-colors duration-300 text-lg uppercase tracking-[1px]'
						style={{ fontFamily: 'var(--font-primary)', textDecoration: 'none' }}
					>
						Press
					</Link>
					<Link 
						to='/contact' 
						className='text-brand-secondary hover:text-brand-red transition-colors duration-300 text-lg uppercase tracking-[1px]'
						style={{ fontFamily: 'var(--font-primary)', textDecoration: 'none' }}
					>
						Contact
					</Link>
				</motion.div>
			</div>
		</motion.div>
	)
}

export default NotFound

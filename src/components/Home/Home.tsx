import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useHomeData } from '../../hooks/useHomeData'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'
import noiseTexture from '../../assets/backgrounds/noise.png'

const Home = () => {

	const navigate = useNavigate()
	const { homeData, loading, error } = useHomeData()
	
	// Update document title
	useDocumentTitle('Home')

	const handleClick = (link: string) => {
		if (link === 'for-artists') {
			navigate('/for-artists')
		}
		if (link === 'for-clients') {
			navigate('/for-clients')
		}
	}
	




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




	// Handle error state
	if (error) {
		return (
			<motion.div 
				className='bg-brand-bg text-center min-h-screen-adjusted text-brand-text'
				initial='hidden'
				animate='show'
				exit='exit'
				variants={fadeOut}
			>
				<div className='flex justify-center items-center min-h-[60vh] flex-col gap-4'>
					<p className='text-brand-red text-responsive-error text-center px-8'>
						Sorry, we couldn't load the content. Please try again later.
					</p>
				</div>
			</motion.div>
		)
	}

	// Handle loading state
	if (loading) {
		return (
			<motion.div 
				className='bg-brand-bg text-center min-h-screen-adjusted text-brand-text'
				initial='hidden'
				animate='show'
				exit='exit'
				variants={fadeOut}
			>
				<div className='flex justify-center items-center min-h-[60vh] flex-col gap-4'>
					<LoadingSpinner size='large' />
				</div>
			</motion.div>
		)
	}

	return (
		<motion.div className='bg-brand-bg text-center min-h-screen-adjusted text-brand-text md:min-h-screen-adjusted-mobile'
			initial='hidden'
			animate='show'
			exit='exit'
			variants={fadeOut}
		>
			<div className='min-h-hero md:min-h-hero-mobile sm:min-h-hero-small flex flex-col text-center items-center justify-center py-hero-padding-y px-hero-padding-x md:py-8 md:px-6 sm:py-6 sm:px-4 text-responsive-hero text-black bg-hero-gradient overflow-hidden transform-gpu relative gap-hero-gap md:gap-6 sm:gap-4 border-b border-black/8'>
				{/* Grain effect overlay */}
				<div 
					className='absolute inset-0 -left-1/2 -top-full w-[300%] h-[300%] opacity-15 animate-grain pointer-events-none -z-10'
					style={{ backgroundImage: `url(${noiseTexture})` }}
				/>
				
				{homeData?.icon && (
					<img 
						className='h-16 md:h-14 sm:h-12 w-auto drop-shadow-brand transition-all duration-500 ease-smooth mb-2 md:mb-1 hover:scale-105 hover:-translate-y-0.5 hover:drop-shadow-brand-hover' 
						src={homeData.icon} 
						alt='TRASH brand icon' 
						loading='lazy'
					/>
				)}
				<span className='leading-tight font-bold tracking-tight max-w-3xl bg-text-gradient bg-clip-text text-transparent relative'>
					WE ARE THE CREATIVE POWERHOUSE BEHIND EMERGING ARTISTS, STARTUPS AND BRANDS.
				</span>
			</div>

			<div id='process' className='flex flex-col text-center items-center justify-center py-content-padding-y px-content-padding-x md:py-16 md:px-6 sm:py-12 sm:px-4 text-responsive-content gap-content-gap md:gap-12 sm:gap-8 leading-tight max-w-4xl mx-auto relative'>
				<p className='font-semibold text-brand-text m-0 relative z-10'>
					HERE AT TRASH WE LOOK TO HELP YOU BRING YOUR ART, BUSINESS OR IDEAS TO LIFE.
				</p>
				<p className='font-normal text-brand-secondary m-0 text-responsive-service max-w-3xl leading-relaxed relative z-10'>
					TRASH IS A FULL IN-HOUSE CREATIVE AGENCY OFFERING MUSIC PRODUCTION,
					AUDIO ENGINEERING, PHOTOGRAPHY, CREATIVE DIRECTION, GRAPHIC DESIGN,
					MARKETING & CONTENT CREATION.
				</p>
			</div>

			<div className='flex flex-col md:flex-row md:flex-wrap min-h-offers-mobile md:min-h-offers'>
				<div 
					onClick={() => handleClick('for-artists')} 
					className='w-full md:w-1/2 relative overflow-hidden transition-all duration-500 ease-smooth cursor-pointer min-h-[25vh] sm:min-h-[30vh] md:hover:scale-[1.02] hover:scale-100 group'
				>
					<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-responsive-overlay md:text-2xl sm:text-xl font-bold uppercase tracking-wider z-10 drop-shadow-text-overlay transition-all duration-300 ease-in-out pointer-events-none group-hover:text-brand-red group-hover:scale-110 group-hover:drop-shadow-text-overlay-hover'>
						for artists
					</div>
					<Link to='/for-artists' style={{ textDecoration: 'none' }} aria-label="Services for artists">
						{homeData?.homePic1 && (
							<img
								className='h-full w-full object-cover grayscale brightness-70 transition-all duration-500 ease-smooth group-hover:grayscale-[80%] group-hover:brightness-90 group-hover:scale-105 md:group-hover:scale-[1.02]'
								src={homeData.homePic1}
								alt='Artist services showcase'
								loading='lazy'
							/>
						)}
					</Link>
				</div>

				<div className='w-full md:w-1/2 relative overflow-hidden transition-all duration-500 ease-smooth cursor-not-allowed opacity-80 min-h-[25vh] sm:min-h-[30vh] group'>
					<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-responsive-overlay md:text-2xl sm:text-xl font-bold uppercase tracking-wider z-10 drop-shadow-text-overlay transition-all duration-300 ease-in-out pointer-events-none'>
						for startups
					</div>
					{homeData?.homePic2 && (
						<img
							className='h-full w-full object-cover grayscale brightness-70 transition-all duration-500 ease-smooth group-hover:grayscale-[90%] group-hover:brightness-80'
							src={homeData.homePic2}
							alt='Startup services showcase'
							loading='lazy'
						/>
					)}
				</div>
			</div>
		</motion.div>
	)
}

export default Home

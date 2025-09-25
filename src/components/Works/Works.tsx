import { useEffect, useState } from 'react'
import './styles.css'
import { BsChevronUp } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import TopButton from './TopButton/TopButton'
import Gallery from '../Gallery/Gallery'
import { RoughNotation } from "react-rough-notation";
import { motion} from 'framer-motion'
import { IWork } from '../../models/IWork'
import { useWorks } from '../../context/WorksContext'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'


const Works = () => {
	
	const title = 'Explore our work'
	const { works, loading, error } = useWorks()

	const buttonChoices = [
		{
			type: 'Everything',
			id: 1,
		},
		{
			type: 'Branding',
			id: 2,
		},
		{
			type: 'Design',
			id: 3,
		},
		{
			type: 'Development',
			id: 4,
		},
		{
			type: 'Film',
			id: 5,
		},
		{
			type: 'Creative Direction',
			id: 7,
		},
		{
			type: 'Music Production',
			id: 8,
		},
		{
			type: 'Photography',
			id: 9,
		},
		{
			type: 'All Included',
			id: 10,
		},
	]

	const navigate = useNavigate()

	const handleClick = (link : string) => {
      navigate(link)
	}

	const [filteredWorks, setFilteredWorks] = useState<IWork[]>([]);
	const [Buttons, setButtons] = useState(false)
	const [categories, setCategories] =  useState<string[]>(['Everything'])

	const intersection = works?.filter(work => {
		return ( 
			work.type.some(item => 
				categories.includes(item) 
			)
		)
	  });

	useEffect(() => {
		window.scrollTo(0, 0)
		document.title = `TRASH - ${title}`;
	}, [title])



	useEffect(() => {
		if (categories.includes('Everything')) {
			// If 'Everything' is selected, show all items
			setFilteredWorks(works);
		} else {
			// Otherwise, filter items based on selected categories
			const filteredItems = intersection.filter((work) =>
				work.type.some((item) => categories.includes(item))
			);
			setFilteredWorks(filteredItems);
		}
	}, [categories, works, intersection]);

	  



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

	const galleryVariants = {
		hidden: {
		  opacity: 0,
		},
		show: {
		  opacity: 1,
		  transition: {
			ease: 'easeInOut',
			duration: 1.6,
		  },
		},
		exit: {
		  opacity: 0,
		  transition: {
			ease: 'easeInOut',
			duration: 1.6,
		  },
		},
	  };


	// Handle loading state
	if (loading) {
		return (
			<motion.div
				className='works-container'
				initial='hidden'
				animate='show'
				exit='exit'
				variants={fadeOut}>
				<LoadingSpinner />
			</motion.div>
		);
	}

	// Handle error state
	if (error) {
		return (
			<motion.div
				className='works-container'
				initial='hidden'
				animate='show'
				exit='exit'
				variants={fadeOut}>
				<div className='error-container'>
					<h2>Error loading works</h2>
					<p>{error}</p>
					<button onClick={() => window.location.reload()}>Try Again</button>
				</div>
			</motion.div>
		);
	}

	return (
		
		<motion.div
			className='works-container'
			initial='hidden'
			animate='show'
			exit='exit'
			variants={fadeOut}>


			<div className='works-top-container'> Our Work </div>

			<div className='works-top-buttons-container'>
				{Buttons ? (
					<div key={'12'} className='everything-buttons-full'>
						<div>Show Me : </div>

						{buttonChoices.map((button, idx) => {
							return (
								<TopButton
									key={idx}
									categories={categories}
									setCategories={setCategories}
									buttonName={button.type}
								/>
							)
						})}
						<div
							style={{ cursor: 'pointer' }}
							onClick={() => setButtons(false)}>
							<BsChevronUp size={24} />
						</div>
					</div>
				) : (
					<div key={'13'} className='everything-buttons'>
						<div
							style={{ cursor: 'pointer' }}
							onClick={() => handleClick('/contact')}>
							{' '}
							<RoughNotation
								type='highlight'
								color='#f93b3b'
								animationDelay={3000}
								padding={15}
								strokeWidth={2}
								animationDuration={3000}
								show={true}>
								{' '}
								Work With Us{' '}
							</RoughNotation>{' '}
						</div>

						<div className='show-me'>
							{categories.includes('Everything') || categories.length === 0
								? 'Show Me : '
								: 'Showing : '}
							<div
								className='everything-choice'
								onClick={() => setButtons(true)}>
								<div
									style={{
										marginLeft: '5px',
										display: 'flex',
										flexDirection: 'row',
										verticalAlign: 'middle',
										alignContent: 'center',
										justifyContent: 'center',
										alignItems: 'center',
										textDecoration: 'underline',
									}}>
									{categories.includes('Everything') || categories.length === 0
										? 'Everything'
										: categories.length + ' categories'}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			<motion.div
				className='our-works-container'
				variants={galleryVariants}
				initial='hidden'
				animate='show'
				exit='exit'
				>
				{

				 works.length !== 0 ? 

					<Gallery categories={categories} data={filteredWorks} />

					: 
					
					null

				}

			</motion.div>

	    


		</motion.div>

							
								
	)
}

export default Works



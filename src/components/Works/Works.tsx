import React, { lazy, useEffect, useState } from 'react'
import './styles.css'
import { BsChevronUp } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import TopButton from './TopButton/TopButton'
import Gallery from '../Gallery/Gallery'
import { RoughNotation } from "react-rough-notation";
import { motion} from 'framer-motion'

const Works = () => {

	const title = 'Explore our work'

	const DynamicPage = ( title : string ) => {
		useEffect(() => {
		  document.title = `TRASH - ${title}`; // Update the document title
		}, [title]);
	  }
  
	  DynamicPage(title)

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

	const googleDriveUrl = 'uc?id='

	const googleUrl = 'uc?export=view&id='

	const works = [
		{
			image: 'https://drive.google.com/uc?id=1EcYBfG50ouOShPfPyXkTPJMVGCcf1PqO',
			type: ['Design', 'Development'],
			name: "BadWill POC",
			statement: 'TRASH was commissioned by NOISE to create a POC mobile friendly website for BadWill, a concept by NOISE.',
			videos: [ 'https://drive.google.com/uc?id=1yiY_MdpaABR5Zk0jQq-TM1PEb5MpQKYu' ],
			images: [
				'https://drive.google.com/uc?id=1cyOwyjDEOqGe2JlCsEBxl8JnTpJSNPbw',
				'https://drive.google.com/uc?id=1Ykm2BnoXLAH7sIYDhroFftmYL5op498v'
				],
			canvas : [],
			assets: [
				'https://drive.google.com/uc?id=1gcyGNd570N_KEVeAlyx4qbqZRxVQzliv',
				'https://drive.google.com/uc?id=1HfRdJ3rm4MWN_3C8NiKarRGykYqyMEL6',
				'https://drive.google.com/uc?id=16GGxFwKnwSSq-7h0WJqVosem_SgU0KwS'
			],
			iphone: true,
			artworks:[]
		},
		{
			image: 'https://drive.google.com/uc?id=1k8OSmDfZ1TyvKD4L9jWw9qq3zTZjMHK4',
			type: ['Design','Creative Direction','Branding'],
			name: "Ella Rossi Offical Site",
			statement: 'TRASH was commissioned by Ella Rossi to design, creative direct and build a responsive & mobile friendly artist site',
			videos: [
				'https://drive.google.com/uc?id=1YuR6m9qVslX9wL679WAbh1n8Aocl-DoK',
				'https://drive.google.com/uc?id=1WFeEQA5-fyb3doGZSC62lK7bwwDr47sG',
				'https://drive.google.com/uc?id=1NbuqTj40EppCJ2on6uEYd-AcnMJgSqhp',
			],
			images: [
				'https://drive.google.com/uc?id=1eZtbIVEGsgDwrbZlAVMBsXdFGk2gXmO7',
				'https://drive.google.com/uc?id=1H13LZY5kg0dr5q1b0cI-VfhyZyXrfUG_'
			],
			canvas : [],
			assets : [],
			iphone: true,
			artworks:[]
		},
		{
			image: 'https://drive.google.com/uc?id=1P5keER0o-po-GToqKQJR-F9vF7hTCzN-',
			type: ['Creative Direction','Branding','Photography','Film'],
			name: "Royal Triumph Campaign",
			statement: 'TRASH was commissioned by Royal Triumph to photography, creative direct and film Royal Triumphs Campaign Visual',
			videos: [
				'https://drive.google.com/uc?id=1TYOHs-8mTVExSZKgdBUUQujDU05xjgkc',
			],
			images: [
				'https://drive.google.com/uc?id=16MvOktXFbihwAfBQMjZfC86TGO_rBkYm',
				'https://drive.google.com/uc?id=1oLWpiIKLLZaY3DAQaOjRGu2yHVTZu0cm'
			],
			canvas : [],
			assets : [],
			iphone: false,
			artworks:[]
		},
		{
			image: 'https://drive.google.com/uc?id=1xRz-Y2D00ZiGFF_UkvoHJv5JuR3040QX',
			type: ['Creative Direction','Photography','Film','Music Production'],
			name: "Maria Alexa - Wake Me Up (Offical Music Video)",
			statement: `TRASH was brought on to mix, master, produce, photograph, create social media assets, creative direct and film Maria Alexa's Offical Music Video for her song "Wake Me Up" `,
			videos: [
				'https://drive.google.com/uc?id=1hq2yAUbSvkrlgfL3oLjUfrxb83etPa2N',
			],
			images: [],
			canvas: [  
				'https://drive.google.com/uc?id=1gOf66tHkJ_ss7Lyuc5__ATCvG_R-LrzS', 
				'https://drive.google.com/uc?id=1W6XzUnqtALSA5PXIfA6OFMsGuiaUVB_x' 
			],
			assets : [],
			iphone: false,
			artworks:[]
		},
		{
			image: 'https://drive.google.com/uc?id=1t-McPnzQCX6z9K3fU1LziTOnosEuRHUZ',
			type: ['Creative Direction','Photography','Film'],
			name: "Sleeper Camp - Waterfight Promo",
			statement: 'TRASH was brought on to creative direct, film and direct this fun visual for the promotion of Sleeper Camps Summer Cookout / Waterfight',
			videos: [
				'https://drive.google.com/uc?id=1ThPivcUVa85mDERC9arFuX7KV-u8SRii',
			],
			images: [],
			canvas: [],
			assets : [],
			iphone: false,
			artworks:[]
		},
		{
			image: 'https://drive.google.com/uc?id=1x2MtZDDhbd0H7StSXVQsngn0oqsjclFo',
			type: ['Creative Direction','Photography','Film', 'Music Production'],
			name: "LA Rodriguez - Phone Line",
			statement: `TRASH was brought on to mix, master, produce, creative direct, film and direct a visual for LA Rodriguez's single "Phone Line"`,
			videos: [
				'https://drive.google.com/uc?id=1taomtmKSuCUEJoVvNIhfdoePGdTdU4fm',
			],
			images: [],
			canvas: [],
			assets : [],
			iphone: false,
			artworks:[]
		},
		{
			image: 'https://drive.google.com/uc?id=1dlf89e9VrE59JVyDB5X9r7LwvAfl_xsp',
			type: ['Creative Direction','Photography','Film'],
			name: "Stanaj - Stranger",
			statement: `TRASH was brought on to creative direct, film and direct a visual for Stanaj's single "Stanger"`,
			videos: [],
			images: [],
			canvas: [
				'https://drive.google.com/uc?id=1Wr2rhZykPin8JfjJxHqaV8UrKTwizC6H',
				'https://drive.google.com/uc?id=1ttBo8fAYBWjCDy_jjYR4Palw9J754g8X',
			],
			assets : [],
			iphone: false,
			artworks:[]
		},
		{
			image: 'https://drive.google.com/uc?id=1UnjQg1JFNuw9qkuPehsVCtDxRK38dxU5',
			type: ['All Included'],
			name: "Jaz Vernon - By The Bay",
			statement: `TRASH was brought on to exectutive produce, curate and release Jaz Vernon's Debut Project, 'By The Bay'`,
			videos: [],
			images: [],
			canvas: [
			],
			assets : [],
			iphone: false,
			artworks:[
				'https://drive.google.com/uc?id=1_sm4CApB2R4RjXrp3kb44QYlNKPug13Z',
				'https://drive.google.com/uc?id=1VIo62aUUIUTaJfs1K9UQdrJcY14heCXJ',
				'https://drive.google.com/uc?id=1yLWXlS7STH-7GjT8LW3RKxJYNN4mPqnM',
				'https://drive.google.com/uc?id=1pwcqSca2BiztV93OWKDnd9gVf6cG3xOB'
			]
		},
		{
			image: 'https://drive.google.com/uc?id=1gTKD-1XwPhEmxca8iYktIbvjiCAH8_mI',
			type: ['All Included'],
			name: "Ella Rossi - Heart Eyes",
			statement: `TRASH was brought on to exectutive produce, curate and release Ella Rossi's Debut Project, 'Heart Eyes'`,
			videos: [],
			images: [],
			canvas: [
				'https://drive.google.com/uc?id=13IRi9D3qJ4Oek2jW830Cag37hoqW5uBH',
				'https://drive.google.com/uc?id=1jM3YEKmaHn0FyoZb2PAwmgHKO7T9LG67',
				'https://drive.google.com/uc?id=1OpHvj2AT2CXmWXeMN-QRdShp53ViSLar'
			],
			assets : [],
			iphone: false,
			artworks:[
				'https://drive.google.com/uc?id=1HyYi10-7yIw28GbAssT6cy6A2_CC8N9i',
				'https://drive.google.com/uc?id=1sdclNMCgFTYWZe_aqqlxqNq1FWKGs5Yy',
				'https://drive.google.com/uc?id=1FoREgIC4c7-RIi724vnGJjRGlWBtXX1Y',
				'https://drive.google.com/uc?id=1qQqAxRjcv1xzKrDO9qVTHHFnreRfXZVe',
				'https://drive.google.com/uc?id=1AFvGOcUgjzpXDvkSJoLC9wrkZLo34KeO',
			]
		},
		{
			image: 'https://drive.google.com/uc?id=1DaAdAwotG4-3lxIu-osu8aCLB8Ph4cs1',
			type: ['All Included'],
			name: "La Rodriguez - Don't Drive Drunk",
			statement: `TRASH was brought on to exectutive produce, curate and release LA Rodriguez's 3rd Studio Project, 'Don't Drive Drunk'`,
			videos: [],
			images: [],
			canvas: [],
			assets : [],
			iphone: false,
			artworks:[
				"https://drive.google.com/uc?id=1T-KRRIPlzjbNVJzec-Pw7v3_uvekpiF0",
				"https://drive.google.com/uc?id=1Dua-jjcnYvW0aInef_I-uUHzbuUFlTT2",
				"https://drive.google.com/uc?id=1pQjcHj12FqjyfS9ZXkAGa48WpEIFU_rV",
				"https://drive.google.com/uc?id=1l2jgZGyP2N558ST3gBd4UHP-GpNzYE6d",
				"https://drive.google.com/uc?id=1WtZGnakWheWsbNPJltkd4AU2F5rdZTLO"
			]
		},
		{
			image: 'https://drive.google.com/uc?id=1uOK4TWwvER89iEKXfgz1ZebQ8cd6KFSF',
			type: ['Design', 'Development'],
			name: "Souvenir Media",
			statement: `TRASH was brought on to co-design and development Souvenir Media's Offical Website`,
			videos: [],
			images: [],
			canvas: [
			],
			assets : [],
			iphone: false,
			artworks:[]
		},
		{
			image: 'https://drive.google.com/uc?id=1hD_z9XjwofWXz6s0G7PILF0GUffc6PCr',
			type: ['Photography', 'Creative Direction'],
			name: "Rulez - NO RULEZ Campaign",
			statement: `TRASH was brought on to shoot a campaign for Fall 2015 No Rulez season`,
			videos: [
				'https://drive.google.com/uc?id=1_LaAWuiLlwGI7Vs-eg2DgBpihf6AbUTX'
			],
			images: [
				"https://drive.google.com/uc?id=152mNhny5I0oj5xV4VCFDNpKRBNIwk1Js",
				"https://drive.google.com/uc?id=1j97zuAPZ2PFwAsJIF_bGzowNELCMnbnm",
				"https://drive.google.com/uc?id=1LJ1oG3aLOQLRyKyVc3HxqNBVfa96eXER",
				"https://drive.google.com/uc?id=1g_-U12L8U17uf47mY3HAJrff3kobgQhG",
				"https://drive.google.com/uc?id=1CJq8IF7-2g_-yR0fwCUnV4AzAA0gua0P",
				"https://drive.google.com/uc?id=1hD_z9XjwofWXz6s0G7PILF0GUffc6PCr",
				"https://drive.google.com/uc?id=1NvZsHWxK7YOzw6Ncmm8WEnt4oCap-oi8",
				"https://drive.google.com/uc?id=1jXp_USLbr49yD_TyYPkO4FSXffp52nxH",
				"https://drive.google.com/uc?id=1jXp_USLbr49yD_TyYPkO4FSXffp52nxH",
				"https://drive.google.com/uc?id=16tIEURzlsk6K5j7cHZLmRWKgBUAjIpcA",
				"https://drive.google.com/uc?id=1oQ3kQDqgdz8M_1kfUvgZwMnJhYX5Ceck",
				"https://drive.google.com/uc?id=1cjMHczTJrShM9TYhN4UwY-a5AI-BbuXx",
			],
			canvas: [
			],
			assets : [],
			iphone: false,
			artworks:[]
		}

		
	]

	const navigate = useNavigate()

	const handleClick = (link : string) => {

      navigate(link)
    
	}

	const [filteredWorks, setFilteredWorks] = useState(works);

	const [Buttons, setButtons] = useState(false)

	const [categories, setCategories] =  useState<string[]>(['Everything'])

	const intersection = works.filter(work => {
		return ( 
			work.type.some(item => 
				categories.includes(item) 
			)
		)
	  });


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
	  }, [categories]);
	  

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
				<Gallery categories={categories} data={filteredWorks} />
			</motion.div>
		</motion.div>
	)
}

export default Works






// {
// 	categories.includes('Everything') ?
	
// 	 <Gallery categories={categories} data={works} />
//   : 
// 	 // :

// 	 // categories.length === 0 ?

// 	 // <div className='no-categories' style={{ color: "#202020", padding:"5%"}}> No Categories Selected </div>

// 	 <Gallery categories={categories} data={intersection} />
 
//  }
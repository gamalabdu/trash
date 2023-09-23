import React, { lazy, useEffect, useState } from 'react'
import './styles.css'
import { BsChevronUp } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import TopButton from './TopButton/TopButton'
import Gallery from '../Gallery/Gallery'

const Works = () => {


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
			image: 'https://drive.google.com/uc?id=1KSjXGT4Hk4J_g1ZteUShQp9ILCd73lKP',
			type: ['All Included'],
			name: "La Rodriguez - Don't Drive Drunk",
			statement: `TRASH was brought on to exectutive produce, curate and release LA Rodriguez's 3rd Studio Project, 'Don't Drive Drunk'`,
			videos: [],
			images: [],
			canvas: [
			],
			assets : [],
			iphone: false,
			artworks:[]
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
		}

		
	]

	const navigate = useNavigate()

	const handleClick = (link : string) => {

      navigate(link)
    
	}


	const [Buttons, setButtons] = useState(false)

	const [categories, setCategories] =  useState<string[]>(['Everything'])

	const intersection = works.filter(work => {
		return ( 
			work.type.some( item => 
				categories.includes(item) 
			)
		)
	  });
	  

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])



	return (
		<div className='works-container'>

			<div className='works-top-container'> Our Work </div>

			<div className='works-top-buttons-container'>
				{
				
				Buttons ? 

				(
					<div key={'12'} className='everything-buttons-full'>

						<div>Show Me : </div>

						   {
						     buttonChoices.map((button, idx) => {
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
								
							<BsChevronUp size={18} />
						</div>
					</div>
				) : (
					<div key={'13'} className='everything-buttons'>

						<div style={{ cursor:"pointer"}} onClick={() => handleClick('/contact')}> Work With Us </div>

						<div className='show-me'>
							{
								categories.includes("Everything") || categories.length === 0 ? 
								"Show Me : "
								:
								"Showing : "
							}
							<div
								className='everything-choice'
								onClick={() => setButtons(true)}>
							<div style={{ marginLeft:"5px", display:'flex', flexDirection:"row", verticalAlign:"middle", alignContent:"center", justifyContent:"center", alignItems:"center", textDecoration:"underline"}}>
								{
									categories.includes("Everything") || categories.length === 0 ? 

									"Everything"

									:
									
									categories.length + " categories"
									
								}	
							</div>
							</div>
						</div>
					</div>
				)}
			</div>




			<div className='our-works-container'>
        			{
						categories.includes('Everything') ?

						<Gallery categories={categories} data={works} />


						: 

						categories.length === 0 ? 

						<div className='no-categories' style={{ color: "#202020", padding:"5%"}}> No Categories Selected </div>

						:

						<Gallery categories={categories} data={intersection} />
					}
            </div>



		</div>
	)
}

export default Works

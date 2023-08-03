import React, { useEffect, useState } from 'react'
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
	]

	const works = [
		{
			image: require('../../assets/images/badwillsitepic.png'),
			type: ['Design', 'Development'],
			name: "BadWill POC",
			statement: 'TRASH was commissioned by NOISE to create a POC mobile friendly website for BadWill, a concept by NOISE.',
			videos: [ require('../../assets/videos/badwillsite.mp4') ],
			images: [
				require('../../assets/images/badwill/badwillmobile1.png'),
				require('../../assets/images/badwill/badwillmobile2.png')
				],
			canvas : [],
			assets: [
				require('../../assets/images/badwill/Balenciaga Speed 1x1.gif'),
				require('../../assets/images/badwill/Yeezy Foam RNR 1x1.gif'),
				require('../../assets/images/badwill/Yeezy Hoodie 1x1.gif')
			],
			iphone: true,
		},
		{
			image: require('../../assets/images/ella-site.png'),
			type: ['Design','Creative Direction','Branding'],
			name: "Ella Rossi Offical Site",
			statement: 'TRASH was commissioned by Ella Rossi to design, creative direct and build a responsive & mobile friendly artist site',
			videos: [
				require('../../assets/videos/ellaSiteVideos/ellasitemain.mp4'),
				require('../../assets/videos/ellaSiteVideos/ellasiteabout.mp4'),
				require('../../assets/videos/ellaSiteVideos/ellasitegallery.mp4'),
			],
			images: [
				require('../../assets/images/ellaRossiSite/ellaSiteMain.png'),
				require('../../assets/images/ellaRossiSite/ellaSiteGallery.png')
			],
			canvas : [],
			assets : [],
			iphone: true,
		},
		{
			image: require('../../assets/images/royal/BNWBACKFLAG.jpg'),
			type: ['Design','Creative Direction','Branding','Photography','Film'],
			name: "Royal Triumph Campaign",
			statement: 'TRASH was commissioned by Royal Triumph to photography, creative direct and film Royal Triumphs Campaign Visual',
			videos: [
				require('../../assets/images/royal/BTS_ Royal Triumph Summer_Sping Teaser.mp4'),
			],
			images: [
				require('../../assets/images/royal/BnWRTFlag.jpg'),
				require('../../assets/images/royal/royal 2.jpg')
			],
			canvas : [],
			assets : [],
			iphone: false,
		},
		{
			image: require('../../assets/images/productionPic.png'),
			type: ['Creative Direction','Photography','Film','Music Production'],
			name: "Maria Alexa - Wake Me Up (Offical Music Video)",
			statement: `TRASH was brought on to mix, master, produce, photograph, create social media assets, creative direct and film Maria Alexa's Offical Music Video for her song "Wake Me Up" `,
			videos: [
				require('../../assets/images/wakemeup/Maria Alexa - Wake me up [Official Music Video] (720p).mp4'),
			],
			images: [],
			canvas: [  require('../../assets/images/wakemeup/FINALCANVAS1.mp4'), require('../../assets/images/wakemeup/WakeMeUpFinalCanvases2.mp4') ],
			assets : [],
			iphone: false
		},
		{
			image: require('../../assets/images/sleepercamp/sleepercamp.png'),
			type: ['Creative Direction','Photography','Film'],
			name: "Sleeper Camp - Waterfight Promo",
			statement: 'TRASH was brought on to creative direct, film and direct this fun visual for the promotion of Sleeper Camps Summer Cookout / Waterfight',
			videos: [
				require('../../assets/images/sleepercamp/sleepercookout.mp4'),
			],
			images: [],
			canvas: [],
			assets : [],
			iphone: false
		},
		{
			image: require('../../assets/images/phoneline.png'),
			type: ['Creative Direction','Photography','Film', 'Music Production'],
			name: "LA Rodriguez - Phone Line",
			statement: `TRASH was brought on to mix, master, produce, creative direct, film and direct a visual for LA Rodriguez's single "Phone Line"`,
			videos: [
				require('../../assets/videos/phoneLikeTrim.mp4'),
			],
			images: [],
			canvas: [],
			assets : [],
			iphone: false
		}
	]

	const navigate = useNavigate()

	const handleClick = (link : string) => {

      navigate(link)
    
	}


	const [Buttons, setButtons] = useState(false)

	const [categories, setCategories] =  useState<string[]>(['Everything'])

	const intersection = works.filter(work => {
		return work.type.some(item => categories.includes(item));
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

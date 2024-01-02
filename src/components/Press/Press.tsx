import React, { useEffect } from 'react'
import './styles.css'
import {motion} from 'framer-motion'

const Press = () => {

	const title = 'Press'

	const DynamicPage = ( title : string ) => {
		useEffect(() => {
		  document.title = `TRASH - ${title}`; // Update the document title
		}, [title]);
	  }
  
	  DynamicPage(title)


	const goToLink = (link : string) => {

		return (window.location.href = link)

	}

	const pressLinks = [
		{
			name: "Medium",
			link: "https://medium.com/offthercrd/now-playing-sweet-sour-971798e57fee",
			image: "https://drive.google.com/uc?id=1VorNJ8kGpaNfZrBjPkrSaMtIce0ldJkl"
		},
		{
			name: "Complex",
			link: "https://www.complex.com/music/a/lauren-nostro/jay-bel-new-song-transeuro-feat-jimi-tents",
			image: "https://partner.complex.com/ig-vote-submissions/assets/images/complex-logo-white.png"
		},
		{
			name: "BillBoard",
			link: "https://www.billboard.com/music/rb-hip-hop/jimi-tents-elmer-fudd-exclusive-song-premiere-6457868/",
			image: "https://thehellogroup.com/wp-content/uploads/2023/04/234-2341310_billboard-logo-png-clip-black-and-white-2018.png"
		},
		{
			name: "The Fader",
			link: "https://www.thefader.com/2015/10/30/listen-jimi-tents-new-album-",
			image: "https://upload.wikimedia.org/wikipedia/commons/c/c9/FADER-logo.jpg"
		},
		{
			name: "EarMilk",
			link: "https://earmilk.com/2023/07/22/ella-rossi-delivers-a-stunning-sound-with-her-single-linen/",
			image: "https://static.wixstatic.com/media/63f51d_5a24899498cc450381d11a1d189d68de~mv2.png/v1/fill/w_602,h_126,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/earmilk-logo-2.png"
		},
		{
			name: "PitchFork",
			link: "https://pitchfork.com/reviews/albums/21378-5-oclock-shadow/",
			image: "https://drive.google.com/uc?id=1oac4F1O4RWvOGtS1h9NNOP2YACj3Q-6P"
		},
		{
			name: "Vents Magazine",
			link: "https://ventsmagazine.com/2023/07/14/interview-ella-rossi/",
			image: "https://jeffbluemedia.com/wp-content/uploads/2021/09/VentsMag-pub-1.png"
		},
		{
			name: "Press Party",
			link: "https://www.pressparty.com/pg/newsdesk/anrfactory/view/334709/",
			image: "https://drive.google.com/uc?id=1a_PMdQBcGb91cf3fEHvzSoA8JgeQH_fO"
		},
		{
			name: "Celeb Mix",
			link: "https://celebmix.com/ella-rossi-drops-emotional-indie-soul-pop-single-titled-linen/",
			image: "https://images.squarespace-cdn.com/content/6323768be71b3e54022ab86d/1675720514231-95D4AGHTM2ICG22FI37S/Green%2Band%2BBlack%2BGaming%2BYouTube%2BChannel%2BArt%2B%282560%2B%C3%97%2B720%2Bpx%29-3.png?format=1500w&content-type=image%2Fpng"
		},
		{
			name: "AnRFactory",
			link: "https://www.anrfactory.com/spotlight-feature-ella-rossi-negated-adorated-anxiety-in-her-ethereal-indie-soul-pop-sophomore-single-linen/",
			image: "https://www.anrfactory.com/wp-content/uploads/2021/11/AR_FACTORY_MINIMAL-LOGO-WEBSITE.png"
		},
		{
			name: "Buzz Music",
			link: "https://www.buzz-music.com/post/maria-alexa-asks-for-a-sign-in-a-new-single-wake-me-up",
			image: "https://drive.google.com/uc?id=1FnS-sNaBzj-BwpQyC-l-Pbomfx-FtH4X"
		},
		{
			name: "Wonderland",
			link: "https://www.wonderlandmagazine.com/2022/09/26/new-noise-maria-alexa/",
			image: "https://images.squarespace-cdn.com/content/v1/615881a67d3039460c6c8340/66eb5f65-3f1b-4607-ae1c-c2f4f0f6a80c/wonderland.png"
		},
		{
			name: "ThisIsEarhart",
			link: "https://thisisearhart.com/independent-artist-features/alex-mali-2",
			image: "https://drive.google.com/uc?id=1PqaWFsJWJpX0thXFBvTckHbMFAuwxSzh"
		},
		{
			name: "The Hype Magazine",
			link: "https://www.thehypemagazine.com/2022/02/la-rodriguez-makes-major-waves-with-his-latest-visual-phone-line/",
			image: "https://drive.google.com/uc?id=14KfhWJXyoP11CYhHBCKemT391GDoKKu_"
		},
		{
			name: "TwoDopeBoyz",
			link: "https://2dopeboyz.com/2015/04/07/jay-bel-transeuro-jimi-tents/",
			image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2DOPEBOYZ_Logo.svg/2560px-2DOPEBOYZ_Logo.svg.png"
		},
		{
			name: "HotNewHipHop",
			link: "https://www.hotnewhiphop.com/569560-jay-bel-transeuro-feat-jimi-tents-new-song",
			image: "https://upload.wikimedia.org/wikipedia/en/4/42/HotNewHipHop_Logo_new.png"
		},
		{
			name: "Respect Magazine",
			link: "https://respect-mag.com/2015/04/sleeper-camps-not-sleeping-jay-bel-feat-jimi-tents-transeuro/",
			image: "https://respect-mag.com/wp-content/uploads/2022/09/respectlogo1.png"
		},
		{
			name: "The Source",
			link: "https://thesource.com/2015/04/08/listen-to-jay-bels-transeuro-featuring-jimi-tents/",
			image: "https://thesource.com/wp-content/uploads/2021/02/TheSource-scaled.jpg"
		},

	]



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
		<motion.div className='press-container'
		initial='hidden'
		animate='show'
		exit='exit'
		variants={fadeOut}
		>
			<h1 style={{ textAlign: 'center', padding: '1em', fontSize:"5vw" }}> PRESS </h1>

			<div className='press-links'>

				{
					pressLinks.map((item,idx) => {
						return (
							<div className='item-container'>
								<img onClick={() => goToLink(item.link)} className={ item.name === 'AnRFactory' ? 'anr' : 'item-link'} src={item.image} />
							</div>
						)
					})
				}

			</div>

		</motion.div>
	)
}

export default Press

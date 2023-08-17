import React from 'react'
import './styles.css'

const Press = () => {


	const goToLink = (link : string) => {

		return (window.location.href = link)

	}

	const pressLinks = [
		{
			name: "Vents Magazine",
			link: "https://ventsmagazine.com/2023/07/14/interview-ella-rossi/",
			image: "https://amu.education/wp-content/uploads/2022/01/vents-magazine-logo-1-1024x413.png"
		},
		{
			name: "Press Party",
			link: "https://www.pressparty.com/pg/newsdesk/anrfactory/view/334709/",
			image: "https://images.squarespace-cdn.com/content/v1/5d45e2509b91490001751691/ffe64873-975b-4403-8c39-c7ae1d2e91ab/logo_hr.png"
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
			image: "https://d10j3mvrs1suex.cloudfront.net/s:bzglfiles/u/41884/27d0535a2a80bc21e2a88b81cfa63c454df48a44/original/buzzmusic.jpg/!!/meta%3AeyJzcmNCdWNrZXQiOiJiemdsZmlsZXMifQ%3D%3D.jpg"
		},
		{
			name: "Wonderland",
			link: "https://www.wonderlandmagazine.com/2022/09/26/new-noise-maria-alexa/",
			image: "https://images.squarespace-cdn.com/content/v1/615881a67d3039460c6c8340/66eb5f65-3f1b-4607-ae1c-c2f4f0f6a80c/wonderland.png"
		},
		{
			name: "ThisIsEarhart",
			link: "https://thisisearhart.com/independent-artist-features/alex-mali-2",
			image: "https://images.squarespace-cdn.com/content/v1/5a444d5bace864a5558b1050/1517955235516-5Z2ROIYQIJB9CL0G74UQ/Earhart+logo.jpg"
		},
		{
			name: "Medium",
			link: "https://medium.com/offthercrd/now-playing-sweet-sour-971798e57fee",
			image: "https://s3-alpha.figma.com/hub/file/3791871911/a9b9bab0-3908-4bed-a280-40803374c25d-cover.png"
		},
		{
			name: "The Hype Magazine",
			link: "https://www.thehypemagazine.com/2022/02/la-rodriguez-makes-major-waves-with-his-latest-visual-phone-line/",
			image: "https://www.universenetwork.tv/public/files/shows/2/2794/126-800x450-FFFFFF.jpg"
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
			image: "https://respectmag.shop/cdn/shop/files/RESPECT_RED_Logo-R_2550x.png?v=1616815397"
		},
		{
			name: "The Source",
			link: "https://thesource.com/2015/04/08/listen-to-jay-bels-transeuro-featuring-jimi-tents/",
			image: "https://thesource.com/wp-content/uploads/2021/02/TheSource-scaled.jpg"
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

	]

	return (
		<div className='press-container'>
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

		</div>
	)
}

export default Press

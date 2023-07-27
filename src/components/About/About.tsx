import React from 'react'
import './styles.css'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const About = () => {
	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])

	return (
		<div className='about-container'>
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
				<p>
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
				</p>
			</section>
			<div style={{ display:"flex", justifyContent:"center", alignItems:"center"}}>
			<Link to="/contact">
			<div className='about-lower-title'> Work With Us </div>
			</Link>
			</div>
			{/* <section className='section' id='process'>
				<h2>The Process</h2>
				<p>
					Click on the hamburger menu icon to see the vertical popout menu.
					Scroll down to see how it adapts to the background color. The menu
					icon is created using pure CSS, and the color of the menu adapts to
					the background color of the page by setting mix-blend-mode to
					"difference". The toggle animation only needs a tiny bit of
					JavaScript. This demo was tested in the latest versions of Chrome,
					Firefox and Safari. It also works on mobile.
				</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nunc
					tellus, tempor vitae elit ac, ornare aliquet elit. Vivamus ac
					tincidunt est, vehicula semper neque. Aliquam eu velit mi. Mauris vel
					lorem sollicitudin, sollicitudin sem vel, pulvinar risus. Pellentesque
					ac pulvinar erat, quis aliquet lectus. Integer diam odio, auctor non
					ullamcorper scelerisque, imperdiet non est. Sed vulputate porttitor
					lorem, sit amet feugiat tortor pretium tristique. Lorem ipsum dolor
					sit amet, consectetur adipiscing elit. Sed ultrices, lectus at
					ultricies tempus, massa lorem tincidunt urna, at porta nulla massa ac
					est. Aliquam commodo auctor tempus. In molestie nisl eget diam
					scelerisque, vel porta metus euismod. Praesent venenatis augue
					dignissim, vestibulum ex eget, vestibulum sem. In varius est leo. Nam
					id lobortis erat. Etiam et metus sit amet justo consectetur lacinia
					faucibus in elit. Aenean elit lorem, pellentesque sed pellentesque at,
					cursus eget felis.
				</p>
			</section>
			<section className='section' id='growth'>
				<h2>Growth</h2>
				<p>
					Click on the hamburger menu icon to see the vertical popout menu.
					Scroll down to see how it adapts to the background color. The menu
					icon is created using pure CSS, and the color of the menu adapts to
					the background color of the page by setting mix-blend-mode to
					"difference". The toggle animation only needs a tiny bit of
					JavaScript. This demo was tested in the latest versions of Chrome,
					Firefox and Safari. It also works on mobile.
				</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nunc
					tellus, tempor vitae elit ac, ornare aliquet elit. Vivamus ac
					tincidunt est, vehicula semper neque. Aliquam eu velit mi. Mauris vel
					lorem sollicitudin, sollicitudin sem vel, pulvinar risus. Pellentesque
					ac pulvinar erat, quis aliquet lectus. Integer diam odio, auctor non
					ullamcorper scelerisque, imperdiet non est. Sed vulputate porttitor
					lorem, sit amet feugiat tortor pretium tristique. Lorem ipsum dolor
					sit amet, consectetur adipiscing elit. Sed ultrices, lectus at
					ultricies tempus, massa lorem tincidunt urna, at porta nulla massa ac
					est. Aliquam commodo auctor tempus. In molestie nisl eget diam
					scelerisque, vel porta metus euismod. Praesent venenatis augue
					dignissim, vestibulum ex eget, vestibulum sem. In varius est leo. Nam
					id lobortis erat. Etiam et metus sit amet justo consectetur lacinia
					faucibus in elit. Aenean elit lorem, pellentesque sed pellentesque at,
					cursus eget felis.
				</p>
			</section>
			<section className='section' id='end'>
				<h2>Ending Statement</h2>
				<p>
					Click on the hamburger menu icon to see the vertical popout menu.
					Scroll down to see how it adapts to the background color. The menu
					icon is created using pure CSS, and the color of the menu adapts to
					the background color of the page by setting mix-blend-mode to
					"difference". The toggle animation only needs a tiny bit of
					JavaScript. This demo was tested in the latest versions of Chrome,
					Firefox and Safari. It also works on mobile.
				</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nunc
					tellus, tempor vitae elit ac, ornare aliquet elit. Vivamus ac
					tincidunt est, vehicula semper neque. Aliquam eu velit mi. Mauris vel
					lorem sollicitudin, sollicitudin sem vel, pulvinar risus. Pellentesque
					ac pulvinar erat, quis aliquet lectus. Integer diam odio, auctor non
					ullamcorper scelerisque, imperdiet non est. Sed vulputate porttitor
					lorem, sit amet feugiat tortor pretium tristique. Lorem ipsum dolor
					sit amet, consectetur adipiscing elit. Sed ultrices, lectus at
					ultricies tempus, massa lorem tincidunt urna, at porta nulla massa ac
					est. Aliquam commodo auctor tempus. In molestie nisl eget diam
					scelerisque, vel porta metus euismod. Praesent venenatis augue
					dignissim, vestibulum ex eget, vestibulum sem. In varius est leo. Nam
					id lobortis erat. Etiam et metus sit amet justo consectetur lacinia
					faucibus in elit. Aenean elit lorem, pellentesque sed pellentesque at,
					cursus eget felis.
				</p>
			</section> */}
		</div>
	)
}

export default About

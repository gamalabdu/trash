import React, { useEffect, useState } from 'react'
import emailjs from '@emailjs/browser';
import './styles.css'
import {motion} from 'framer-motion'

const Contact = () => {

	const title = 'Contact'

	const DynamicPage = ( title : string ) => {
		useEffect(() => {
		  document.title = `TRASH - ${title}`; // Update the document title
		}, [title]);
	  }
  
	  DynamicPage(title)
	
	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])
	

	const goToLink = () => {
		return (window.location.href = 'https://www.instagram.com/trashdidthis/')
	}

	
	const [ name, setName ] = useState<string>('');
	const [ email, setEmail ] = useState<string>('');
	const [ number, setNumber ] = useState<string>('');
	const [ message, setMessage ] = useState<string>('');
	const [ emailSent, setEmailSent ] = useState<boolean>(false)

	const cancel = () => {
		setName('')
		setEmail('')
		setMessage('')
		setNumber('')
	}


	const submit = (e : any) => {

		e.preventDefault();

		if (name && email && message && number) {
		   // TODO - send mail

		   const serviceId = 'service_myjt0kl';
           const templateId = 'template_b4dqwsp';
           const publicKey = 'KVU-q2F3LzvDvALcj';

            const templateParams = {
                name,
                email,
				number,
                message
            };

            emailjs.send(serviceId, templateId, templateParams, publicKey)
                .then(response => console.log(response))
                .then(error => console.log(error));
	
			setName('')
			setEmail('')
			setMessage('')
			setNumber('')
			setEmailSent(true)
		} else {
			alert('Please fill in all fields.');
		}
	}

	// const isValidEmail = (email: string) => {
	// 	const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	// 	return regex.test(String(email).toLowerCase());
	// };

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
			<motion.div className='background'
			initial='hidden'
			animate='show'
			exit='exit'
			variants={fadeOut}
			>
				<div className='contact-container'>
					<div className='screen'>
						<div className='screen-header'>
							<div className='screen-header-left'>
								<div className='screen-header-button close'></div>
								<div className='screen-header-button maximize'></div>
								<div className='screen-header-button minimize'></div>
							</div>
							<div className='screen-header-right'>
								<div className='screen-header-ellipsis'></div>
								<div className='screen-header-ellipsis'></div>
								<div className='screen-header-ellipsis'></div>
							</div>
						</div>
						{
							emailSent ? 
							<div style={{ height:"100%", width:"100%", padding:"20%", textAlign:"center"}}> 

								Thank You for reaching out. We'll be in touch soon!
							
							</div>
							:
							<div className='screen-body'>
							<div className='screen-body-item left'>
								<div className='app-title'>
									<span>CONTACT</span>
									<span>US</span>
								</div>
								<div className='app-contact'>
									<div>CONTACT INFO : trashdidthis@gmail.com</div>
									<br/>
									<div> or DM us on Instagram <div style={{ cursor:"pointer", textDecorationLine:"underline" }} onClick={() => goToLink()}> @trashdidthis </div> </div>
								</div>
							</div>
							<div className='screen-body-item'>
								<div className='app-form'>
									<div className='app-form-group'>
										<input
											className='app-form-control'
											placeholder='NAME'
											value={name}
											onInput={ (e) => setName(e.currentTarget.value)}
										/>
									</div>
									<div className='app-form-group'>
										<input 
											className='app-form-control' 
											placeholder='EMAIL' 
											value={email}
											onInput={ (e) => setEmail( e.currentTarget.value) }
										/>
									</div>
									<div className='app-form-group'>
										<input
											className='app-form-control'
											placeholder='CONTACT NUMBER'
											value={number}
											onInput={ (e) => setNumber(e.currentTarget.value)}
										/>
									</div>
									<div className='app-form-group message'>
										<textarea 
											className='app-form-control' 
											placeholder='MESSAGE' 
											value={message}
											onInput={ (e) => setMessage(e.currentTarget.value)}
										/>
									</div>
									<div className='app-form-group buttons'>
										<button className='app-form-button' onClick={cancel}>CANCEL</button>
										<button className='app-form-button' onClick={ e => submit(e) }>SEND</button>
									</div>
								</div>
							</div>
						</div>

						}
					</div>
				</div>

			</motion.div>
	)
}

export default Contact

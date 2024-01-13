import React from 'react'
import './styles.css'

interface IPasswordPageProps {
    password: string,
    setPassword : Function,
    authenticateUser: Function
}

const PasswordPage = (props : IPasswordPageProps) => {

    const {password, setPassword, authenticateUser } = props


  return (
		<div className='password-page-container'>
			<div className='password-container'>
				<div className='password-title'> Please Enter Password : </div>
				<input
					className='password-input'
					value={password}
					onChange={(e) => setPassword(e.currentTarget.value)}
				/>
				<button className='password-btn' onClick={() => authenticateUser()}>
					{' '}
					Enter{' '}
				</button>
			</div>
		</div>
	)
}

export default PasswordPage
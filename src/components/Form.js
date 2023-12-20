import '../blocks/form/form.css';
import { useState } from 'react';

export default function Form({
  handleSubmitAction,
  buttonContent
}) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showMistake, setShowMistake] = useState(false);

  let handleSubmit = (e) => {
    e.preventDefault();
    if (buttonContent !== 'LOG IN') {
      password === passwordConfirm ? 
      handleSubmitAction({email, password}) : 
      setShowMistake(true)
    } else handleSubmitAction({email, password})
  }

  function handleEmailChange(e) {
    setEmail(e.target.value)
  }
  function handlePasswordChange(e) {
    setShowMistake(false)
    setPassword(e.target.value)
  }
  function handlePasswordConfirmChange(e) {
    setShowMistake(false)
    setPasswordConfirm(e.target.value)
  }

  return (
    <form className='form' onSubmit={handleSubmit}>
      <label >E-mail:</label>
      <input onChange={handleEmailChange} value={email} type='email' className='form__input' />
      <label >Password:</label>
      <input onChange={handlePasswordChange} value={password} type='password' className='form__input' minLength={8}/>
      { buttonContent !== 'LOG IN' && <>
      <label >Confirm password:</label>
      <input onChange={handlePasswordConfirmChange} value={passwordConfirm} type='password' className='form__input' />
      {showMistake && <p className='form__mistake'>Passwords mismatch</p>}
      </>}
      <button className='button form__btn-submit'>{buttonContent}</button>
    </form>
  )
}

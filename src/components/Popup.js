import '../blocks/popup/popup.css';
import Form from './Form';

export default function Popup({handleLogIn, handleCreatNewAccount, handleOpenClick, handleCloseCLick, isOpen, isOpenLogIn, isOpenNewAccount, handleOpenFormLogIn, handleOpenFormNewAccount}) {

  return (
    <>
      <button className="popup__button" onClick={handleOpenClick}>
        i
        <div className="popup__button-div2"></div>
        <div className="popup__button-div1"></div>
      </button>

     { isOpen && <div className="popup" onClick={handleCloseCLick}>
        <div className='popup__content-container' onClick={(e)=> e.stopPropagation()}>
          <p>For working from different devices and synchronization, you need to 
          {' '}
          <a href='/' className='popup__link' onClick={handleOpenFormLogIn}>Log in</a> 
          {' or '}
          <a href='/' className='popup__link' onClick={handleOpenFormNewAccount}>Registration</a>
          </p>

          {isOpenLogIn && <Form buttonContent='LOG IN' handleSubmitAction={handleLogIn} /> }
          {isOpenNewAccount && <Form buttonContent='Create a new account' handleSubmitAction={handleCreatNewAccount} /> }

        </div>
      </div>}
    </>
  )
}
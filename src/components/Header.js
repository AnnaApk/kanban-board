import { selectUser } from '../context/user';
import { useSelector } from 'react-redux';
import '../blocks/header/header.css';
import Button from './Button';

export default function Header({handleLogOut}) {

  const {email} = useSelector(selectUser);

  return (
    <div className='header'>
      <p>{email}</p>
      <Button content='Log out' handleClick={handleLogOut} />
    </div>
  )
}
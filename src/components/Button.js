import '../blocks/button/button.css';
import DeleteIcon from './DeleteIcon';
import { selectUser } from '../context/user';
import { useSelector } from 'react-redux';

export default function Button({content, handleClick, type, columnORtaskID=null}) {

  let {id}= useSelector(selectUser); //initially check isAnyUserLogIN

  const style = (type === 'delete') ? 'button button_delete' : 'button button_add';

  let onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleClick({userID:id, columnID:columnORtaskID, taskID:columnORtaskID});
  }

  return (
    <button 
      className={style}
      onClick={onClick}
    >
      {(type === 'delete') ? <DeleteIcon /> : `${content}`}
    </button>
  )
}
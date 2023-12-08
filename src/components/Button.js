import '../blocks/button/button.css';
import DeleteIcon from './DeleteIcon';

export default function Button({content, handleClick, type, id=null}) {

  const style = (type === 'delete') ? 'button button_delete' : 'button button_add';

  let onClick = (e) => {
    e.preventDefault();
    handleClick(id);
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
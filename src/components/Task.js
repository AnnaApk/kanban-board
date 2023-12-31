import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from "./Button";
import '../blocks/task/task.css';
import { useState } from "react";

import { selectUser } from '../context/user';
import { useSelector } from 'react-redux';

export default function Task({task, handleDeleteTask, updateTask}) {

  let {id}= useSelector(selectUser); //initially check isAnyUserLogIN

  const {idColumn,content} = task;
  const taskID = task.id;

  const [editModeTask, setEditModeTask] = useState(false);
  const [ isMouseOver, setIsMouseOver] = useState(false);
  const [ input, setInput ] = useState(content);

  let handleClick = () => {
    setEditModeTask(true)
    setIsMouseOver(false)
  }
  function handleChange(e) {
    setInput(e.target.value)
  }

  const {setNodeRef, attributes, listeners, transform, transition} = useSortable({
    id:taskID,
    data: {
      type: 'task',
      task, /// {idColumn, id, content}
    },
    // disabled:editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task" 
      onClick={handleClick}
      onMouseEnter={e => editModeTask || setIsMouseOver(true)}
      onMouseLeave={e => setIsMouseOver(false)}
    >
      { editModeTask ? <textarea 
      className="task__textarea"
      autoFocus
      onBlur={()=>{
        setEditModeTask(false)
        // setInput(name)
      }}
      placeholder="Task"
      value={input}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.shiftKey) {
        updateTask({input, id:taskID, userID:id, columnID:idColumn});    ///updateTask = ({userID,id, input, columnID})
        setEditModeTask(false)
        }
        return
      }}
      onChange={handleChange}
      ></textarea> : <p className="task__content">{content}</p>} 

      { isMouseOver && <Button 
        type='delete' 
        columnORtaskID={taskID} 
        handleClick={handleDeleteTask}
      />}
    </div>
  )
}
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from "./Button";
import '../blocks/task/task.css';
import { useState } from "react";

export default function Task({task, handleDeleteTask, updateTask}) {
  const {content, id} = task;

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
    id:id,
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
        updateTask({input, id});
        setEditModeTask(false)
        }
        return
      }}
      onChange={handleChange}
      ></textarea> : <p className="task__content">{content}</p>} 

      { isMouseOver && <Button 
        type='delete' 
        id={id} 
        handleClick={handleDeleteTask}
      />}
    </div>
  )
}
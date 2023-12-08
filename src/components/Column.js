import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import '../blocks/column/column.css';
import Button from './Button';
import { useMemo, useState } from 'react';
import Task from './Task';

export default function Column({id, name, handleClick, updateColumnName, handleAddTask, tasks, handleDeleteTask, updateTask}) {

  const [editMode, setEditMode] = useState(false);
  const [input, setInput] = useState(name);
  
  const tasksIds = useMemo(() => {
    return tasks.map(task => task.id)
  }, [tasks])
  
  const {setNodeRef, attributes, listeners, transform, transition} = useSortable({
    id:id,
    data: {
      type: 'column',
      name: name,
      id:id,
    },
    // disabled:editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className='column' ref={setNodeRef} style={style}>
      <div id={id} className='column__header' {...attributes} {...listeners} onClick={onHeaderClick}>
        <div className='column__header-container' >
          <div className='column__tasks-number'>{tasks.length || 0}</div>
          {editMode ? <input
          type='text' 
          autoFocus 
          onBlur={()=>{
            setEditMode(false)
            setInput(name)
          }}
          onChange={handleChange}
          value={input}
          onKeyDown={handleKeyDown}
          className='column__input'
          /> : `${name}`}
        </div>
        
        <Button
          handleClick={handleClick}
          type='delete'
          id={id}
        />
      </div>
      <div className='column__content'>
        <SortableContext items={tasksIds}>
          {tasks.map( task => {
            return (
              <Task key={task.id} task={task} handleDeleteTask={handleDeleteTask} updateTask={updateTask}/>
            )
          })}
        </SortableContext>
       
      </div>
      <Button 
      content='Add task'
      handleClick={handleAddTask}
      type='add'
      id={id} //column id
      />
    </div>
  )

  function onHeaderClick() {
    setEditMode(true);
  }
  function handleChange(e) {
    setInput(e.target.value)
  }
  function handleKeyDown(e) {
    if (e.key !== 'Enter') return
    updateColumnName({input, id});
    setEditMode(false)
  }
}
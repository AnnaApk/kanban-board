import { useEffect, useMemo, useState } from 'react';
import '../blocks/app/app.css';
import Button from './Button';
import Column from './Column';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {SortableContext, arrayMove} from '@dnd-kit/sortable';

function App() {

  const [columns, setColumns] = useState(JSON.parse(localStorage.getItem('kanban-board-columns')) || []);
  const [tasks, setTasks] = useState(JSON.parse(localStorage.getItem('kanban-board-tasks')) ||[]);

  let handleClickAddColumn = () => {
    setColumns([...columns, {name: 'Column ' + (columns.length + 1), id: Math.ceil(Math.random()*100000)} ]);
    // localStorage.setItem('kanban-board', JSON.stringify(columns));
  }

  let handleClickDeleteColumn = (id) => {
    const filteredColumns = columns.filter( el => el.id !== id)
    const filteredTasks = tasks.filter(task => task.idColumn !== id)
    setColumns(filteredColumns)
    setTasks(filteredTasks)
  }

  let updateColumnName = ({id, input}) => {
    const update = columns.map(el => {
      if (el.id !== id)  return el
      return {...el, name:input}
    })
    setColumns(update)
  }

  let handleAddTask = (id) => {
    const newTask = {
      idColumn: id,
      id: Math.ceil(Math.random()*100000),
      content: 'Task ' + (tasks.length + 1),
    }
    setTasks([...tasks, newTask])
  }

  let handleDeleteTask = (id) => {
    const filteredTasks = tasks.filter(task => task.id !== id)
    setTasks(filteredTasks)
  }

  let updateTask = ({id, input}) => {
    const updatedTasks = tasks.map(task => {
      if (task.id !== id) return task
      return {...task, content:input}
    })
    setTasks(updatedTasks)
  }

  /// dnd-kit 
  const columnsID = useMemo(() => columns.map(el => el.id), [columns]);
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  //managing the area from where dnd starts to work, just move for this 'distance', to provide work other buttons
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 3,
    }
  }));

  function onDragStart(event) {
    if (event.active.data.current?.type === 'column') {
      setActiveColumn(event.active.data.current.id)
      return
    }
    if (event.active.data.current?.type === 'task') {
      setActiveTask(event.active.data.current.task)
      return
    }
  }
  function onDragEnd(event) {
    setActiveTask(null)
    setActiveColumn(null)

    const {active,over} = event; /// {active, over}

    if (!over) return
    
    const activeId = active.id;  /// active
    const overId = over.id;

    if ( activeId === overId) return

    setColumns(columns => {
      const draggindColumn = columns.findIndex(el => el.id === activeId)
      const overColumn = columns.findIndex(el => el.id === overId)
      return arrayMove(columns, draggindColumn, overColumn)
    })
  }
  function onDragOver(event) {
    const {active,over} = event; /// {active, over}

    if (!over) return
    
    const activeId = active.id;  /// active
    const overId = over.id;

    if ( activeId === overId) return

    if (!activeTask) return

    const isActiveTask = active.data.current.type === 'task'
    const isOverTask = over.data.current.type === 'task'
    /// dropping a task over another task
    if (isActiveTask && isOverTask) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(el => el.id === activeId)
        const overIndex = tasks.findIndex(el => el.id === overId)

        tasks[activeIndex].idColumn = tasks[overIndex].idColumn

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }
    /// dropping a task over am ampty other column
    const isOverColumn = over.data.current.type === 'column'

    if (isActiveTask && isOverColumn) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(el => el.id === activeId)

        tasks[activeIndex].idColumn = overId

        return arrayMove(tasks, activeIndex, activeIndex)
      })
    }
  }
  /// dnd-kit end

  useEffect(() => {
    localStorage.setItem('kanban-board-columns', JSON.stringify(columns));
  }, [columns])
  useEffect(() => {
    localStorage.setItem('kanban-board-tasks', JSON.stringify(tasks));
  }, [tasks])

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver} sensors={sensors}>
      <div className="app">
        <SortableContext items={columnsID}>
        {columns.map(el => {
          return <Column
            key={el.id}
            id={el.id}
            name={el.name}
            handleClick={handleClickDeleteColumn}
            updateColumnName={updateColumnName}
            handleAddTask={handleAddTask}
            tasks={tasks.filter(task => task.idColumn === el.id )}
            handleDeleteTask={handleDeleteTask}
            updateTask={updateTask}
          />
        })}
        </SortableContext>
        
        <Button   
          content='Add column'
          handleClick={handleClickAddColumn}
          type='add'
        />

      </div>
      {/* patch */}
     {activeColumn ? <></> : <></>} 
     {/* patch end */}
    </DndContext>
  );
}

export default App;

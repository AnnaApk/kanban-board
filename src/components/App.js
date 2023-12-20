import { useEffect, useMemo, useState } from 'react';
import '../blocks/app/app.css';
import Header from './Header';
import Button from './Button';
import Column from './Column';
import Footer from './Footer';
import Popup from './Popup';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {SortableContext, arrayMove} from '@dnd-kit/sortable';

import { logIn, logOut, selectUser } from '../context/user';
import { useDispatch, useSelector } from 'react-redux';
//import { ref, onValue } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { creatUser, logInUser, signOutUser, getData, addNewColumn, deleteColumn, updateColumn, addNewTask, deleteTask, updateTaskDB } from '../api/firebase';

export default function App() {
  const dispatch = useDispatch();
  const auth = getAuth();

  let {user,id}= useSelector(selectUser); //initially check isAnyUserLogIN

  const [columns, setColumns] = useState(getInitialData({id, user}));
  const [tasks, setTasks] = useState(getInitialTasks({id, user}));

  // const tasksRef = ref(db, id + `/tasks/`);
  // onValue(tasksRef, (snapshot) => {
  //   const data = snapshot.val();
  //   console.log('onValue',snapshot.val())
  //   setTasks(data);
  // }); 

  const [isOpen, setIsOpen] = useState(false); /// popup
  const [isOpenLogIn, setIsOpenLogIn] = useState(false);
  const [isOpenNewAccount, setIsOpenNewAccount] = useState(false);

  function handleClickAddColumn() {
    if (user) {
      addNewColumnDB({userID:id})
    } else {
      setColumns([...columns, {name: 'Column ' + (columns.length + 1), id: Math.ceil(Math.random()*100000)} ])
      addNewColumnLS({str:'kanban-board-columns', state:columns})
    }
  }

  function handleClickDeleteColumn({columnID, userID}) {
    if (!user) {
      const filteredColumns = columns.filter( el => el.id !== columnID)
      const filteredTasks = tasks.filter(task => task.idColumn !== columnID)
      setColumns(filteredColumns)
      setTasks(filteredTasks)
    } else {
      deleteColumn({userID:userID, id:columnID})
      .then(() => {
        return getInitialDataDB({id:userID, str:'columns'})
      })
      .then((data) => {
        setColumns(data)
      })
      .then(() => {
        let arr = tasks.filter(task => task.idColumn === columnID)
        for (let task of arr) {
          deleteTask({userID, id:task.id}).then().catch()
        }
      })
      .catch()
    }
  }

  let updateColumnName = ({userID, id, input}) => {
    if (!user) {
      const update = columns.map(el => {
        if (el.id !== id)  return el
        return {...el, name:input}
      })
      setColumns(update)
    } else {
      updateColumn({userID:userID, id:id, column:input})
      .then(() => {
        return getInitialDataDB({id:userID, str:'columns'})
      })
      .then((data) => {
        setColumns(data)
      })
      .catch()
    }
  }

  let handleAddTask = ({columnID}) => {
    if (!user) {
      const newTask = {
        idColumn: columnID,
        id: Math.ceil(Math.random()*100000),
        content: 'Task ' + (tasks.length + 1),
      }
      setTasks([...tasks, newTask])
    } else {
      addNewTask({userID:id, columnID})
      .then(snapshot => {
        if (snapshot.key) {
          let data = getInitialDataDB({id, str:'tasks'}).then((res)=> res);
          return data
        } else {
          console.log("No snapshot in addNewColumnDB");
        }
      })
      .then(data => setTasks(data))
      .catch()
    }
  }

  let handleDeleteTask = ({userID=id, taskID}) => {
    if (!user) {
      const filteredTasks = tasks.filter(task => task.id !== taskID)
      setTasks(filteredTasks)
    } else {
      deleteTask({userID, id:taskID})
      .then(() => {
        return getInitialDataDB({id:userID, str:'tasks'})
      })
      .then((data) => {
        setTasks(data)
      })
      .catch()
    }
  }

  let updateTask = ({userID,id, input, columnID}) => {
    if (!user) {
      const updatedTasks = tasks.map(task => {
        if (task.id !== id) return task
        return {...task, content:input}
      })
      setTasks(updatedTasks)
    } else {
      updateTaskDB({userID, taskID:id, task:input, columnID})
      .then(() => {
        return getInitialDataDB({id:userID, str:'tasks'})
      })
      .then((data) => {
        setTasks(data)
      })
      .catch()
    }
  }

  /// dnd-kit 
  
  const columnsID = useMemo(() => {console.log(columns); return columns.map(el => el.id)}, [columns]);
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
      setActiveColumn(null)
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(el => el.id === activeId)
        const overIndex = tasks.findIndex(el => el.id === overId)

        tasks[activeIndex].idColumn = tasks[overIndex].idColumn

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }
    /// dropping a task over am ampty other column
    const isOverColumn = over.data.current.type === 'column';
    setActiveColumn(null)

    if (isActiveTask && isOverColumn) {

      if (!user) {
        setTasks( tasks => {
          const activeIndex = tasks.findIndex(el => el.id === activeId)
          tasks[activeIndex].idColumn = overId
          return arrayMove(tasks, activeIndex, activeIndex)
        })
      } else {
        const activeIndex = tasks.findIndex(el => el.id === activeId)
        if (tasks[activeIndex].idColumn !== overId) {
          updateTaskDB({userID:id, taskID:activeId, task:tasks[activeIndex].content, columnID:overId})
          .then(() => {
            return getInitialDataDB({id, str:'tasks'})
          })
          .then(data => setTasks(data))
          .catch()
        }
        return arrayMove(tasks, activeIndex, activeIndex)
      }
    }
  }
  
  /// dnd-kit end


  useEffect(() => {
    if (!user) localStorage.setItem('kanban-board-columns', JSON.stringify(columns));
  }, [columns, user])
  useEffect(() => {
    if (!user) localStorage.setItem('kanban-board-tasks', JSON.stringify(tasks));
  }, [tasks, user])
 
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        const email = user.email;
        dispatch(logIn({email:email,id:uid}))
        getInitialDataDB({id:uid, str:'columns'}).then((res)=>setColumns(res))
        getInitialDataDB({id:uid, str:'tasks'}).then((res)=>setTasks(res))  
      } else {   // User is signed out
        setColumns(getInitialDataLS('kanban-board-columns'))
        setTasks(getInitialDataLS('kanban-board-tasks'))
      } 
    });
  },[])

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver} sensors={sensors}>

      {user ? <Header handleLogOut={handleLogOut} /> : <Popup 
      handleLogIn={handleLogIn} 
      handleCreatNewAccount={handleCreatNewAccount} 
      handleOpenClick={handleOpenClick} 
      handleCloseCLick={handleCloseCLick} 
      isOpen={isOpen} 
      isOpenLogIn={isOpenLogIn} 
      isOpenNewAccount={isOpenNewAccount} 
      handleOpenFormLogIn={handleOpenFormLogIn} 
      handleOpenFormNewAccount={handleOpenFormNewAccount} />}

      <div className="app">
        <SortableContext items={columnsID}>
        {columns.map(el => {
          return <Column
            key={el.id}
            columnID={el.id}
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
          handleClick={() => {handleClickAddColumn(); }}
          type='add'
        />

      </div>
      {/* patch */} {activeColumn ? <></> : <></>} {/* patch end */}
      <Footer />
    </DndContext>
  );

  function handleCreatNewAccount({email,password}) {
    creatUser({email, password})
    .then(user => {
      console.log(user)
      setIsOpenLogIn(true)
      setIsOpenNewAccount(false)
    })
    .catch(err => {
      console.log(err)
    })
  }
  function handleLogIn({email,password}) {
    logInUser({email, password})
    .then(user => {
      // setColumns([])
      setIsOpenLogIn(false)
      setIsOpen(false)
      if (user.user) {
        localStorage.setItem('kanban-token', JSON.stringify(user.user.accessToken))
        dispatch(logIn({email:email,id:user.user.uid}))
      }
    })
    .catch(err => {
      console.log('catch', err)
    })
  }
  function handleLogOut() {
    signOutUser()
    .then(() => {
      // setColumns([])
      dispatch(logOut());
      localStorage.removeItem('kanban-token');
    })
    .catch()
  }
  function handleOpenClick() {
    setIsOpen(true);
  }
  function handleCloseCLick() {
    setIsOpen(false);
    setIsOpenLogIn(false);
    setIsOpenNewAccount(false);
  }
  function handleOpenFormLogIn(e) {
    e.preventDefault();
    setIsOpenNewAccount(false)
    setIsOpenLogIn(true)
  }
  function handleOpenFormNewAccount(e) {
    e.preventDefault();
    setIsOpenLogIn(false)
    setIsOpenNewAccount(true)
  }

  function getInitialData({id, user}) {
    if (user) {
      return getInitialDataDB({id:id, str:'columns'}).then((res)=> res)
    } else {   // User is signed out
      return getInitialDataLS('kanban-board-columns')
    } 
  }
  function getInitialTasks({id, user}) {
    if (user) {
      return getInitialDataDB({id:id, str:'tasks'}).then((res)=> res)
    } else {   // User is signed out
      return getInitialDataLS('kanban-board-tasks')
    } 
  }
  async function getInitialDataDB({id, str}) {  /// 'columns'  'tasks'
    // console.log('????', id, str)
    return  await getData({userID:id, category:str})
      .then(snapshot => {
        if (snapshot.exists()) {
          let data2 =[]
          if (str === 'columns') {
            const data = Object.entries(snapshot.val()).map(el=> [el[0],Object.values(el[1])[0]])
            for (let i of data) {
            data2.push({id:i[0],name:i[1]})}
          } else {
            console.log('cheeeekkkk', Object.entries(snapshot.val()).map(el=> [el[0],Object.values(el[1])[0], Object.values(el[1])[1]]))
            const data = Object.entries(snapshot.val()).map(el=> [ el[0] , Object.values(el[1])[0], Object.values(el[1])[1] ])
            for (let i of data) {
            data2.push({id:i[0], idColumn:i[1], content:i[2]})}
          }
          return data2
        } else {
          console.log("No data available", columns);
          return []
        }
      })
      .catch() 
  }
  function getInitialDataLS(str) {  /// 'kanban-board-columns' 'kanban-board-tasks'
    return (JSON.parse(localStorage.getItem(str)) || []);
  }
  async function addNewColumnDB({userID, column='column'}) {
    await addNewColumn({userID, column})
    .then(snapshot => {
      if (snapshot.key) {
        let data = getInitialDataDB({id:userID, str:'columns'}).then((res)=> res);
        return data
      } else {
        console.log("No snapshot in addNewColumnDB");
      }
    })
    .then(res => setColumns(res))
    .catch()
  }

  function addNewColumnLS({str, state} ) {  /// 'kanban-board-columns' 'kanban-board-tasks', columns or tasks
    localStorage.setItem(str, JSON.stringify(state))
  }
}

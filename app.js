let myTasks = []
let URL = "https://callous-waves-production.up.railway.app/"

//After edit button event, it assigns this to PointerEvent and I don't know how to chagne that
let task_id = 0
let user_id = 'admin'

let addButton = document.querySelector('#add-task-button')
let saveButton = document.querySelector('#save-task-button')

let queryUserButton = document.querySelector('#queryUsername')
let addUserButton = document.querySelector('#addUser')
let signOutButton = document.querySelector('#signOut')

saveButton.onclick = function () {
  let taskNameInput = document.querySelector('#task-name-edit')
  let taskDateAssignedInput = document.querySelector('#task-date-assigned-edit')
  let taskDueDateInput = document.querySelector('#task-due-date-edit')
  let taskPriorityInput = document.querySelector('#task-priority-edit')
  let taskDescInput = document.querySelector('#task-desc-edit')

  console.log(task_id)
  updateTaskOnServer(
    task_id,
    taskNameInput.value,
    taskDateAssignedInput.value,
    taskDueDateInput.value,
    taskPriorityInput.value,
    taskDescInput.value
  )

  taskNameInput.value = ''
  taskDateAssignedInput.value = ''
  taskDueDateInput.value = ''
  taskPriorityInput.value = ''
  taskDescInput.value = ''
}

addButton.onclick = function () {
  console.log('my button was clicked')

  let taskNameInput = document.querySelector('#task-name')
  let taskDateAssignedInput = document.querySelector('#task-date-assigned')
  let taskDueDateInput = document.querySelector('#task-due-date')
  let taskPriorityInput = document.querySelector('#task-priority')
  let taskDescInput = document.querySelector('#task-desc')

  createTaskOnServer(
    taskNameInput.value,
    taskNameInput.value,
    taskDateAssignedInput.value,
    taskDueDateInput.value,
    taskPriorityInput.value,
    taskDescInput.value
  )

  taskNameInput.value = ''
  taskDateAssignedInput.value = ''
  taskDueDateInput.value = ''
  taskPriorityInput.value = ''
  taskDescInput.value = ''
}

addUserButton.onclick = function () {
  console.log('Pressed addUserButton')
  let fname = document.querySelector('#fnameInput').value
  let lname = document.querySelector('#lnameInput').value
  let username = document.querySelector('#usernameInput').value
  let password = document.querySelector('#passwordInput').value
  if (fname !== '' && lname !== '' && username !== '' && password !== '') {
    document.querySelector('#fnameInput').value = ''
    document.querySelector('#lnameInput').value = ''
    document.querySelector('#usernameInput').value = ''
    document.querySelector('#passwordInput').value = ''

    data =
      'fname=' +
      encodeURIComponent(fname) +
      '&lname=' +
      encodeURIComponent(lname) +
      '&username=' +
      encodeURIComponent(username) +
      '&password=' +
      encodeURIComponent(password)

    console.log(fname, lname, username, password)
    console.log('data: ', data)
    fetch(URL + "users", {
      method: 'POST',
      body: data,
      credentials: 'include', //DO THIS ON ALL REQUESTS
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function (response) {
      if (response.status === 201) {
        document.querySelector('#addUserP').innerHTML = 'Created!'
      } else if (response.status === 400) {
        document.querySelector('#addUserP').innerHTML = 'User already exists!'
      } else {
        document.querySelector('#addUserP').innerHTML = 'Uh-oh! Something went wrong :(. Perhaps you meant to login?'
      }
    })
  } else {
    // document.querySelector('#addUserP').style.display = 'inline'
    document.querySelector('#addUserP').innerHTML = "Fields can't be empty"
  }
}

queryUserButton.onclick = function () {
  let usernameInput = document.querySelector('#usernameInput')
  let passwordInput = document.querySelector('#passwordInput')

  if (usernameInput.value != '' && passwordInput.value != '') {
    data =
      'username=' + encodeURIComponent(usernameInput.value) + '&password=' + encodeURIComponent(passwordInput.value)

    fetch(URL + "sessions/", {
      method: 'POST',
      body: data,
      credentials: 'include', //DO THIS ON ALL REQUESTS
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function (response) {
      console.log('response: ', response.status)
      if (response.status == 401) {
        console.log('not found')
        document.querySelector('#loginP').innerHTML = 'User Not Found'
      } else if (response.status == 201) {
        document.querySelector('#loginP').innerHTML = 'Found ' + usernameInput.value + ' in server'
        loadTasksFromServer()
      } else {
        document.querySelector('#loginP').innerHTML = 'Not Found'
      }
    })
  } else {
    document.querySelector('#loginP').style.display = 'inline'
    document.querySelector('#loginP').innerHTML = "Fields can't be empty"
  }
}

signOutButton.onclick = function () {
  console.log('pressed sign out')
  console.log('so sad to see you go :(')

  fetch(URL + "sessions/" + document.cookie.split('"')[1], {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(function (response) {
    document.querySelector('#fnameInput').value = ''
    document.querySelector('#lnameInput').value = ''
    document.querySelector('#usernameInput').value = ''
    document.querySelector('#passwordInput').value = ''

    document.querySelector('#usernameInput').value = ''
    document.querySelector('#passwordInput').value = ''

    document.querySelector('#loginP').innerHTML = ''
    document.querySelector('#addUserP').innerHTML = ''

    document.querySelector('#signInDiv').style.display = 'block'
    loadTasksFromServer()
  })
}

function loadTasksFromServer() {
  fetch(URL + "tasks", {
    credentials: 'include'
  }).then(function (response) {
    if (response.status != 200) {
      // if we aren't authorized, don't try to read bad data
      return
    }

    // If we are authorized from the server then un-hide the elements
    document.querySelector('#hidden_div').style.visibility = 'visible';

    response.json().then(function (data) {
      console.log('data received from server:', data)
      myTasks = data
      myTasks = myTasks.filter((task) => task.id)

      let myList = document.querySelector('#my-task-list')
      console.log('my list element:', myList)
      myList.innerHTML = ''

      // for loop ---> for task in myTasks:
      myTasks.forEach(function (task) {
        let newItem = document.createElement('li')

        let nameDiv = document.createElement('div')
        nameDiv.innerHTML = task.name
        nameDiv.classList.add('task-name')
        newItem.appendChild(nameDiv)

        let dateDiv = document.createElement('div')
        dateDiv.innerHTML = 'Date assigned: ' + task.date_assigned
        dateDiv.classList.add('task-date-assigned')
        newItem.appendChild(dateDiv)

        let dueDateDiv = document.createElement('div')
        dueDateDiv.innerHTML = 'Due date: ' + task.due_date
        dueDateDiv.classList.add('task-due-date')
        newItem.appendChild(dueDateDiv)

        let priorityDiv = document.createElement('div')
        priorityDiv.innerHTML = 'Priority: ' + task.priority
        priorityDiv.classList.add('task-priority')
        newItem.appendChild(priorityDiv)

        let descDiv = document.createElement('div')
        descDiv.innerHTML = task.desc
        descDiv.classList.add('task-desc')
        newItem.appendChild(descDiv)

        let deleteButton = document.createElement('button')
        deleteButton.innerHTML = 'Delete'
        deleteButton.onclick = function () {
          console.log('delete button was clicked for', task.name)
          if (confirm('Are you sure you want to delete ' + task.name + '?')) {
            deleteTaskFromServer(task.id)
          }
        }
        newItem.appendChild(deleteButton)

        let editButton = document.createElement('button')
        editButton.innerHTML = 'Edit'
        editButton.onclick = function () {
          console.log('edit button was clicked for', task.name)

          let taskNameInput = (document.querySelector('#task-name-edit').value = task.name)
          let taskDateAssignedInput = (document.querySelector('#task-date-assigned-edit').value = task.date_assigned)
          let taskDueDateInput = (document.querySelector('#task-due-date-edit').value = task.due_date)
          let taskPriorityInput = (document.querySelector('#task-priority-edit').value = task.priority)
          let taskDescInput = (document.querySelector('#task-desc-edit').value = task.desc)

          console.dir(task)
          task_id = task.id
          console.log(task_id)
        }
        newItem.appendChild(editButton)

        myList.appendChild(newItem)
      })
    })
  })
}

function createTaskOnServer(taskID, taskName, taskDateAssigned, taskDueDate, taskPriority, taskDesc) {
  let data = 'name=' + encodeURIComponent(taskName)
  data += '&date_assigned=' + encodeURIComponent(taskDateAssigned)
  data += '&due_date=' + encodeURIComponent(taskDueDate)
  data += '&priority=' + encodeURIComponent(taskPriority)
  data += '&desc=' + encodeURIComponent(taskDesc)
  console.log('sending data to server:', data)

  // For every fetch, add credentials include
  fetch(URL + "tasks/", {
    // request details:
    credentials: 'include',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(function (response) {
    // when the server responds:

    if (response.status == 201) {
      loadTasksFromServer()
    } else {
      console.log('server responded with', response.status, 'when trying to create a task')
    }
  })
}

function deleteTaskFromServer(taskId) {
  fetch(URL + "tasks/" + taskId, {
    credentials: 'include',
    method: 'DELETE'
  }).then(function (response) {
    if (response.status == 200) {
      loadTasksFromServer()
    } else {
      console.log('server responded with', response.status, 'when trying to delete a task')
    }
  })
}

function updateTaskOnServer(taskID, taskName, taskDateAssigned, taskDueDate, taskPriority, taskDesc) {
  let data = 'name=' + encodeURIComponent(taskName)
  data += '&date_assigned=' + encodeURIComponent(taskDateAssigned)
  data += '&due_date=' + encodeURIComponent(taskDueDate)
  data += '&priority=' + encodeURIComponent(taskPriority)
  data += '&desc=' + encodeURIComponent(taskDesc)

  fetch(URL + "tasks/" + taskID, {
    credentials: 'include',
    method: 'PUT',
    body: data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then(function (response) {
      if (response.status == 200) {
        loadTasksFromServer()
        console.log('Update task on server')
      } else {
        console.log('server responded with', response.status, 'when trying to edit a task')
      }
    })
    .catch(function (error) {
      console.log(error)
    })
}

loadTasksFromServer()

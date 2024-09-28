const http = require('http');
const url = require('url');
const querystring = require('querystring');

// Array of tasks with id, name, and completion status
let tasks = [
  { id: 1, name: 'Task 1', completed: false },
  { id: 2, name: 'Task 2', completed: false },
  { id: 3, name: 'Task 3', completed: true },
  { id: 4, name: 'Task 4', completed: false },
  { id: 5, name: 'Task 5', completed: true },
];

// Function to render the to-do list page
function renderTodoPage(res) {
  // Render each task with its name and completion status
  let taskList = tasks.map((task) => {
    return `<li>
              ${task.name} - ${task.completed ? 'Completed' : 'Pending'} 
              <a href="/toggle?id=${task.id}">Toggle Status</a>
              <a href="/delete?id=${task.id}">Delete</a>
            </li>`;
  }).join('');

  let html = `
    <html>
    <head><title> Fabian's To-Do List</title></head>
    <body>
      <h1>To-Do List</h1>
      <ul>${taskList}</ul>
      <form method="POST" action="/add">
        <input type="text" name="task" placeholder="New Task Name" required />
        <button type="submit">Add Task</button>
      </form>
    </body>
    </html>
  `;
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

// Create the server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Route to serve the tasks in JSON format
  if (req.method === 'GET' && parsedUrl.pathname === '/tasks') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tasks)); // Send tasks array as JSON
  } else if (req.method === 'GET' && parsedUrl.pathname === '/') {
    // Render the to-do list page
    renderTodoPage(res);
  } else if (req.method === 'POST' && parsedUrl.pathname === '/add') {
    // Handle adding a new task
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const parsedBody = querystring.parse(body);
      // Add the new task with an incremental ID and default "not completed" status
      const newTask = {
        id: tasks.length + 1,
        name: parsedBody.task,
        completed: false
      };
      tasks.push(newTask);
      res.writeHead(302, { Location: '/' });
      res.end();
    });
  } else if (req.method === 'GET' && parsedUrl.pathname === '/delete') {
    // Handle deleting a task
    const id = parseInt(parsedUrl.query.id);
    tasks = tasks.filter(task => task.id !== id);  // Remove task with matching id
    res.writeHead(302, { Location: '/' });
    res.end();
  } else if (req.method === 'GET' && parsedUrl.pathname === '/toggle') {
    // Handle toggling task completion status
    const id = parseInt(parsedUrl.query.id);
    tasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed }; // Toggle completion status
      }
      return task;
    });
    res.writeHead(302, { Location: '/' });
    res.end();
  } else {
    // Handle 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

// Start the server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});


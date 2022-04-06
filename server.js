const express = require('express');
const inquirer = require('inquirer')
// Import and require mysql2
const mysql = require('mysql2');
// const i = require('./helpers/index');
const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: '12345',
    database: 'employees_db'
  },
  console.log(`Connected to the employees_db database.`)
);

// Query database
// db.query('SELECT * FROM department', function (err, results) {
//   console.log(results);
// });

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function startQuestions(){
    inquirer.prompt ([
        {
            //  view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role

            name: 'choices',
            type: 'list',
            message: 'Please select from the following',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add a Department',
                'Add a role',
                'Add an employee',
                'Update employee role'
            ]}
    ]) .then ((answer) => {
        const {choices} = answer;
        if (choices === 'View All Departments'){
            viewAllDepartments();
        }
        if (choices === 'View All Roles'){
            viewAllRoles();
        }
        if (choices === 'View All Employees'){
            viewAllEmployees();
        }
    })
}


function viewAllDepartments(){
    const sql = `SELECT department.id, department.name AS department FROM department`;
    db.query(sql, (err, response) =>{
        if (err){
            console.log(err)
        }else {
            console.table(response)
            startQuestions();
        }
    })
}

function viewAllRoles(){
    const sql = `SELECT role.id, role.title AS role, role.salary AS salary FROM role`;
    db.query(sql, (err, response) =>{
        if (err){
            console.log(err)
        }else {
            console.table(response)
            startQuestions();
        }
    })
}

function viewAllEmployees(){
    const sql = `SELECT employee.first_name AS first_name, employee.last_name AS last_name FROM employee`
    db.query(sql, (err, response) =>{
        if (err){
            console.log(err)
        }else {
            console.table(response)
            startQuestions();
        }
    })
}


startQuestions();

module.exports = db;

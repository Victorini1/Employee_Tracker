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
                'Add a Role',
                'Add an Employee',
                'Update an Employee'
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
        if (choices === 'Add a Department'){
            addDepartment();
        }
        if (choices === 'Add a Role'){
            addRole();
        }
        if (choices === 'Add an Employee'){
            addEmployee();
        }
    })
}

// Functions to view 

// Shows the department names and the department IDs

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

// Should be able to view job title, role id, the department that role belongs to, and the salary for that role

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

// Should be able to view employee's first and last names their employee ID, job titles, departments, salaries, and managers that the employees report to

function viewAllEmployees(){
    const sql = `SELECT employee.id,
                        employee.first_name, 
                        employee.last_name, 
                        role.title AS title, 
                        department.name AS department, 
                        role.salary, 
                        CONCAT (manager.first_name, " ", manager.last_name) AS manager FROM employee 
                        INNER JOIN role ON employee.role_id = role.id 
                        INNER JOIN department ON role.department_id = department.id 
                        LEFT JOIN employee manager ON employee.manager_id = manager.id`;
    db.query(sql, (err, response) =>{
        if (err){
            console.log(err)
        }else {
            console.table(response)
            startQuestions();
        }
    })
}

// ADD functions

function addDepartment(){
    inquirer.prompt ([
        {
            name: 'addDepartment',
            type: 'input',
            message: "What is the name of this department?"
        }
    ])
    // Question Marks can be used as value placeholders
        .then((response) => {
            let add = `INSERT INTO department (name) VALUES(?)`
            db.query(add, response.addDepartment, (err, res) =>{
                if (err){
                    console.log(err)
                }else {
                    console.log(`${response.addDepartment} was created successfully!`)
                    viewAllDepartments();
                }
            })
        })
}

function addRole(){
// Show all departments to a table to allow them to add role to it
let deptArray = [];
const deptList = `SELECT * FROM department`
db.query(deptList, (err, data) =>{
    const department = data.map(({ id, name}) => ({ value: id, name: name}));
    console.log(department)
     inquirer.prompt([
         {
             name: 'departmentName',
             input: 'list',
             message: 'Which department is this role in?',
             choices: department 
         }
     ])
        .then((response) => {
            if (response.departmentName === deptList.name) {
                inquirer.prompt([
                    {
                        name: 'newRoleName',
                        type: 'input',
                        message: 'What is the name of this role?'
                    },
                    {
                        name: 'newSalary',
                        type: 'number',
                        message: 'Please enter the salary of this role'
                    }
                ])
                    .then((response) =>{
                        let newRole = response.newRoleName
                        let deptID;

                        response.forEach((department) =>{
                            if (department.name === deptList.department.name){}
                        })
                    })
            }
            
        })
 })
}
// THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database

function addEmployee(){
    // const role 
    // const manager
    inquirer.prompt([
        {
            name: 'firstName',
            type: 'input',
            message: "What is the employee's first name?",
            validate: firstname => firstname ? true : console.log('Please enter the first name.')
        },
        {
            name: 'lastName',
            type: 'input',
            message: "What is the employee's last name?"
        },
    ])
            .then(response =>{
                const empInfo = [response.firstName, response.lastName]
                const roleGrab = `SELECT role.id, role.title FROM role`
                db.query(roleGrab, (err, data) =>{
                    const roles = data.map(({ id, title}) => ({ name: title, value: id}));
                inquirer.prompt ([
                    {
                        name: 'role',
                        type: 'list',
                        message: "What is the employee's role?",
                        choices: roles
                    }
                ])
                .then(choice => {
                    const role = choice.role;
                    empInfo.push(role);
                    console.log(empInfo)
                    const manQuery = `SELECT * FROM employee`;
                    db.query(manQuery,(err, data) =>{
                        const managers = data.map(({id, first_name, last_name}) =>({ name: first_name + ' ' + last_name, value: id}));
                        inquirer.prompt([
                            {
                                name: 'manager',
                                type: 'list',
                                message: 'Who will the employee report to? (if applicable)',
                                choices: managers 
                            }
                        ])
                        .then (choice => {
                            const manager = choice.manager
                            empInfo.push(manager);
                            const insert = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                            VALUES (?, ?, ?, ?)`;
                            db.query(insert, empInfo, (err, res) => {
                                console.log('Employee added to the database!')
                            })
                        })
                    })

                })
                })
            })
}



startQuestions();

module.exports = db;

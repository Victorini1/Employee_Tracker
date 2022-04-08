const { response } = require('express');
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
                'Update an Employee',
                'EXIT'
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
        if (choices === 'Update an Employee'){
            updateEmployee();
        }
        if (choices === 'EXIT'){
            console.log('Thank you and have a great day!')
            process.exit();
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

async function addRole() {

    const result = await inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "What is the name of the role you would like to add?",
        },
        {
            type: "input",
            name: "salary",
            message: "What is the salary for this role?",
        }
    ]);

    const deptQuery = 'SELECT id, name FROM department'
    const searchResults = await db.promise().query(deptQuery);
    const departments = searchResults[0].map(({ id, name }) => ({value: id, name: name}));

    const askDept = await inquirer.prompt([
        {
            type: 'list',
            name: 'dept',
            message: "Which department does this role belong to?",
            choices: departments
        }
    ])

    const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';

    db.query(query, [result.title, result.salary, askDept.dept], (err, results) => {

        if(err) throw err;

        console.log(`Successfully added new role: ${result.title}.`);
        viewAllRoles();
        
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
                    console.log(roles)
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
                                viewAllEmployees();
                            })
                        })
                    })

                })
                })
            })
}

function updateEmployee(){
    const query = `SELECT employee.id, 
                          employee.first_name, 
                          employee.last_name, 
                          role.id
                          FROM employee, role, department
                          WHERE department.id = role.id
                          AND role.id = employee.role_id`
    db.query(query, (err, res) =>{
        let empNames = [];
        res.forEach((employee) =>{empNames.push(`${employee.first_name} ${employee.last_name}`)});
        let query = `SELECT role.id, role.title FROM role`;
        db.query(query, (err, res) => {
        let roles = [];
        res.forEach((role) => {roles.push(role.title)})
        inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Which employee will be updated?',
                    choices: empNames
                },
                {
                    name: 'role',
                    type: 'list',
                    message: 'What is the new role?',
                    choices: roles
                }
            ])
            .then((answer) => {
                let newTitle; 
                let empID;
                res.forEach((role) => {
                    if (answer.role === role.title){
                        newTitle = role.id;
                    }
                })
                
                res.forEach((employee) => {
                    if (answer.employee === `${employee.first_name} ${employee.last_name}`){
                        empID = employee.id
                    }
                });
                let update = `UPDATE employee SET role_id = ? WHERE id = ?`;
                db.query(update, [newTitle, empID], (err, res)  => {
                    console.log(empID)
                    viewAllEmployees();
                })
            })
        })
    })
}


startQuestions();

module.exports = db;

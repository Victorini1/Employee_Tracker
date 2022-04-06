const inquirer = require('inquirer')
const mysql2 = require('mysql2') 
const db = require('../server')

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
    ]) .then ((answers) => {
        if (answer = 'View All Departments'){
            viewAllDepartments()
        }
    })
}


function viewAllDepartments(){
    const sql = `SELECT department.id, department.name AS department FROM department`;
    db.query(sql, (err, response) =>{
        if (error){
            console.log(error)
        }else {
            console.table(response)
        }
    })
}

module.exports = { startQuestions, viewAllDepartments};
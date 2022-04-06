INSERT INTO department (id, name)
VALUES (1, 'HR'),
       (2, 'Finance'),
       (3, 'Technology'),
       (4, 'Customer Service');
       
INSERT INTO role (id, title, salary, department_id)
VALUES (1, 'Director', 120000.00, 1),
       (2, 'Manager', 98000.00, 1),
       (3, 'Lead', 75000.00, 1),
       (4, 'Individual Contributor', 68000.00, 1);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (1, 'Cloud', 'Strife', 1, 3),
       (2, 'Barrett', 'Wallace', 2, 2),
       (3, 'Tifa', 'Lockhart', 3, NULL),
       (4, 'Aerith', 'Gainsboro', 4, NULL);
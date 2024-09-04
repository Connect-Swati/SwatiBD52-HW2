//npm install express sequelize sqlite3
let express = require("express");
let app = express();
let port = 3000;
// Import the employee model and Sequelize instance from the previously defined paths
let Employee = require("./models/employee.model");
let { sequelize_instance } = require("./lib/index");
app.listen(port, () => {
  console.log("Server is running on port " + port);
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "BD5.2 - HW2" });
});
let employeeData = [
  {
    id: 1,
    name: "Alice",
    salary: 60000,
    department: "Engineering",
    designation: "Software Engineer",
  },
  {
    id: 2,
    name: "Bob",
    salary: 70000,
    department: "Marketing",
    designation: "Marketing Manager",
  },
  {
    id: 3,
    name: "Charlie",
    salary: 80000,
    department: "Engineering",
    designation: "Senior Software Engineer",
  },
];

// end point to see the db
app.get("/seed_db", async (req, res) => {
  try {
    // Synchronize the database, forcing it to recreate the tables if they already exist

    await sequelize_instance.sync({ force: true });
    // Bulk create entries in the book table using predefined data

    // self study
    /*
    capture the result of the bulkCreate method, which returns an array of the created instances
    */

    let insertedEmployee = await Employee.bulkCreate(employeeData);
    // Send a 200 HTTP status code and a success message if the database is seeded successfully
    res.status(200).json({
      message: "Database Seeding successful",
      recordsInserted: insertedEmployee.length,
    }); // Displays the number of Employee inserted
  } catch (error) {
    // Send a 500 HTTP status code and an error message if there's an error during seeding

    console.log("Error in seeding db", error.message);
    return res.status(500).json({
      code: 500,
      message: "Error in seeding db",
      error: error.message,
    });
  }
});

/*
Exercise 1: Fetch all employees

Create an endpoint /employees that’ll return all the employees in the database.

Create a function named fetchAllEmployees to query the database using the sequelize instance.

API Call

http://localhost:3000/employees

Expected Output:

{
  employees: [
    // All the employees in the database
  ],
}
*/
//fucntion to fetch all employees
async function fetchAllEmployees() {
  try {
    //The createdAt and updatedAt fields are automatically added by Sequelize when you define a model.If you don't want these fields to be returned when you fetch data, you can use the attributes option in your Sequelize query
    let allEmployee = await Employee.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (!allEmployee || allEmployee.length == 0) {
      throw new Error("No Employee found");
    }
    return { employees: allEmployee };
  } catch (error) {
    console.log("Error in fetching  all Employee", error.message);
    throw error;
  }
}

//endpoint to fetch all employee
app.get("/employees", async (req, res) => {
  try {
    let allEmployee = await fetchAllEmployees();
    console.log(
      "succesfully fetched " + allEmployee.employees.length + " employees",
    );
    return res.status(200).json(allEmployee);
  } catch (error) {
    if (error.messaage === "No Employee found") {
      return res.status(404).json({
        code: 404,
        message: "No Employee found",
        error: error.message,
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Error in fetching all Employee",
        error: error.message,
      });
    }
  }
});
/*
Exercise 2: Fetch employee details by ID

Create an endpoint /employees/details/:id that’ll return employee details based on the ID.

Declare a variable named id to store the path parameter passed by the user.

Create a function named fetchEmployeeById to query the database using the sequelize instance.

API Call

http://localhost:3000/employees/details/2

Expected Output:

{
  'employee': {
    'id': 2,
    'name': 'Bob',
    'salary': 70000,
    'department': 'Marketing',
    'designation': 'Marketing Manager'
  }
}
*/
//function to fetch employee by id
async function fetchEmployeeById(id) {
  try {
    let employee = await Employee.findOne({
      where: { id: id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    //The createdAt and updatedAt fields are automatically added by Sequelize when you define a model.If you don't want these fields to be returned when you fetch data, you can use the attributes option in your Sequelize query
    if (!employee) {
      throw new Error("No Employee found");
    }
    return { employee: employee };
  } catch (error) {
    console.log("Error in fetching employee by id", error.message);
    throw error;
  }
}
//endpoint to fetch employee by id
app.get("/employees/details/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let employee = await fetchEmployeeById(id);
    console.log("succesfully fetched  employees by id =", id);
    return res.status(200).json(employee);
  } catch (error) {
    if (error.message === "No Employee found") {
      return res.status(404).json({
        code: 404,
        message: "No Employee found",
        error: error.message,
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Error in fetching employee by id",
        error: error.message,
      });
    }
  }
});

/*
Exercise 3: Fetch all employees by department

Create an endpoint /employees/department/:department that’ll return all the employees in a department.

Declare a variable named department to store the path parameter passed by the user.

Create a function named fetchEmployeesByDepartment to query the database using the sequelize instance.

API Call

http://localhost:3000/employees/department/Engineering

Expected Output:

{
  employees: [
    {
      id: 1,
      name: 'Alice',
      salary: 60000,
      department: 'Engineering',
      designation: 'Software Engineer'
    },
    {
      id: 3,
      name: 'Charlie',
      salary: 80000,
      department: 'Engineering',
      designation: 'Senior Software Engineer'
    }
  ],
}
*/
//function to fetch employee by department
async function fetchEmployeesByDepartment(department) {
  try {
    let employees = await Employee.findAll({
      where: { department: department },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (!employees || employees.length == 0) {
      throw new Error("No Employee found");
    }
    return { employees: employees };
  } catch (error) {
    console.log("Error in fetching employee by department", error.message);
    throw error;
  }
}
//endpoint to fetch employee by department
app.get("/employees/department/:department", async (req, res) => {
  let department = req.params.department;
  try {
    let employees = await fetchEmployeesByDepartment(department);
    console.log(
      "succesfully fetched " +
        employees.employees.length +
        " employees by department =",
      department,
    );
    return res.status(200).json(employees);
  } catch (error) {
    if (error.message === "No Employee found") {
      return res.status(404).json({
        code: 404,
        message: "No Employee found",
        error: error.message,
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Error in fetching employee by department",
        error: error.message,
      });
    }
  }
});
/*
Exercise 4: Sort all the employees by their salary

Create an endpoint /employees/sort/salary that’ll return all the employees sorted by their salary.

Declare a variable named order to store the query parameter passed by the user.

order can only hold asc OR desc.

Create a function named sortEmployeesBySalary to query the database using the sequelize instance.

API Call

http://localhost:3000/employees/sort/salary?order=desc 

Expected Output:

{
  employees: [
    {
      id: 3,
      name: 'Charlie',
      salary: 80000,
      department: 'Engineering',
      designation: 'Senior Software Engineer'
    },
    {
      id: 2,
      name: 'Bob',
      salary: 70000,
      department: 'Marketing',
      designation: 'Marketing Manager'
    },
    {
      id: 1,
      name: 'Alice',
      salary: 60000,
      department: 'Engineering',
      designation: 'Software Engineer'
    }
  ],
}
*/
//function to sort employee by salary
async function sortEmployeesBySalary(order) {
  try {
    let employees = await Employee.findAll({
      order: [["salary", order]],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (!employees || employees.length == 0) {
      throw new Error("No Employee found");
    }
    return { employees: employees };
  } catch (error) {
    console.log("Error in sorting employee by salary", error.message);
    throw error;
  }
}
//endpoint to sort employee by salary
app.get("/employees/sort/salary", async (req, res) => {
  let order = req.query.order;
  try {
    let employees = await sortEmployeesBySalary(order);
    console.log(
      "succesfully fetched " +
        employees.employees.length +
        " employees by salary in order =",
      order,
    );
    return res.status(200).json(employees);
  } catch (error) {
    if (error.message === "No Employee found") {
      return res.status(404).json({
        code: 404,
        message: "No Employee found",
        error: error.message,
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Error in sorting employee by salary",
        error: error.message,
      });
    }
  }
});

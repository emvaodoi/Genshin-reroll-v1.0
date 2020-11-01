const inquirer = require("inquirer");
const create_function = require("./function");

const options = () => {
  inquirer
    .prompt([
      {
        name: "choice",
        type: "list",
        message: "Choose your options:",
        choices: ["Create account", "Exit"],
      },
    ])
    .then((answer) => {
      console.log("");
      console.log(
        "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - "
      );
      console.log("");
      console.log("You have selected the function: ", answer.choice);
      if (answer.choice === "Create account") {
        inquirer
          .prompt([
            {
              name: "user_name",
              type: "input",
              message: "What is your username?",
            },
          ])
          .then((answer) => {
            console.log(`Your username is "${answer.user_name}"`);
            create_function(answer.user_name);
          });
      }
    });
};

options();

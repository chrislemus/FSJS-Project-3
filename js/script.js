const form = document.getElementById("js-form");

const jobRoleTextInput = document.getElementById("other-title");
const shirtColorDropdownList = document.getElementById('color');
const shirtColorOptions = document.getElementById("color").querySelectorAll("OPTION");
const paymentField = document.querySelectorAll("#payment-container > DIV");
const creditCardField = document.getElementById("credit-card");
const activitiesTotalDOM = document.querySelector(".total-cost");
const registerForActivitiesContainer = document.querySelector(".activities");
const inputsToValidate = ["user-name", "user-email","user-cc-num", "user-zip", "user-cvv"];
const paymentValidators = ["user-cc-num", "user-zip", "user-cvv"]; 
let scheduledActivitiesList = [];
let costForRegisteredActivities = 0;


//===========================
//  Creating objects
//===========================
const getScheduledActivities = document.querySelectorAll("input[data-day-and-time]"); 

//array of objects will be created.
//each object will contain information about each activity such as price and scheduled date.
getScheduledActivities.forEach(activity => {    
    let activityObject = {};
    activityObject.name = activity.attributes.name.value;
    activityObject.day = activity.dataset.dayAndTime.split(" ")[0];
    activityObject.time = activity.dataset.dayAndTime.split(" ")[1];
    activityObject.cost = activity.attributes[3].value;
    scheduledActivitiesList.push(activityObject);
});

//===========================
//  Initial Declarations
//===========================
const nameInput = document.getElementById("name"); 
nameInput.focus(); //

displayNone(jobRoleTextInput) //remove "other job" text field.
hideDependentOptions(shirtColorOptions); //hide shirt color options
displayNone(shirtColorDropdownList.parentNode) //hide shirt color container

const paymentSelector = document.getElementById("payment");
paymentSelector.value = "credit card";


//===========================
//  EVENT LISTENERS
//===========================

registerForActivitiesContainer.addEventListener("change", e => { 
    let checkboxIsSelected = eval(e.target.tagName == "INPUT");

    if (checkboxIsSelected) { 
        updatedTotalCost(e.target) //this will add activity cost to user total cost for checkout

        let activityIsScheduled = eval(e.target.name != "all")
        if (activityIsScheduled) {  //this will disable other activities that may conflict with recently selected activity
            disableConflictingActivities(e.target)
        }
    }
});

const jobRoleDropdownList = document.getElementById("title");
// displays "other job role input field if "other" is selected"
jobRoleDropdownList.addEventListener("change", e => { 
    if (e.target.value == "other") {
        displayBlock(jobRoleTextInput)
    } else {
        displayNone(jobRoleTextInput)
    }
});


const paymentDropdownList = document.getElementById("payment");

paymentDropdownList.addEventListener("change", e => {
    const optionSelected = e.target.value;
    DisplayCorrespondingOptions(optionSelected, paymentField); // hides/shows credit card text fields depending on user payment method

    // if card is selected as payment
    // we'll add each card payment field input to our list of fields that need validation"inputsToValidate"
    // else we'll remove each card payment field input to our list of fields that need validation"inputsToValidate"
    if (creditCardField.style.display == "block") { 
        paymentValidators.forEach(validator => {
            inputsToValidate.push(validator);
        });
    } else if (creditCardField.style.display == "none" && inputsToValidate.includes(paymentValidators[0])) {
        let validationMessage = creditCardField.querySelectorAll(".validation-message");
        validationMessage.forEach(message => {
            message.remove();
        });

        paymentValidators.forEach(validator => {
            inputsToValidate.pop(validator);
        });
    }


})

const shirtDesignDropdownMenu = document.getElementById("design");
// will display "shirt color" select menu if shirt design is selected
shirtDesignDropdownMenu.addEventListener("change", e => {
     const optionSelected = e.target.value;
     DisplayCorrespondingOptions(optionSelected, shirtColorOptions, shirtColorDropdownList)
     
     if (optionSelected == "no selection" ) {
        displayNone(shirtColorDropdownList.parentNode)
    } else {
        displayBlock(shirtColorDropdownList.parentNode)
    }
});   

// validate text field if once user starts typing.
form.addEventListener("keyup", e => {
    if (e.target.tagName == "INPUT") {
        let fieldName = e.target.name;
        let userInput = e.target.value;
        validateTextField(fieldName, userInput)
    }
});


 //===========================
//  Objects
//===========================

// Instead of creating a function for each text field.
// A dynamic "text validator" function has been created.
// To validate an extra text field just add field name in camel case for property,
// and for value add array the contains regex THEN error message
const textFieldValidators = { 
    userName: [
                "/^[a-z]+$/", //1. input field regex
                "use letters only",//2. input field message
                "make sure field is not empty"
            ],
    userEmail: [
                "/\\w+\\@\\w+\\.\\w+/", //extra backslash added to each "\" to prevent escape
                "email is valid",
                "make sure field is not empty"
            ],
    userCcNum: [
                "/^[0-9]{13}\\d?\\d?\\d?$/", //extra backslash added to each "\" to prevent escape
                "must be valid credit card",
                "make sure field is not empty"
            ],
    userZip: [
                "/^\\d{5}$/", //extra backslash added to each "\" to prevent escape
                "zip code incorrect",
                "make sure field is not empty"
            ],
    userCvv: [
                "/^\\d{3}$/", //extra backslash added to each "\" to prevent escape
                "must be valid CVV",
                "make sure field is not empty"
            ]
}

 //===========================
//  FUNCTIONS
//===========================

// function has been added to html submit button
function validateMyForm() {
    validateActivities() // make sure user has selected at least one(1) activity

    inputsToValidate.forEach(input => { //this will make sure all required inputs are not empty
        let userInput = form.querySelector(`input[name=${input}]`).value
        validateTextField(input, userInput)

    });

    let formNotValid = form.querySelectorAll(".validation-message"); //this will be our indicator that all required inputs are valid

    if (formNotValid.length > 0 ) {
        return false
    } else {
        return true
    }
}

function validateTextField(fieldName, userInput) {
    if (inputsToValidate.includes(fieldName)) { // will run if input require validation
        let validationName = fieldName.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); }) //convert input name to camel case, to call object property name
        let regex = eval(textFieldValidators[validationName][0]).test(userInput); //regex validation
        let inputField = document.querySelector(`input[name=${fieldName}]`); //input field element
        let errorMessageString = textFieldValidators[validationName][1]; //message to display if input is invalid
        let errorMessageString2 = textFieldValidators[validationName][2]; //message to display if input is invalid

        // if statement below will add class to element, that will make border color "red"
        if (regex) {
            inputField.classList.remove("invalid-input");
        } else {
            inputField.classList.add("invalid-input");
        }
        
        let errorMessage = inputField.nextElementSibling; 
        let inputInvalid = eval(inputField.classList.contains("invalid-input")); //make sure input is valid
        let errorMessageDisplayed = eval(errorMessage.classList.contains("validation-message")); //to prevent duplicate error message
    
        if (inputInvalid & !errorMessageDisplayed) {
            inputField.insertAdjacentHTML("afterend", `<p class='validation-message'>${errorMessageString}</p>`);
        } else if (!inputInvalid && errorMessageDisplayed) {
            errorMessage.remove()
        }
        
        if (errorMessageDisplayed) {  // this will display a corresponding error message 
            if ( userInput == "" ) { // empty field message if field is empty
                errorMessage.innerText = errorMessageString2;
            } else {  // invalid regex message
                errorMessage.innerText = errorMessageString;
            }
        }
    }
}

// make sure user has signed up for at least one(1) activity, or error message will display.
function validateActivities() {
    let activitiesHeading = document.querySelector(".activities-heading");
    let errorMessageDisplayed = eval(activitiesHeading.nextElementSibling.classList.contains("validation-message"));
    if (costForRegisteredActivities > 0 && errorMessageDisplayed) {
        registerForActivitiesContainer.querySelector(".validation-message").remove();
    } else if ( costForRegisteredActivities == 0 && !errorMessageDisplayed ) {
        activitiesHeading.insertAdjacentHTML("afterend", "<p class='validation-message'>Please choose at least one(1) activity</p>")
    }
}

// total cost is updated when user clicks on "activities checkbox"
function updatedTotalCost(eventTarget) {
        let notChecked = eventTarget.checked;
        let activityCost = parseInt(eventTarget.dataset.cost);
        // adds or subtracts to grand total depending on what activities user signs up for.
        if (notChecked) {
            costForRegisteredActivities += activityCost;
        } else {
            costForRegisteredActivities -= activityCost;
        }

       // Gand will show if total is greater than $0, otherwise grandtotal will be hidden 
        if (costForRegisteredActivities == 0) {
            displayNone(activitiesTotalDOM)
        } else {
            activitiesTotalDOM.innerHTML = `Total: $${costForRegisteredActivities}`;
            displayBlock(activitiesTotalDOM)
        }
}

// disables other activities that may conflict with user recent selection
function disableConflictingActivities(eventTarget) {
    let notChecked = eventTarget.checked;
    let activityName = eventTarget.attributes.name.value;
    let activityDay = eventTarget.dataset.dayAndTime.split(" ")[0];
    let activityTime = eventTarget.dataset.dayAndTime.split(" ")[1];
            
    scheduledActivitiesList.forEach(activity => {
        let overlappingActivity = eval(activity.name != activityName && activity.day == activityDay && activity.time ==activityTime)
        
        if (overlappingActivity) {
            let checkbox = document.querySelector(`input[name='${activity.name}']`);

            if (notChecked) {
                checkbox.disabled = true;
            } else {
                checkbox.disabled = false;
            }
        }
    });
}

// this will hide input fields that only display when assign category is selected
// eg. if "paypal" payment option is selected => "card number" input will not display
// eg. if "card" payment option is selected => "card number" input will display
// therefore "card number" input is DEPENDENT on "card" payment option being selected.
function hideDependentOptions(dependentDropdownMenu) {
    dependentDropdownMenu.forEach(option => {
        displayNone(option)
    });
}

//adds a display: "none"  css argument
function displayNone(element) {
    element.style.display = "none"
}
//adds a display: "block"  css argument
function displayBlock(element) {
    element.style.display = "block"
}

// if user selects a option that require extra information
// additional input fields will display 
function DisplayCorrespondingOptions(optionSelected, dependentOptions, dependentDropdownList) {
    
    let spacesInString = /\s+/g;
    let className = optionSelected.replace(spacesInString, "-");
    let i = 0;

    dependentOptions.forEach(option => {
        if (option.className == className) {
            displayBlock(option)
            if (i == 0 && dependentDropdownList) {
                dependentDropdownList.value = option.value
                i += 1;
            }
        } else {
            displayNone(option)
        }
    });
}
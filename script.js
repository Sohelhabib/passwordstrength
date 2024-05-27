document.addEventListener("DOMContentLoaded", function () {
    // Select the password input element
    let password = document.getElementById("password");
    // Select the element that displays the password strength
    let power = document.getElementById("power-point");
    // Select the button used to toggle password visibility
    let togglePassword = document.getElementById("toggle-password");
    // Select the button used to suggest a new password
    let suggestPassword = document.getElementById("suggest-password");
    // Select the element that displays the visit count
    let visitCountElement = document.getElementById("visit-count");

    // Function to handle input events on the password field
    password.oninput = function () {
        // Initialize the strength points
        let point = 0;
        // Get the current value of the password input
        let value = password.value;
        // Arrays for width and color corresponding to strength points
        let widthPower = ["1%", "25%", "50%", "75%", "100%"];
        let colorPower = ["#D73F40", "#DC6551", "#F2B84F", "#BDE952", "#3ba62f"];

        // Check if the password length is at least 6 characters
        if (value.length >= 6) {
            // Array of regular expressions to test for different character types
            let arrayTest = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^0-9a-zA-Z]/];
            // Increment points for each matching character type
            arrayTest.forEach((item) => {
                if (item.test(value)) {
                    point += 1;
                }
            });
        }
        // Update the width and color of the strength indicator based on points
        power.style.width = widthPower[point];
        power.style.backgroundColor = colorPower[point];
    };

    // Add click event listener to the toggle password button
    togglePassword.addEventListener("click", function () {
        // Toggle the type attribute of the password input between "password" and "text"
        let type = password.getAttribute("type") === "password" ? "text" : "password";
        password.setAttribute("type", type);
        // Change the button text to indicate the current state (tick for hidden, cross for visible)
        this.textContent = type === "password" ? "\u2713" : "\u2715";  // Unicode characters for tick and cross marks
    });

    // Add click event listener to the suggest password button
    suggestPassword.addEventListener("click", function () {
        // Function to generate a random strong password
        function generatePassword() {
            // Define the character set for the password
            let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";
            // Define the desired password length
            let passwordLength = 12;
            // Initialize the new password as an empty string
            let newPassword = "";
            // Loop to generate a random password of the specified length
            for (let i = 0; i < passwordLength; i++) {
                // Get a random index from the character set
                let randomIndex = Math.floor(Math.random() * chars.length);
                // Append the character at the random index to the new password
                newPassword += chars[randomIndex];
            }
            // Return the generated password
            return newPassword;
        }

        // Generate a new random password
        let newPassword = generatePassword();
        // Set the generated password to the password input field
        password.value = newPassword;
        // Trigger the input event to update the strength indicator
        password.dispatchEvent(new Event('input'));
    });

    // Function to update and display the visit count
    function updateVisitCount() {
        // Check if the visit count is already stored in localStorage
        let visitCount = localStorage.getItem("visitCount");
        // If not, initialize it to 0
        if (!visitCount) {
            visitCount = 0;
        }
        // Increment the visit count
        visitCount = parseInt(visitCount) + 1;
        // Store the updated visit count in localStorage
        localStorage.setItem("visitCount", visitCount);
        // Display the visit count in the visit count element
        visitCountElement.textContent = `Site visits: ${visitCount}`;
    }

    // Call the function to update and display the visit count when the page loads
    updateVisitCount();
});

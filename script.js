document.addEventListener("DOMContentLoaded", function () {
    let password = document.getElementById("password");
    let power = document.getElementById("power-point");
    let togglePassword = document.getElementById("toggle-password");

    password.oninput = function () {
        let point = 0;
        let value = password.value;
        let widthPower = ["1%", "25%", "50%", "75%", "100%"];
        let colorPower = ["#D73F40", "#DC6551", "#F2B84F", "#BDE952", "#3ba62f"];

        if (value.length >= 6) {
            let arrayTest = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^0-9a-zA-Z]/];
            arrayTest.forEach((item) => {
                if (item.test(value)) {
                    point += 1;
                }
            });
        }
        power.style.width = widthPower[point];
        power.style.backgroundColor = colorPower[point];
    };

    togglePassword.addEventListener("click", function () {
        let type = password.getAttribute("type") === "password" ? "text" : "password";
        password.setAttribute("type", type);
        this.textContent = type === "password" ? "\u2713" : "\u2715";  // Toggle between tick and cross mark
    });
});

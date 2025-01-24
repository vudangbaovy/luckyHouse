import React from 'react';

// The Login component is a form with two input fields: one for the username and one for the password. The form also has a submit button.
// Function to interact with the login API in backend app.py
function Login() {
    // Send login details to backend
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        fetch('/login', {
            method: 'POST',
            body: data,
        });
    };
    return (
        <div>
            <h1>Login</h1>
            <form>
                <label>
                    Username:
                    <input type="text" name="username" />
                </label>
                <label>
                    Password:
                    <input type="password" name="password" />
                </label>
                <button type="submit" onClick={handleSubmit}>Log In</button>
            </form>
        </div>
    );
}

export default Login;
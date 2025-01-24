import React from 'react';

// The Login component is a form with two input fields: one for the username and one for the password. The form also has a submit button.
// Function to interact with the login API in backend app.py
function Login() {
    // Send username and password to the backend
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        fetch('http://localhost:8000/api/login', {
            method: 'POST',
            mode: 'no-cors',
            headers: { 
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(data)),
        })
        .then((response) => {
            if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
        });
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input type="text" name="username" />
                </label>
                <label>
                    Password:
                    <input type="password" name="password" />
                </label>
                <button type="submit">Log In</button>
            </form>
        </div>
    );
}

export default Login;
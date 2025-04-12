from flask import Flask, request, render_template, redirect, url_for, session
import sqlite3
import os

app = Flask(__name__)
app.secret_key = "very_secure_random_string"

def init_db():
    if not os.path.exists("users.db"):
        with sqlite3.connect("users.db") as conn:
            conn.execute("""
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    email TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL
                );
            """)

@app.route("/")
def home():
    return render_template("signup.html", message=None)

@app.route("/signup", methods=["POST"])
def signup():
    username = request.form["username"]
    email = request.form["email"]
    password = request.form["password"]

    try:
        with sqlite3.connect("users.db") as conn:
            conn.execute(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                (username, email, password)
            )
        return render_template("signup.html", message="Account created successfully. Please login.")
    except sqlite3.IntegrityError:
        return render_template("signup.html", message="Username or email already exists. Try again.")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html", error=None)

    username = request.form["username"]
    password = request.form["password"]

    with sqlite3.connect("users.db") as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM users WHERE username = ? AND password = ?",
            (username, password)
        )
        user = cur.fetchone()

    if user:
        session["username"] = username
        return redirect(url_for("main"))
    else:
        return render_template("login.html", error="Invalid username or password.")

@app.route("/main")
def main():
    if "username" not in session:
        return redirect(url_for("login"))
    return render_template("main.html", username=session["username"])

@app.route("/logout", methods=["POST"])
def logout():
    session.pop("username", None)
    return redirect(url_for("login"))

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=8080, debug=True)
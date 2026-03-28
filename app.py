from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

def db_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with db_connection() as con:
        con.execute("CREATE TABLE IF NOT EXISTS transactions(id INTEGER PRIMARY KEY, desc TEXT, amount REAL, type TEXT)")
        con.execute("CREATE TABLE IF NOT EXISTS loans(id INTEGER PRIMARY KEY, person TEXT, amount REAL, paid REAL)")
        con.execute("CREATE TABLE IF NOT EXISTS bank(id INTEGER PRIMARY KEY, emi REAL, months INT, start TEXT)")
        con.commit()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/transactions", methods=["GET", "POST"])
def manage_transactions():
    con = db_connection()
    if request.method == "POST":
        d = request.json
        con.execute("INSERT INTO transactions(desc, amount, type) VALUES(?,?,?)", (d["desc"], d["amount"], d["type"]))
        con.commit()
        return {"ok": True}
    
    data = con.execute("SELECT * FROM transactions").fetchall()
    return jsonify([dict(x) for x in data])

@app.route("/loans", methods=["GET", "POST"])
def manage_loans():
    con = db_connection()
    if request.method == "POST":
        d = request.json
        con.execute("INSERT INTO loans(person, amount, paid) VALUES(?,?,0)", (d["person"], d["amount"]))
        con.commit()
        return {"ok": True}
    
    data = con.execute("SELECT * FROM loans").fetchall()
    return jsonify([dict(x) for x in data])

@app.route("/bank", methods=["GET", "POST"])
def manage_bank():
    con = db_connection()
    if request.method == "POST":
        d = request.json
        con.execute("INSERT INTO bank(emi, months, start) VALUES(?,?,?)", (d["emi"], d["months"], d["start"]))
        con.commit()
        return {"ok": True}
    
    data = con.execute("SELECT * FROM bank").fetchall()
    return jsonify([dict(x) for x in data])

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
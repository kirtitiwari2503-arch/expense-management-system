let transactions = [], goal = 0, myChart;

function showSection(id) {
    document.querySelectorAll(".section").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
    document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("active"));
    document.getElementById("nav-" + id).classList.add("active");
}

function toggleTheme() { document.body.classList.toggle("light"); }

async function loadAll() {
    await loadTransactions();
    loadLoans();
    loadBank();
}

async function loadTransactions() {
    const r = await fetch("/transactions");
    transactions = await r.json();
    updateUI();
}

function addTransaction() {
    fetch("/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desc: desc.value, amount: +amount.value, type: type.value })
    }).then(() => {
        loadTransactions();
        desc.value = ""; amount.value = "";
    });
}

function updateUI() {
    let inc = 0, exp = 0;
    list.innerHTML = "";
    transactions.forEach(t => {
        if (t.type === "income") inc += t.amount; else exp += t.amount;
        list.innerHTML += `<li><span>${t.desc}</span> <b>₹${t.amount}</b></li>`;
    });
    income.innerText = inc; expense.innerText = exp;
    const bal = inc - exp;
    balance.innerText = bal;
    updateChart(inc, exp);
    if (goal > 0) updateGoal(bal);
}

function loadLoans() {
    fetch("/loans").then(r => r.json()).then(data => {
        loanList.innerHTML = data.map(l => `<li>${l.person} <span>Owes: ₹${l.amount - l.paid}</span></li>`).join('');
    });
}

function addLoan() {
    fetch("/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person: person.value, amount: +loanAmt.value })
    }).then(() => { loadLoans(); person.value = ""; loanAmt.value = ""; });
}

function addBankLoan() {
    const P = +bAmount.value, r = +bInterest.value / 100 / 12, n = +bMonths.value;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    fetch("/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emi: emi.toFixed(2), months: n, start: bStartDate.value })
    }).then(loadBank);
}

function loadBank() {
    fetch("/bank").then(r => r.json()).then(data => {
        bankLoanList.innerHTML = data.map(l => `<li>EMI: ₹${l.emi} <span>Duration: ${l.months} months</span></li>`).join('');
    });
}

function setGoal() { goal = +goalAmt.value; updateUI(); }

function updateGoal(bal) {
    const percent = Math.min((bal / goal) * 100, 100);
    progressBar.style.width = percent + "%";
    goalStatus.innerText = `₹${bal} / ₹${goal}`;
}

function updateChart(inc, exp) {
    const ctx = document.getElementById('chart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Income', 'Expense'], datasets: [{ data: [inc, exp], backgroundColor: ['#10b981', '#ef4444'] }] },
        options: { plugins: { legend: { labels: { color: getComputedStyle(document.body).getPropertyValue('--text') } } } }
    });
}

loadAll();
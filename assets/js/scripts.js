document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

document.getElementById('calc-withholding').addEventListener('click', () => {
    const selected = document.querySelector('input[name="withholding-type"]:checked');
    const amountEl = document.getElementById('withholding-income');
    const resultDiv = document.getElementById('withholding-tax-result');
    const output = document.getElementById('withholding-tax-output');

    const type = selected ? selected.value : null;
    const amount = parseFloat(amountEl.value);

    if (!type || isNaN(amount) || amount <= 0) {
        output.innerHTML = "⚠️ Please select a tax type and enter a valid amount (> 0).";
        resultDiv.style.display = 'block';
        return;
    }

    let tax = 0;
    let rate = 0;
    if (type === "rent") {
        if (amount > 100000) { rate = 10; tax = amount * 0.10; }
    } else if (type === "bank") {
        rate = 5; tax = amount * 0.05;
    } else if (type === "dividend") {
        if (amount > 100000) { rate = 14; tax = amount * 0.14; }
    }

    if (tax > 0) {
        output.innerHTML = `<div><b>Amount:</b> Rs. ${amount.toFixed(2)}</div>
          <div><b>Applied Rate:</b> ${rate}%</div>
          <div><b>Tax Amount:</b> Rs. ${tax.toFixed(2)}</div>`;
    } else {
        output.innerHTML = `<div class="small-muted">No withholding tax applicable for the selected option and amount.</div>`;
    }
    resultDiv.style.display = 'block';
});

document.getElementById('calc-payable').addEventListener('click', () => {
    const salary = parseFloat(document.getElementById('payable-income').value);
    const result = document.getElementById('payable-tax-result');

    if (isNaN(salary) || salary <= 0) {
        result.innerHTML = "⚠️ Please enter a valid salary (> 0).";
        result.style.display = 'block';
        return;
    }


    const brackets = [
        { limit: 100000, rate: 0 },
        { limit: 141667, rate: 6 },
        { limit: 183333, rate: 12 },
        { limit: 225000, rate: 18 },
        { limit: 266667, rate: 24 },
        { limit: 308333, rate: 30 },
        { limit: Infinity, rate: 36 }
    ];

    let tax = 0;
    let prev = 0;
    const breakdown = [];

    for (let i = 0; i < brackets.length; i++) {
        const lim = brackets[i].limit;
        const rate = brackets[i].rate;
        if (salary > lim) {
            const taxable = lim - prev;
            const t = taxable * (rate / 100);
            if (taxable > 0) breakdown.push({ range: `${(prev + 1).toLocaleString()} - ${lim.toLocaleString()}`, rate, taxable, taxed: t });
            tax += t;
            prev = lim;
        } else {
            const taxable = Math.max(0, salary - prev);
            const t = taxable * (rate / 100);
            if (taxable > 0) breakdown.push({ range: `${(prev + 1).toLocaleString()} - ${salary.toLocaleString()}`, rate, taxable, taxed: t });
            tax += t;
            break;
        }
    }

    const net = salary - tax;
    // Build HTML
    let html = `<div><b>Tax Amount:</b> Rs. ${tax.toFixed(2)}</div>
                  <div><b>Net Salary:</b> Rs. ${net.toFixed(2)}</div>
                  <div class="small-muted"><b>Effective Rate:</b> ${(tax / salary * 100).toFixed(2)}%</div>`;

    html += `<table class="result-table mt-2"><thead><tr><th>Range (Rs.)</th><th>Rate</th><th>Taxable</th><th>Tax</th></tr></thead><tbody>`;
    breakdown.forEach(row => {
        html += `<tr><td>${row.range}</td><td>${row.rate}%</td><td>Rs. ${row.taxable.toFixed(2)}</td><td>Rs. ${row.taxed.toFixed(2)}</td></tr>`;
    });
    html += `</tbody></table>`;

    result.innerHTML = html;
    result.style.display = 'block';
});


document.getElementById('calc-income').addEventListener('click', () => {
    const income = parseFloat(document.getElementById('income').value);
    const resultBox = document.getElementById('income-tax-result');
    const output = document.getElementById('income-tax-output');

    if (isNaN(income) || income <= 0) {
        output.textContent = "⚠️ Please enter a valid annual income (> 0).";
        resultBox.style.display = 'block';
        return;
    }

    const slabs = [
        { limit: 1200000, rate: 0 },
        { limit: 1700000, rate: 6 },
        { limit: 2200000, rate: 12 },
        { limit: 2700000, rate: 18 },
        { limit: 3200000, rate: 24 },
        { limit: 3700000, rate: 30 },
        { limit: Infinity, rate: 36 }
    ];

    let tax = 0, prev = 0;
    const breakdown = [];

    for (let i = 0; i < slabs.length; i++) {
        const lim = slabs[i].limit;
        const rate = slabs[i].rate;
        if (income > lim) {
            const taxable = lim - prev;
            const t = taxable * (rate / 100);
            if (taxable > 0) breakdown.push({ range: `${(prev + 1).toLocaleString()} - ${lim.toLocaleString()}`, rate, taxable, taxed: t });
            tax += t;
            prev = lim;
        } else {
            const taxable = Math.max(0, income - prev);
            const t = taxable * (rate / 100);
            if (taxable > 0) breakdown.push({ range: `${(prev + 1).toLocaleString()} - ${income.toLocaleString()}`, rate, taxable, taxed: t });
            tax += t;
            break;
        }
    }

    const net = income - tax;

    let html = `<div><b>Total Tax:</b> Rs. ${tax.toFixed(2)}</div>
                  <div><b>Net Income:</b> Rs. ${net.toFixed(2)}</div>
                  <div class="small-muted"><b>Effective Rate:</b> ${(tax / income * 100).toFixed(2)}%</div>`;

    html += `<table class="result-table mt-2"><thead><tr><th>Range (Rs.)</th><th>Rate</th><th>Taxable</th><th>Tax</th></tr></thead><tbody>`;
    breakdown.forEach(row => {
        html += `<tr><td>${row.range}</td><td>${row.rate}%</td><td>Rs. ${row.taxable.toFixed(2)}</td><td>Rs. ${row.taxed.toFixed(2)}</td></tr>`;
    });
    html += `</tbody></table>`;

    output.innerHTML = html;
    resultBox.style.display = 'block';
});

document.getElementById('calc-sscl').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('sscl-value').value);
    const result = document.getElementById('sscl-tax-result');
    const output = document.getElementById('sscl-tax-output');

    if (isNaN(val) || val <= 0) {
        output.textContent = "⚠️ Please enter a valid amount (> 0).";
        result.style.display = 'block';
        return;
    }

    const saleTax = val * 0.025;
    const afterSale = val + saleTax;
    const vat = afterSale * 0.15;
    const sscl = saleTax + vat;

    output.innerHTML = `<div><b>Sale Tax (2.5%):</b> Rs. ${saleTax.toFixed(2)}</div>
                          <div><b>After Sale Amount:</b> Rs. ${afterSale.toFixed(2)}</div>
                          <div><b>VAT (15% on after sale):</b> Rs. ${vat.toFixed(2)}</div>
                          <div><b>Total SSCL:</b> Rs. ${sscl.toFixed(2)}</div>`;
    result.style.display = 'block';
});

document.getElementById('calc-leasing').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('loan-amount').value);
    const annualRate = parseFloat(document.getElementById('interest-rate').value);
    const years = parseInt(document.getElementById('leasing-years').value, 10);
    const resultBox = document.getElementById('leasing-result');
    const output = document.getElementById('leasing-output');

    if (isNaN(amount) || amount <= 0 || isNaN(annualRate) || annualRate <= 0) {
        output.innerHTML = "⚠️ Enter valid positive numbers for loan amount and interest rate.";
        resultBox.style.display = 'block';
        return;
    }
    if (!(years >= 1 && years <= 5)) {
        output.innerHTML = "⚠️ Years must be between 1 and 5.";
        resultBox.style.display = 'block';
        return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;


    const pow = Math.pow(1 + monthlyRate, months);
    const emi = (amount * monthlyRate * pow) / (pow - 1);

    const totalPayment = emi * months;
    const totalInterest = totalPayment - amount;

    let html = `<div><b>Loan Amount:</b> Rs. ${amount.toFixed(2)}</div>
                  <div><b>Years:</b> ${years} (${months} months)</div>
                  <div><b>Annual Rate:</b> ${annualRate.toFixed(2)}%</div>
                  <div><b>Monthly EMI:</b> Rs. ${emi.toFixed(2)}</div>
                  <div><b>Total Payment:</b> Rs. ${totalPayment.toFixed(2)}</div>
                  <div><b>Total Interest:</b> Rs. ${totalInterest.toFixed(2)}</div>`;

    output.innerHTML = html;
    resultBox.style.display = 'block';
});


document.getElementById('calc-max-loan').addEventListener('click', () => {
    const emi = parseFloat(document.getElementById('monthly-payment').value);
    const annualRate = parseFloat(document.getElementById('monthly-interest-rate').value);
    const years = parseInt(document.getElementById('monthly-years').value, 10);
    const resultBox = document.getElementById('leasing-result');
    const output = document.getElementById('leasing-output');

    if (isNaN(emi) || emi <= 0 || isNaN(annualRate) || annualRate <= 0) {
        output.innerHTML = "⚠️ Enter valid positive numbers for EMI and interest rate.";
        resultBox.style.display = 'block';
        return;
    }
    if (!(years >= 1 && years <= 5)) {
        output.innerHTML = "⚠️ Years must be between 1 and 5.";
        resultBox.style.display = 'block';
        return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;

    const denom = monthlyRate;
    const pow = Math.pow(1 + monthlyRate, -months);
    const principal = emi * (1 - pow) / denom;

    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    let html = `<div><b>Calculated Max Loan (principal):</b> Rs. ${principal.toFixed(2)}</div>
                  <div><b>Years:</b> ${years} (${months} months)</div>
                  <div><b>Annual Rate:</b> ${annualRate.toFixed(2)}%</div>
                  <div><b>Assumed Monthly EMI:</b> Rs. ${emi.toFixed(2)}</div>
                  <div><b>Total Payment:</b> Rs. ${totalPayment.toFixed(2)}</div>
                  <div><b>Total Interest:</b> Rs. ${totalInterest.toFixed(2)}</div>`;
    output.innerHTML = html;
    resultBox.style.display = 'block';
});

document.getElementById('reset-withholding').addEventListener('click', () => {
    document.getElementById('withholding-tax-result').style.display = 'none';
});
document.getElementById('reset-payable').addEventListener('click', () => {
    document.getElementById('payable-tax-result').style.display = 'none';
});
document.getElementById('reset-income').addEventListener('click', () => {
    document.getElementById('income-tax-result').style.display = 'none';
});
document.getElementById('reset-sscl').addEventListener('click', () => {
    document.getElementById('sscl-tax-result').style.display = 'none';
});
document.getElementById('reset-leasing').addEventListener('click', () => {
    document.getElementById('leasing-result').style.display = 'none';

});
document.getElementById('reset-reverse').addEventListener('click', () => {
    document.getElementById('leasing-result').style.display = 'none';
});


let expenses = [];

function createExpenseHTML(expense) {
    return `
        <div class="mb-8 pb-8 border-b border-gray-200">
            <div class="bg-gray-50 p-4 rounded-lg">
                <h2 class="text-xl font-semibold mb-4">每日開銷</h2>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">日期</label>
                    <input type="date" value="${expense.date}" onchange="updateExpense(${expense.id}, 'date', this.value)" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </div>
                <div class="mb-4">
                    <h3 class="text-lg font-medium mb-2">路線</h3>
                    <div id="routes-${expense.id}">
                        ${expense.routes.map((route, index) => createRouteHTML(expense.id, index, route)).join('')}
                    </div>
                    <button onclick="addRoute(${expense.id})" class="mt-2 flex items-center text-blue-500 hover:text-blue-700">
                        <i data-lucide="plus-circle" class="mr-2"></i> 添加路線
                    </button>
                </div>
                <div class="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">飯店名稱</label>
                        <input type="text" value="${expense.hotelName || ''}" onchange="updateExpense(${expense.id}, 'hotelName', this.value)" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">飯店費用</label>
                        <input type="number" value="${expense.hotelCost}" onchange="updateExpense(${expense.id}, 'hotelCost', this.value)" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                </div>
                <div class="flex items-center">
                    <input type="checkbox" ${expense.hasReceipt ? 'checked' : ''} onchange="updateExpense(${expense.id}, 'hasReceipt', this.checked)" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    <label class="ml-2 block text-sm text-gray-900">是否有收據</label>
                    <input type="number" value="${expense.receiptCount || ''}" onchange="updateExpense(${expense.id}, 'receiptCount', this.value)" class="ml-2 w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" ${expense.hasReceipt ? '' : 'disabled'}>
                    <span class="ml-2 text-sm text-gray-700">張</span>
                </div>
            </div>
            <button onclick="removeExpense(${expense.id})" class="mt-4 flex items-center text-red-500 hover:text-red-700">
                <i data-lucide="trash-2" class="mr-2"></i> 刪除此日
            </button>
        </div>
    `;
}

function createRouteHTML(expenseId, index, route) {
    return `
        <div class="flex items-center space-x-2 mb-2">
            <input type="text" placeholder="起點" value="${route.from}" onchange="updateRoute(${expenseId}, ${index}, 'from', this.value)" class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <input type="text" placeholder="終點" value="${route.to}" onchange="updateRoute(${expenseId}, ${index}, 'to', this.value)" class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <input type="number" placeholder="費用" value="${route.cost}" onchange="updateRoute(${expenseId}, ${index}, 'cost', this.value)" class="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <button onclick="removeRoute(${expenseId}, ${index})" class="text-red-500 hover:text-red-700">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `;
}

function addExpense() {
    const newExpense = {
        id: Date.now(),
        date: '',
        routes: [{ from: '', to: '', cost: 0 }],
        hotelName: '',
        hotelCost: 0,
        hasReceipt: false,
        receiptCount: 0
    };
    expenses.push(newExpense);
    renderExpenses();
    updateSummary();
}

function removeExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    renderExpenses();
    updateSummary();
}

function updateExpense(id, field, value) {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        if (field === 'hotelCost' || field === 'receiptCount') {
            expense[field] = parseFloat(value) || 0;
        } else if (field === 'hasReceipt') {
            expense[field] = value;
            if (!value) {
                expense.receiptCount = 0;
            }
        } else {
            expense[field] = value;
        }
        renderExpenses();
        updateSummary();
    }
}

function addRoute(expenseId) {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
        expense.routes.push({ from: '', to: '', cost: 0 });
        renderExpenses();
    }
}

function removeRoute(expenseId, index) {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense && expense.routes.length > 1) {
        expense.routes.splice(index, 1);
        renderExpenses();
        updateSummary();
    }
}

function updateRoute(expenseId, index, field, value) {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense && expense.routes[index]) {
        expense.routes[index][field] = field === 'cost' ? parseFloat(value) || 0 : value;
        updateSummary();
    }
}

function renderExpenses() {
    const expensesContainer = document.getElementById('expenses');
    expensesContainer.innerHTML = expenses.map(createExpenseHTML).join('');
    lucide.createIcons();
}

function updateSummary() {
    const totalExpense = expenses.reduce((total, expense) => {
        const routeCosts = expense.routes.reduce((sum, route) => sum + (route.cost || 0), 0);
        return total + routeCosts + (expense.hotelCost || 0);
    }, 0);

    const totalTransportation = expenses.reduce((total, expense) => {
        return total + expense.routes.reduce((sum, route) => sum + (route.cost || 0), 0);
    }, 0);

    document.getElementById('totalExpense').textContent = `$${totalExpense.toFixed(2)}`;
    document.getElementById('totalTransportation').textContent = `$${totalTransportation.toFixed(2)}`;

    updateTextSummary();
}

function updateTextSummary() {
    let summary = "差旅開銷摘要：\n\n";

    expenses.forEach((expense, index) => {
        summary += `第 ${index + 1} 天 (${expense.date})：\n`;
        summary += `路線：\n`;
        expense.routes.forEach((route, routeIndex) => {
            summary += `  ${routeIndex + 1}. ${route.from} 到 ${route.to}：$${route.cost}\n`;
        });
        summary += `飯店：${expense.hotelName}，費用：$${expense.hotelCost}\n`;
        summary += `收據：${expense.hasReceipt ? `有 (${expense.receiptCount} 張)` : '無'}\n\n`;
    });

    summary += `總費用：$${document.getElementById('totalExpense').textContent}\n`;
    summary += `總交通費用：$${document.getElementById('totalTransportation').textContent}\n`;

    document.getElementById('textSummaryContent').textContent = summary;
}

function printSummary() {
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `
        <div class="p-8">
            <h1 class="text-3xl font-bold mb-8 text-center">差旅開銷申報摘要</h1>
            <pre>${document.getElementById('textSummaryContent').textContent}</pre>
        </div>
    `;
    window.print();
}

document.getElementById('addExpense').addEventListener('click', addExpense);
document.getElementById('printButton').addEventListener('click', printSummary);

// 初始化
addExpense();
lucide.createIcons();
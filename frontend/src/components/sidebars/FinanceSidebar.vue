<template>
    <aside class="w-64 bg-gray-900 text-white h-screen p-4">
      <h2 class="text-xl font-bold mb-4">Finance Panel</h2>
      <ul class="space-y-2">
        <li><router-link to="/approve-expenses" class="block px-3 py-2 hover:bg-gray-700">Approve Expenses</router-link></li>
        <li><router-link to="/approve-reimbursements" class="block px-3 py-2 hover:bg-gray-700">Approve Reimbursements</router-link></li>
        <li><router-link to="/finance-reports" class="block px-3 py-2 hover:bg-gray-700">View Reports</router-link></li>
      </ul>
    </aside>
  </template>
  
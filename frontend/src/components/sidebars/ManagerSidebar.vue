<template>
    <aside class="w-64 bg-gray-900 text-white h-screen p-4">
      <h2 class="text-xl font-bold mb-4">Manager Panel</h2>
      <ul class="space-y-2">
        <li><router-link to="/approve-equipment" class="block px-3 py-2 hover:bg-gray-700">Approve Equipment Requests</router-link></li>
        <li><router-link to="/view-field-reports" class="block px-3 py-2 hover:bg-gray-700">View Field Reports</router-link></li>
        <li><router-link to="/manage-employees" class="block px-3 py-2 hover:bg-gray-700">Manage Employees</router-link></li>
      </ul>
    </aside>
  </template>
  
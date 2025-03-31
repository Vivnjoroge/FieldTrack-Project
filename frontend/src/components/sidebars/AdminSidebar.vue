<template>
    <aside class="w-64 bg-gray-900 text-white h-screen p-4">
      <h2 class="text-xl font-bold mb-4">Admin Panel</h2>
      <ul class="space-y-2">
        <li><router-link to="/manage-users" class="block px-3 py-2 hover:bg-gray-700">Manage Users</router-link></li>
        <li><router-link to="/system-settings" class="block px-3 py-2 hover:bg-gray-700">System Settings</router-link></li>
        <li><router-link to="/all-reports" class="block px-3 py-2 hover:bg-gray-700">View All Reports</router-link></li>
      </ul>
    </aside>
  </template>
  
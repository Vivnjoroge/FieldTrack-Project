<script setup>
import { ref } from "vue";
import axios from "axios";

const equipment = ref("");
const reason = ref("");
const message = ref("");

// Submit equipment request function
const requestEquipment = async () => {
  if (!equipment.value || !reason.value) {
    message.value = "All fields are required!";
    return;
  }

  try {
    const response = await axios.post("http://localhost:5000/api/resources", {
      equipment: equipment.value,
      reason: reason.value,
    });

    message.value = "Equipment request submitted!";
    equipment.value = "";
    reason.value = "";
  } catch (error) {
    message.value = "Error submitting request. Please try again.";
  }
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">Request Equipment</h2>

    <p v-if="message" class="text-green-500 mb-2">{{ message }}</p>

    <div class="space-y-4">
      <input v-model="equipment" type="text" placeholder="Equipment Name" class="w-full p-2 border rounded" required />
      <textarea v-model="reason" placeholder="Reason for Request" class="w-full p-2 border rounded" required></textarea>

      <button @click="requestEquipment" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Request Equipment
      </button>
    </div>
  </div>
</template>

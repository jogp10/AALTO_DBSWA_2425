<script>
  import { userUuid } from "../stores/stores.js";
</script>

<nav class="p-4 mb-8 bg-white shadow-md">
  <div class="max-w-5xl mx-auto flex items-center justify-between">
    <span class="text-2xl font-serif text-blue-700">Hello, {$userUuid}!</span>
  </div>
</nav>


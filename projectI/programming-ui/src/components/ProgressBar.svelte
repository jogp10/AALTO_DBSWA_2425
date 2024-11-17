<script>
  import { onMount } from "svelte";
  import { userUuid } from "../stores/stores";

  const fetchUserProgress = async () => {
    const response = await fetch("/api/progress/" + $userUuid);
    return (await response.json()).completed * 100;
  };

  const fetchTotalProgress = async () => {
    const response = await fetch("/api/assignment");
    return (await response.json()).length * 100;
  };

  let progressPromise = Promise.all([fetchUserProgress(), fetchTotalProgress()]);

  onMount(() => {});
</script>

<article class="p-6">
  <h2 class="text-xl font-semibold mb-4">
    Progress
    {#await progressPromise}
      <p class="text-gray-600">Loading progress...</p>
    {:then [userProgress, totalProgress]}
      <span class="text-blue-500">{userProgress}/{totalProgress}</span>
    {:catch error}
      <p class="text-red-500">Error loading progress: {error.message}</p>
    {/await}
  </h2>
</article>


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

<article class="p-6" id="progressContainer">
  <h2 class="text-xl font-semibold" id="progressTitle">
    Progress
    {#await progressPromise}
      <p class="text-gray-600" id="loadingProgressMessage">Loading progress...</p>
    {:then [userProgress, totalProgress]}
      <span id="progressBar" class="text-blue-500"><span id="pointsDisplay">{userProgress}</span>/<span id="totalPoints">{totalProgress}</span></span>
    {:catch error}
      <p id="progressErrorMessage" class="text-red-500">Error loading progress: {error.message}</p>
    {/await}
  </h2>
</article>

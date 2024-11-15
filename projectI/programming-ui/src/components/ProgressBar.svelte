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

<article>
  <h2>
    Progress
    {#await progressPromise}
      <p>Loading progress...</p>
    {:then [userProgress, totalProgress]}
      {userProgress}/{totalProgress}
    {/await}
  </h2>
</article>

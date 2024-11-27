<script>
    import { onMount } from "svelte";

    const fetchCourses = async () => {
        const courses = await fetch("/api/courses");
        return await courses.json();
    };

    let coursesPromise = fetchCourses();

    let eventSource;
    const subscribeToUpdates = async () => {
    eventSource = new EventSource("/api/subscribe_updates");
    eventSource.onmessage = (event) => {
      console.log("message", event.data);
    };

    eventSource.onerror = (event) => {
      console.log(event);
    };
  };

  onMount(()=> {
    subscribeToUpdates();

    return () => {
      if (eventSource.readyState === 1) {
        console.log('Closing event source');
        eventSource.close();
      }
    };
	})
</script>
  
{#await coursesPromise}
    <p class="text-gray-500">Loading...</p>
{:then courses}
    <ul class="space-y-4">
        {#each courses as course}
            <li class="p-4 border border-gray-300 rounded-md transition duration-200 ease-in-out hover:bg-gray-100">
                <a href={`/course/${course.id}`} class="text-blue-500 hover:underline">{course.name}</a>
            </li>
        {/each}
    </ul>
{:catch error}
    <p class="text-red-500">{error.message}</p>
{/await}
  
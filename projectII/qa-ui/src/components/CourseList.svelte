<script>
    import { onMount } from "svelte";

    const fetchCourses = async () => {
        const courses = await fetch("/api/courses");
        return await courses.json();
    };

    let coursesPromise = fetchCourses();

    onMount(() => {});
</script>
  
{#await coursesPromise}
    <p>Loading...</p>
{:then courses}
    <ul>
        {#each courses as course}
            <li>
                <a href={`/course/${course.id}`}>{course.name}</a>
            </li>
        {/each}
    </ul>
{:catch error}
    <p style="color: red;">{error.message}</p>
{/await}
  
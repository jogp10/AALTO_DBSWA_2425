<script>  
    export let courseId;

    const fetchCourse = async (courseId) => {
        const course = await fetch(`/api/courses/${courseId}`);
        return await course.json();
    };

    let coursePromise = fetchCourse(courseId);
</script>

{#await coursePromise}
    <p>Loading...</p>
{:then course}
    <h1>{course.name}</h1>
    <p>{course.description}</p>
{:catch error}
    <p style="color: red;">{error.message}</p>
{/await}
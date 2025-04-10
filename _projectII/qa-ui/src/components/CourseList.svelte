<script>
    const fetchCourses = async () => {
        const courses = await fetch("/api/courses");
        return await courses.json();
    };

    let coursesPromise = fetchCourses();
</script>
  
{#await coursesPromise}
    <p id="loading-message" class="loading-message text-gray-500">Loading...</p>
{:then courses}
    <ul id="courses-list" class="courses-list space-y-4">
        {#each courses as course}
            <li 
                id={`course-${course.id}`} 
                class="course-item p-4 border border-gray-300 rounded-md transition duration-200 ease-in-out hover:bg-gray-100"
            >
                <a 
                    href={`/course/${course.id}`} 
                    id={`course-link-${course.id}`} 
                    class="course-link text-blue-500 hover:underline"
                >
                    {course.name}
                </a>
            </li>
        {/each}
    </ul>
{:catch error}
    <p id="error-message" class="error-message text-red-500">{error.message}</p>
{/await}
  
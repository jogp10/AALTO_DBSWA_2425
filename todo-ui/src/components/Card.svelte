<script>
  export let title = "Card";
  export let description = 1;

  const deleteItem = async (description) => {
    dispatch('delete', { value: description });
  };
</script>

<div
  class="bg-blue-100 w-72 h-48 rounded-xl shadow-xl p-6 flex flex-col justify-center items-center hover:shadow-2xl transition-shadow duration-300 ease-in-out"
>
  <h2 class="text-3xl font-semibold text-gray-900 mb-3">{title}</h2>
  <button
    class="text-lg text-gray-600 text-center bg-red-100"
    on:click={() => deleteItem(description)}>Remove id:{description}</button
  >
</div>

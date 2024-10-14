<script>
  import { onMount } from "svelte";

  let messages = [];
  let eventSource;

  onMount(() => {
    // eventSource = new EventSource("/api/json-sse");
    eventSource = new EventSource("http://localhost:7777");

    // do something here
    eventSource.onmessage = (message) => {
      console.log("message", message);
      const parsedMessage = JSON.parse(message.data);
      messages = [...messages, parsedMessage];
    };

    eventSource.onerror = (event) => {
      console.log(event);
    };

    return () => {
      if (eventSource.readyState === 1) {
        console.log("closing connection");
        eventSource.close();
      }
    };
  });

  const closeEventStream = () => {
    console.log("closing connection");
    eventSource.close();
  };
</script>

<h2>Messages</h2>

<!-- do something here -->
<h2>Server-sent messages ({messages.length})</h2>

<button on:click={closeEventStream}>Close connection</button>

<ul>
  {#each messages as message}
    <li>
      {message.user}: {message.message}
    </li>
  {/each}
</ul>

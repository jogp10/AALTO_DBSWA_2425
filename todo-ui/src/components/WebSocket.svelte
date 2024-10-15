<script>
  import { onMount } from "svelte";
  let input = "";

  let events = [];
  let ws;

  onMount(() => {
    const host = window.location.hostname;
    ws = new WebSocket("ws://" + host + ":7777/api/json-ws");

    ws.onmessage = (event) => {
      const parsedMessage = JSON.parse(event.data);
      events = [...events, parsedMessage];
    };

    return () => {
      if (ws.readyState === 1) {
        ws.close();
      }
    };
  });

  const closeConnection = () => {
    ws.close();
  };

  const sendMessage = () => {
    if (input.trim() == "") {
      return;
    }

    ws.send(input.trim());
    input = "";
  };
</script>

<h2>WebSocket messages ({events.length})</h2>

<input bind:value={input} />
<button on:click={sendMessage}>Send message</button>

<button on:click={closeConnection}>Close connection</button>

<ul>
  {#each events as event}
    <li>{event.user}: {event.message}</li>
  {/each}
</ul>

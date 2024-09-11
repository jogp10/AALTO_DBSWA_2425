<script>
	import Invitation from "./Invitation.svelte";
	import InputStatistics from "./InputStatistics.svelte";
	import ItemApp from "./stateManagement/ItemApp.svelte";
	let message = 'Hello world';
	let name = "Dorothy";
</script>

<p>{message}!</p>

<Invitation {name}>
	The time is nigh!
</Invitation>

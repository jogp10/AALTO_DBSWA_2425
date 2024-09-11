<!-- 
<Invitation name="Alice">
    We cordially invite you to the party!
</Invitation>

<p>Dear Alice,</p>
<p>We cordially invite you to the party!</p> -->


<!-- <Invitation name="Bob">
The time is nigh!
</Invitation>

<p>Dear Bob,</p>
<p>The time is nigh!</p> -->

<script>
    export let name;
</script>

<p>Dear {name},</p>
<p><slot /></p>
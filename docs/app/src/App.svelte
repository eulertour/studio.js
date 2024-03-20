<script lang="ts">
import apiJson from './api.json?raw';

const studioApi = JSON.parse(apiJson);
const moduleNames = ["Geometry"];
for (let module of studioApi.modules) {
  console.log(module); 
}
</script>

<main>
  <div class="flex w-full">
    <aside class="basis-10 grow-0 bg-red-400 flex flex-col">
      <div>Get Started</div>
      <div>Installation</div>
      <div>Display</div>
      <div>Points</div>
      <div>Square</div>
      {#each moduleNames as moduleName}
        <div>{moduleName}</div>
      {/each}
    </aside>
    <div class="bg-green-500 grow flex flex-col">
      <div>Points</div>
      <div class="w-12 h-12 bg-black">preview</div>
      <div>Attributes</div>
      <div>name description default</div>
      <div>x number -</div>
    </div>
  </div>
</main>
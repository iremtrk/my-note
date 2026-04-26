 <template>
  <router-view />
</template>

 <script setup lang="ts">
import { useQuasar } from 'quasar';

const $q =useQuasar()
const saved =localStorage.getItem('dark')

if(saved!==null){
  $q.dark.set(saved==='true')
}
</script> 
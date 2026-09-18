<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUsers } from '@/composables/useUsers'
import { useUserStore } from '@/stores/userStore'
import { useAdminStore } from '@/stores/adminStore'
import { useArenas } from '@/composables/useArenas'
import { supabase } from '@/services/supabase'

const { users, loadUsers } = useUsers()
const userStore = useUserStore()
const adminStore = useAdminStore()
const router = useRouter()
const { arenas, loadArenas } = useArenas()

const pendingAdmin = ref(null)
const pendingUser = ref(null)
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const openArenaId = ref('none')


onMounted(() => {
  loadUsers()
  loadArenas()
})

const arenaGroups = computed(() => {
  const userTable = arenas.value.map((arena) => {
    return {
      id: arena.id,
      name: arena.name,
      members: users.value.filter(user => user.arena_id === arena.id)
    }
  })
  const otherTable =
  {
    id: null,
    name: 'Autres',
    members: users.value.filter(user => user.arena_id === null)
  }
  userTable.push(otherTable)
  return userTable
})

function choose(user) {
  if (user.is_admin) {
    pendingAdmin.value = user
    return
  } else {
    pendingUser.value = user
    return
  }
}

async function confirmAdminLogin() {
  errorMessage.value = ''
  const error = await adminStore.login(email.value, password.value)

  if (error) {
    errorMessage.value = 'Identifiants incorrects'
    return
  }

  userStore.selectUser(pendingAdmin.value.id, pendingAdmin.value.arena_id)
  router.push('/')
}

async function confirmUserLogin() {
  errorMessage.value = ''
  const { data, error } = await supabase.rpc('verify_password', {
    p_user_id: pendingUser.value.id,
    p_password: password.value
  })

  if (error) {
    errorMessage.value = 'Erreur lors de la connexion'
    return
  }

  if (!data) {
    errorMessage.value = 'Mot de passe incorrect'
  } else {
    userStore.selectUser(pendingUser.value.id, pendingUser.value.arena_id)
    router.push('/')
  }
}

function cancel() {
  pendingAdmin.value = null
  pendingUser.value = null
  email.value = ''
  password.value = ''
  errorMessage.value = ''
}

function toggleArenaId(arenaId) {
  openArenaId.value = openArenaId.value === arenaId ? 'none' : arenaId
}
</script>

<template>
  <div>
    <h1>Connection</h1>
    <div class="arena-buttons" v-if="!pendingAdmin && !pendingUser">
      <div v-for="group in arenaGroups" :key="group.id">
        <button @click="toggleArenaId(group.id)">{{ group.name }}</button>
        <div v-if="openArenaId === group.id">
          <div class="username-button">
            <div v-for="user in group.members" :key="user.id">
              <button @click="choose(user)">{{ user.username }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <form v-if="pendingUser" @submit.prevent="confirmUserLogin">
    <p>Connexion {{ pendingUser.username }}</p>
    <input v-model="password" type="password" placeholder="Mot de passe">
    <button type="submit">Connexion</button>
    <button type="button" @click="cancel">Annuler</button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </form>

  <form v-if="pendingAdmin" @submit.prevent="confirmAdminLogin">
    <p>Connexion admin pour {{ pendingAdmin.username }}</p>
    <input v-model="email" type="email" placeholder="Email admin">
    <input v-model="password" type="password" placeholder="Mot de passe">
    <button type="submit">Connexion</button>
    <button type="button" @click="cancel">Annuler</button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </form>

</template>

<style scoped>
h1 {
  text-align: center;
}

.arena-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.arena-buttons>div {
  margin-bottom: 16px;
}

.arena-buttons>div>button {
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: bold;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
}

.username-button {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.username-button button {
  padding: 10px 20px;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: none;
  color: var(--color-text);
  cursor: pointer;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
}

form input {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

form button[type="submit"] {
  padding: 8px 16px;
  border-radius: 6px;
  background-color: var(--color-text);
  color: var(--color-background);
  border: none;
  cursor: pointer;
}

form button[type="button"] {
  padding: 8px 16px;
  border-radius: 6px;
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
}

.error-message {
  color: rgb(172, 32, 32);
  font-size: 0.9rem;
}
</style>
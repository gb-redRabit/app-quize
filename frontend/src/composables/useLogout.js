import { inject } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

/** Wspólne wylogowanie dla navbaru i sidebara. */
export function useLogout() {
  const store = useStore();
  const router = useRouter();
  const showAlert = inject('showAlert', null);

  return function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    store.dispatch('user/logout');

    router.push({ name: 'Login' }).then(() => {
      if (showAlert) showAlert('info', 'Zostałeś wylogowany');
      window.location.reload();
    });
  };
}

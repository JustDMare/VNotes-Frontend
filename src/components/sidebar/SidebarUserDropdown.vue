<script lang="ts" setup>
import { useDialogEventStore } from "@/stores/dialog-event";
import { useAuth0 } from "@auth0/auth0-vue";
import { computed } from "vue";
import BaseDropdown from "../base/BaseDropdown.vue";

const auth0 = useAuth0();
const dialogEventStore = useDialogEventStore();

function handleLogout(): void {
  auth0.logout();
}

const authUser = computed(() => auth0.user.value);
</script>

<template>
  <BaseDropdown class="user-dropdown" v-if="authUser" :tooltip="$t('tooltips.userDropdownButton')">
    <template #button-content>
      <img
        v-show="authUser.picture"
        :src="authUser.picture"
        referrerpolicy="no-referrer"
        :alt="$t('altText.userDropdownProfilePicture')"
        class="user-dropdown__profile-picture"
      />
      <span class="user-dropdown__profile-name">{{ authUser.name }}</span>
    </template>
    <template #menu="{ closeOnClick }">
      <button
        class="user-dropdown__option"
        @click="dialogEventStore.openUserSettingsDialog(), closeOnClick()"
      >
        {{ $t("userSettings.userDropdownButton") }}
      </button>
      <button class="user-dropdown__option" @click="handleLogout(), closeOnClick()">
        {{ $t("auth.logout") }}
      </button>
    </template>
  </BaseDropdown>
</template>

<style lang="scss" scoped>
.user-dropdown {
  &__profile-picture {
    width: 28px;
    height: 28px;
    border-radius: 3px;
  }
  &__profile-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-base-20);
  }
  &__option {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 12px 16px;
    border: none;
    font-size: 12px;
    font-weight: 500;
    background-color: var(--color-base-100);
    color: var(--color-base-20);
    cursor: pointer;
    transition: all 0.2s ease-in;
    &:hover {
      background-color: var(--color-base-80);
      color: var(--color-base-10);
    }
  }

  :deep(.base-dropdown__button) {
    height: 3.5rem;
    padding: 8px 16px;
    gap: 12px;
    transition: background-color 0.2s ease-in;
    background-color: var(--color-base-100);
    &:hover {
      background-color: var(--color-base-80);
    }
  }

  :deep(.base-dropdown__menu) {
    width: 100%;
    border-bottom: 1px solid var(--color-base-80);
    box-shadow: 0px 12px 12px 0px rgba(0, 0, 0, 0.2);
  }
}
</style>

<script setup lang="ts">
import NavigationFolder from "./NavigationFolder.vue";
import NavigationNote from "./NavigationNote.vue";
import { useUserSpaceStore } from "@/stores/user-space";
import { toRef } from "vue";

const userSpaceStore = useUserSpaceStore();
const sidebarContent = toRef(userSpaceStore.$state.userSpace, "content");
</script>

<template>
  <nav>
    <ul class="nav" data-test="nav-item-list">
      <NavigationFolder
        v-for="folderReference in sidebarContent.folders"
        :key="folderReference._id"
        :folder-reference="folderReference"
      />
      <NavigationNote
        v-for="noteReference in sidebarContent.notes"
        :key="noteReference._id"
        :note-reference="noteReference"
      />
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
//Variables
.nav {
  --nav-icon-size: 1rem;
}
.nav {
  list-style: none;

  padding: 0.5rem 8px 0 8px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
:deep(.nav) {
  &,
  .nav__folder,
  .nav__folder__content,
  .nav__note {
    display: flex;
    flex-direction: column;
    row-gap: 2px;
  }

  .nav__folder__content {
    list-style: none;
    padding-inline-start: 0;
  }
  .nav__item {
    display: grid;
    grid-template-columns: var(--nav-icon-size) var(--nav-icon-size) 9fr 1fr;
    column-gap: 2px;
    text-decoration: none;
    line-height: 1.3;
    font-size: 0.875rem;
    font-weight: 500;
    color: inherit;
    padding: 1px 0 1px var(--sidebar-item--padding);
    border: 0;
    background-color: transparent;
    text-align: start;
    cursor: pointer;

    &__text,
    &__content-number {
      padding: 0 6px;
      white-space: nowrap;
      font-size: inherit;
    }
    &__text {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &__content-number {
      font-weight: 400;
      opacity: 0.8;
      text-align: end;
    }
  }
  .nav__icon {
    width: var(--nav-icon-size);
    height: var(--nav-icon-size);
    align-self: center;

    &--chevron {
      grid-column: 1;
    }
    &--folder,
    &--note {
      grid-column: 2;
    }
  }
}
</style>

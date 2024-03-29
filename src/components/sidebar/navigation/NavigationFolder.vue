<script setup lang="ts">
import { ChevronRightIcon, FolderIcon } from "@/components/icons";
import type { Folder } from "vnotes-types";
import { ref, type PropType, computed } from "vue";
import NavigationItemOptionsDropdown from "./NavigationItemOptionsDropdown.vue";
import NavigationNote from "./NavigationNote.vue";
import { getFolderOptions } from "@/commands/navigation-item-options/folder";

const props = defineProps({
  folderReference: {
    type: Object as PropType<Folder>,
    required: true,
  },
});
let showContents = ref(false);
let optionsDropdownIsOpen = ref(false);
let showOptionsButton = ref(false);

const folderOptions = computed(() =>
  getFolderOptions(props.folderReference._id, props.folderReference.name)
);

function toggleContentVisibility(): void {
  showContents.value = !showContents.value;
}

function setShowOptionsButton(newShowOptionsButtonValue: boolean) {
  showOptionsButton.value = newShowOptionsButtonValue;
}
</script>

<template>
  <li class="nav__folder" data-test="nav-folder">
    <div
      @mouseover="setShowOptionsButton(true)"
      @mouseleave="setShowOptionsButton(false)"
      @focusin="setShowOptionsButton(true)"
      @focusout="setShowOptionsButton(false)"
      class="sidebar__item"
      :class="{ 'sidebar__item--highlight': optionsDropdownIsOpen }"
      data-test="nav-folder-content"
    >
      <button class="nav__item" @click="toggleContentVisibility">
        <ChevronRightIcon class="nav__icon nav__icon--chevron" :rotate-down="showContents" />
        <FolderIcon class="nav__icon nav__icon--folder" />
        <span class="nav__item__text">{{ folderReference.name }}</span>
        <span class="nav__item__content-number">{{ folderReference.numberOfItems }}</span>
      </button>
      <NavigationItemOptionsDropdown
        :options="folderOptions"
        v-show="showOptionsButton || optionsDropdownIsOpen"
        @options-dropdown-opened="optionsDropdownIsOpen = true"
        @options-dropdown-closed="optionsDropdownIsOpen = false"
      />
    </div>
    <ul class="nav__folder__content" v-show="showContents">
      <NavigationFolder
        v-for="subfolderReference in folderReference.content.folders"
        :key="subfolderReference._id"
        :folder-reference="subfolderReference"
      />
      <NavigationNote
        v-for="noteReference in folderReference.content.notes"
        :key="noteReference._id"
        :note-reference="noteReference"
      />
    </ul>
  </li>
</template>

<style scoped lang="scss">
//Variables
.nav__folder {
  &__content {
    --nav-folder-content--left-margin: calc(
      var(--sidebar-item--padding) + var(--sidebar-item--margin) + var(--nav-icon-size) / 2 - 0.5px
    ); // 0.5px to compensate for the border
    margin-left: var(--nav-folder-content--left-margin);
    border-left: 1px solid var(--color-base-50);
  }
}
</style>

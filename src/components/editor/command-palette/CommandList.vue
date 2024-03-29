<script lang="ts" setup>
import getCommandList from "@/commands/command-palette/command-list";
import type { PaletteCommand } from "@/commands/command-palette/interfaces";
import { useEditorStore } from "@/stores/editor";
import { computed, ref, shallowRef, watch, type ShallowRef } from "vue";
import { matchSorter } from "match-sorter";

const editorStore = useEditorStore();

const emit = defineEmits(["commandListChanged"]);
const props = defineProps({
  showCommandPalette: { type: Boolean, required: true },
});

const commands: ShallowRef<PaletteCommand[]> = shallowRef([...getCommandList()]);
const searchTerm = ref("");
const highlightedCommandIndex = ref(0);

function executeCommand(command: PaletteCommand) {
  command.execute();
  editorStore.restoreBlockContentBeforeOpeningCommandPalette();
  editorStore.setCommandPaletteOpen(false);
}

const filteredCommands = computed(() => {
  if (searchTerm.value === "") {
    return commands.value;
  }
  return matchSorter(commands.value, searchTerm.value, {
    keys: ["name", "tag", "description"],
  });
});

function handleSpecialKeys(event: KeyboardEvent) {
  if (event.code === "Escape" || event.code === "Tab") {
    editorStore.setCommandPaletteOpen(false);
  }
  if (event.code === "Space" && !filteredCommands.value.length) {
    editorStore.setCommandPaletteOpen(false);
  }
  if (event.code === "Enter") {
    event.preventDefault();
    if (filteredCommands.value.length) {
      executeCommand(filteredCommands.value[highlightedCommandIndex.value]);
    }
  }
  if (event.code === "Backspace" && searchTerm.value === "") {
    editorStore.setCommandPaletteOpen(false);
  }
  if (event.code === "ArrowDown" || event.code === "ArrowUp") {
    handleArrowKeys(event);
  }
}
function handleArrowKeys(event: KeyboardEvent) {
  if (event.code === "ArrowDown") {
    event.preventDefault();
    if (filteredCommands.value.length > highlightedCommandIndex.value + 1) {
      highlightedCommandIndex.value++;
    }
  }
  if (event.code === "ArrowUp") {
    event.preventDefault();
    if (highlightedCommandIndex.value > 0) {
      highlightedCommandIndex.value--;
    }
  }
  document.querySelector(".selected")?.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });
}
function handleKeypress(event: KeyboardEvent) {
  const elements = Array.from(document.getElementsByClassName("cmd-palette__command"));
  if (elements.length) {
    elements.forEach((element) => {
      (element as HTMLElement).style.pointerEvents = "none";
    });
  }

  if (event.key.length === 1 && event.key !== "/") {
    searchTerm.value += event.key;
  }
  if (event.code === "Backspace") {
    handleBackspace();
  }
  function handleBackspace() {
    let numberOfCharsToDelete = 1;
    const selection = window.getSelection();
    if (selection && selection.rangeCount !== 0) {
      const range = selection.getRangeAt(0).cloneRange();
      if (range.startOffset !== range.endOffset) {
        numberOfCharsToDelete = range.endOffset - range.startOffset;
      }
    }
    searchTerm.value = searchTerm.value.slice(0, -numberOfCharsToDelete);
  }
}

function handleMouseRegainedControl() {
  const elements = Array.from(document.getElementsByClassName("cmd-palette__command"));
  if (elements.length) {
    elements.forEach((element) => {
      (element as HTMLElement).style.pointerEvents = "auto";
    });
  }
}
function onShowingCommandList() {
  document.addEventListener("keydown", handleSpecialKeys);
  document.addEventListener("keydown", handleKeypress);
  document.addEventListener("mousemove", handleMouseRegainedControl);
  document.addEventListener("mousedown", handleMouseRegainedControl);
}
function onHidingCommandList() {
  document.removeEventListener("keydown", handleSpecialKeys);
  document.removeEventListener("keydown", handleKeypress);
  document.removeEventListener("mousemove", handleMouseRegainedControl);
  document.removeEventListener("mousedown", handleMouseRegainedControl);
  searchTerm.value = "";
  commands.value = [...getCommandList()];
}

watch(
  () => props.showCommandPalette,
  (showCommandPalette) => {
    if (showCommandPalette) {
      onShowingCommandList();
    }
    if (!showCommandPalette) {
      onHidingCommandList();
    }
  }
);
watch(
  () => filteredCommands.value,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      highlightedCommandIndex.value = 0;
      emit("commandListChanged");
    }
  }
);
</script>

<template>
  <div v-if="filteredCommands.length" data-test="cmd-palette-list">
    <div
      v-for="(command, index) in filteredCommands"
      :key="command.name"
      data-test="cmd-palette-command"
    >
      <button
        @click="executeCommand(command)"
        :title="command.description"
        class="cmd-palette__command"
        :class="{ selected: index === highlightedCommandIndex }"
        @mouseover="highlightedCommandIndex = index"
      >
        <component :is="command.icon" />
        <span class="cmd-palette__command__name">{{ command.name }}</span>
      </button>
    </div>
  </div>
  <div v-else>
    <p class="cmd-palette__no-command" data-test="cmd-palette-no-cmd-message">
      {{ $t("commandPalette.noCommands") }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.cmd-palette__command {
  display: flex;
  align-items: center;
  border-radius: 4px;
  width: 100%;
  padding: 0.5rem;
  border: 0;
  background-color: transparent;
  cursor: pointer;
  transition: background 0.25s ease-in-out;
  &.selected,
  &:hover {
    background-color: var(--color-base-80);
  }
  svg {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 0.5rem;
  }
  &__name {
    font-size: 0.875rem;
  }
}
.cmd-palette__no-command {
  font-size: 0.875rem;
  color: var(--color-base-30);
  padding: 4px;
}
</style>

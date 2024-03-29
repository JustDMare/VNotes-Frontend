import { useAuth0 } from "@auth0/auth0-vue";
import { useUserSpaceStore } from "@/stores/user-space";
import type {
  AllPropertyTypesFromInterface,
  Block,
  BlockType,
  BlockUniqueProperties,
  CheckboxBlock,
  PlainTextBlock,
  Note,
} from "vnotes-types";

import { defineStore } from "pinia";
import { findContentEditables } from "@/composables/utils/find-content-editables";
import { focusAndPlaceCaretAtEnd } from "@/utils";

export const useEditorStore = defineStore("editor", {
  state: () => ({
    noteInEditor: null as Note | null,
    blockCreated: false as boolean,
    commandPaletteOpen: false as boolean,
    blockOpeningCommandPalette: null as Block | null,
    blockContentBeforeOpeningCommandPalette: null as string | null,
    isSavingNote: false as boolean,
    auth0: useAuth0(),
  }),

  getters: {
    getBlockInEditorById: (state) => {
      return (_id: string) => state.noteInEditor?.content.find((block: Block) => block._id === _id);
    },
  },
  actions: {
    async fetchNote(noteId: string) {
      const accessToken = await this.auth0.getAccessTokenSilently();
      fetch(`http://localhost:3030/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((data) => data.json())
        .then((json) => {
          this.setNoteInEditor(json.note);
        })
        .catch((error) => {
          this.router.push({ name: "workspace" });
          console.log(error);
        });
    },
    async saveNoteChanges() {
      if (!this.noteInEditor) {
        return;
      }
      const accessToken = await this.auth0.getAccessTokenSilently();
      this.isSavingNote = true;
      fetch("http://localhost:3030/notes/update-content", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        method: "POST",
        body: JSON.stringify({
          _id: this.noteInEditor._id,
          title: this.noteInEditor.title,
          content: this.noteInEditor.content,
        }),
      })
        .then((data) => data.json())
        .then((json) => {
          const userSpaceStore = useUserSpaceStore();
          userSpaceStore.fetchAllUserSpaceContent();
          this.setNoteInEditor(json.note);
        })
        .catch((error) => console.log(error));
      setTimeout(() => {
        // It's so fast that I need this timeout so I can showcase my spinning donut :D
        this.isSavingNote = false;
      }, 500);
    },

    updateNoteTitle(content: string): void {
      if (this.noteInEditor) {
        this.noteInEditor.title = content;
      }
    },
    setBlockContentBeforeOpeningCommandPalette(content: string): void {
      this.blockContentBeforeOpeningCommandPalette = content;
    },
    restoreBlockContentBeforeOpeningCommandPalette(): void {
      if (this.blockOpeningCommandPalette) {
        this.updateBlockContent(
          this.blockOpeningCommandPalette._id,
          this.blockContentBeforeOpeningCommandPalette as string
        );
      }
      this.blockContentBeforeOpeningCommandPalette = null;
    },

    updateBlockContent(_id: string, content: string): void {
      const block = this.getBlockInEditorById(_id);
      if (block) {
        block.content = content;
      }
    },
    updateBlockUniqueProperty(
      _id: string,
      uniqueProperty: keyof BlockUniqueProperties,
      uniquePropertyValue: AllPropertyTypesFromInterface<BlockUniqueProperties>
    ): void {
      const block = this.getBlockInEditorById(_id);
      if (block) {
        block.uniqueProperties[uniqueProperty] = uniquePropertyValue;
      }
    },
    convertBlockType(id: string, blockType: BlockType): void {
      const block = this.getBlockInEditorById(id);
      if (!block) {
        return;
      }
      if (block.type === blockType) {
        return;
      }
      /*
      used to break when converting to a block type that had unique properties because of
      the lack of `block.uniqueProperties === undefined` check*/
      if (
        blockType === "checkbox" &&
        (!block.uniqueProperties || block.uniqueProperties.selected === undefined)
      ) {
        block.uniqueProperties = { selected: false };
      }
      block.type = blockType;
    },

    createBlockBelowTitle() {
      const newBlock = getNewBlockTemplate();
      this.addBlockToNote(0, newBlock);
    },

    createBlockBelowBlockId(previousBlockId: string): void {
      if (this.noteInEditor) {
        const previousBlockIndex = this.noteInEditor.content.findIndex(
          (block: Block) => block._id === previousBlockId
        );
        const newBlockIndex = previousBlockIndex + 1;
        const previousBlockType = this.getBlockInEditorById(previousBlockId)?.type;

        const newBlock = getNewBlockTemplate(previousBlockType);
        this.addBlockToNote(newBlockIndex, newBlock);
      }
    },
    addBlockToNote(blockIndex: number, block: Block) {
      if (this.noteInEditor) {
        this.setBlockCreated(true);
        this.noteInEditor.content.splice(blockIndex, 0, block);
      }
    },
    setBlockCreated(blockCreated: boolean): void {
      this.blockCreated = blockCreated;
    },
    setCommandPaletteOpen(commandPaletteOpen: boolean): void {
      this.commandPaletteOpen = commandPaletteOpen;
    },
    setBlockOpeningCommandPalette(block: Block): void {
      this.blockOpeningCommandPalette = block;
    },
    deleteBlockByIdAndFocusPrevious(blockId: string): void {
      if (!this.noteInEditor) {
        return;
      }
      const blockIndex = this.noteInEditor.content.findIndex(
        (block: Block) => block._id === blockId
      );
      const elements = findContentEditables();
      if (blockIndex < 0) {
        return;
      }
      const elementToFocus = elements[blockIndex];
      focusAndPlaceCaretAtEnd(elementToFocus);
      this.noteInEditor.content.splice(blockIndex, 1);
    },
    updateNoteContent(content: Block[]): void {
      if (this.noteInEditor) {
        this.noteInEditor.content = content;
      }
    },
    moveBlockInNote(from: number, to: number) {
      if (!this.noteInEditor) {
        return;
      }
      const item = this.noteInEditor.content.splice(from, 1)[0];
      this.noteInEditor.content.splice(to, 0, item);
    },
    setNoteInEditor(note: Note): void {
      if (!this.noteInEditor) {
        this.noteInEditor = note;
      } else {
        this.noteInEditor._id = note._id;
        this.noteInEditor.parentId = note.parentId;
        this.noteInEditor.content = note.content;
        this.noteInEditor.title = note.title;
        this.noteInEditor.createdTime = note.createdTime;
        this.noteInEditor.lastUpdatedTime = note.lastUpdatedTime;
      }
    },
    removeNoteFromEditor(): void {
      this.noteInEditor = null;
    },
    setNoteInEditorParentId(parentId: string | null): void {
      if (this.noteInEditor) {
        this.noteInEditor.parentId = parentId ?? undefined;
      }
    },
  },
});
function newBlockTemplate(): Block {
  return {
    type: "text",
    _id: crypto.randomUUID(),
    content: "",
    uniqueProperties: {},
  };
}
function getNewBlockTemplate(type?: BlockType): Block {
  const newBlock: Block = newBlockTemplate();
  if (type === "checkbox") {
    newBlock.type = "checkbox";
    newBlock.uniqueProperties.selected = false;
    return <CheckboxBlock>newBlock;
  }
  return <PlainTextBlock>newBlock;
}

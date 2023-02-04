import { useEventStore } from "@/stores/event";
import { TrashIcon } from "@/components/icons";
import type { NavigationItemOption } from "./interfaces";
import { i18n } from "@/i18n/i18n.plugin";
import RenameIcon from "@/components/icons/RenameIcon.vue";

export function getNoteOptions(noteId: string): NavigationItemOption[] {
  const eventStore = useEventStore();
  const t = i18n.global.t;
  return [
    {
      name: t("navigationItemOptions.rename"),
      icon: RenameIcon,
      action: () => {
        eventStore.openRenameItemDialog("rename-note", noteId);
      },
    },
    {
      name: t("navigationItemOptions.delete"),
      icon: TrashIcon,
      action: () => {
        console.log("Delete");
      },
    },
  ];
}

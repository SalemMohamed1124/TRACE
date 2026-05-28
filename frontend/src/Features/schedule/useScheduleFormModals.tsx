"use client";

import { useViewModal } from "@/Contexts/ViewModalContext";
import ScheduleForm from "./ScheduleForm";
import { Button } from "@/components/ui/button";
import { CalendarClock, Plus } from "lucide-react";
import type { ScanSchedule } from "@/types";

export function useScheduleFormModals() {
  const { view } = useViewModal();

  const openCreate = () => {
    view({
      title: "New Automated Schedule",
      content: <ScheduleForm onSuccess={() => {}} />,
      noPadding: true,
      defaultScroll: false,
    });
  };

  const openEdit = (schedule: ScanSchedule) => {
    view({
      title: "Modify Schedule",
      content: <ScheduleForm schedule={schedule} onSuccess={() => {}} />,
      noPadding: true,
      defaultScroll: false,
    });
  };

  return { openCreate, openEdit };
}

export function ScheduleTableActions() {
  const { openCreate } = useScheduleFormModals();

  return (
    <Button
      onClick={openCreate}
      className="bg-primary hover:bg-primary/90 text-white h-9 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 gap-2 px-6"
    >
      <Plus className="size-3.5" />
      Deploy Schedule
    </Button>
  );
}


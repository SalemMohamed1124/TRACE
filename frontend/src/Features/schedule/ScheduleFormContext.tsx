"use client";

import { createContext, useContext, ReactNode } from "react";
import { useForm, UseFormReturn, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ScheduleFormSchema,
  type ScheduleFormValues,
} from "./ScheduleFormSchema";
import { useAssetsForSchedules } from "./useSchedules";
import { useCreateSchedule, useUpdateSchedule } from "./useScheduleMutations";
import { useViewModal } from "@/Contexts/ViewModalContext";
import type { ScanSchedule, Asset } from "@/types";

function getScheduleTime(schedule: ScanSchedule | null) {
  if (schedule?.timeOfDay) return schedule.timeOfDay;
  if (!schedule?.nextRunAt) return "02:00";

  return new Date(schedule.nextRunAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

interface ScheduleFormContextProps extends UseFormReturn<ScheduleFormValues> {
  onSubmit: (values: ScheduleFormValues) => void;
  isLoading: boolean;
  editMode: boolean;
  assets: Asset[];
  close: () => void;
}

const ScheduleFormContext = createContext<ScheduleFormContextProps | null>(
  null,
);

export function ScheduleFormProvider({
  schedule,
  onSuccess,
  children,
}: {
  schedule: ScanSchedule | null;
  onSuccess?: () => void;
  children: ReactNode;
}) {
  const { close } = useViewModal();
  const { items } = useAssetsForSchedules();
  const { mutateAsync: addScheduleApi, isPending: isAdding } =
    useCreateSchedule();
  const { mutateAsync: updateScheduleApi, isPending: isUpdating } =
    useUpdateSchedule(schedule?.id);
  const editMode = !!schedule;

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(ScheduleFormSchema),
    defaultValues: {
      assetId: schedule?.assetId || "",
      frequency: schedule?.frequency || "WEEKLY",
      scanType: schedule?.scanType || "QUICK",
      scheduledTime: getScheduleTime(schedule),
      isActive: schedule?.isActive ?? true,
    },
  });

  const onSubmit = async (values: ScheduleFormValues) => {
    try {
      const payload = {
        assetId: values.assetId,
        scanType: values.scanType,
        frequency: values.frequency,
        scheduledTime: values.scheduledTime,
      };

      if (editMode && schedule) {
        await updateScheduleApi({
          id: schedule.id,
          data: { ...payload, isActive: values.isActive },
        });
      } else {
        await addScheduleApi(payload);
      }
      onSuccess?.();
      close();
    } catch (error) {}
  };

  const value: ScheduleFormContextProps = {
    ...form,
    onSubmit,
    isLoading: isAdding || isUpdating,
    editMode,
    assets: items,
    close,
  };

  return (
    <ScheduleFormContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </ScheduleFormContext.Provider>
  );
}

export function useScheduleForm() {
  const context = useContext(ScheduleFormContext);
  if (!context) {
    throw new Error(
      "useScheduleForm must be used within a ScheduleFormProvider",
    );
  }
  return context;
}

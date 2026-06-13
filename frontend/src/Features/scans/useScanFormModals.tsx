"use client";

import { useViewModal } from "@/Contexts/ViewModalContext";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import ScanForm from "./ScanForm";

export function useScanFormModals() {
  const { view } = useViewModal();

  const openCreate = (initialAssetId?: string) => {
    view({
      title: "Initiate Security Scan",
      content: <ScanForm initialAssetId={initialAssetId} />,
      noPadding: true,
      defaultScroll: false,
    });
  };

  return {
    openCreate,
  };
}

export function ScanTableActions() {
  const { openCreate } = useScanFormModals();

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <Button
        variant="primary"
        onClick={() => openCreate()}
        className="h-9 gap-2 w-full sm:w-auto order-1 sm:order-2"
      >
        <Play className="size-3.5 " />
        Start New Scan
      </Button>
    </div>
  );
}

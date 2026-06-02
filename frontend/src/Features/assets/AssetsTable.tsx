"use client";

import { useAssets } from "./useAssets";
import { AssetColumns } from "./AssetColumns";
import { DataTable } from "@/components/dataTable/DataTable";
import { useAssetFormModals } from "./useAssetFormModals";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

export default function AssetsTable() {
  const { items, isPending } = useAssets();

  return (
    <DataTable
      tableName="AssetsTable"
      columns={AssetColumns}
      data={items}
      isPending={isPending}
      extraActions={<AssetTableActions />}
    />
  );
}

export function AssetTableActions() {
  const { openCreate, openBulkCreate } = useAssetFormModals();

  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      <Button
        variant="primary"
        onClick={openCreate}
        className="h-9 gap-2 order-2 "
      >
        <Plus className="size-4" />
        Add Asset
      </Button>
      <Button
        variant="outline"
        onClick={openBulkCreate}
        className="h-9 gap-2   sm:order-1"
      >
        <Upload className="size-4" />
        Bulk
      </Button>
    </div>
  );
}

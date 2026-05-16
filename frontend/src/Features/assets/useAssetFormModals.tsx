"use client";

import { useViewModal } from "@/Contexts/ViewModalContext";
import type { Asset } from "@/types";
import AssetForm from "./AssetForm";
import BulkAssetForm from "./BulkAssetForm";

export function useAssetFormModals() {
  const { view } = useViewModal();

  const openCreate = () => {
    view({
      title: "Register New Asset",
      content: <AssetForm />,
      noPadding: true,
      defaultScroll: false,
    });
  };

  const openBulkCreate = () => {
    view({
      title: "Bulk Register Assets",
      content: <BulkAssetForm />,
      noPadding: true,
      defaultScroll: false,
    });
  };

  const openEdit = (asset: Asset) => {
    view({
      title: `Edit Asset: ${asset.name}`,
      content: <AssetForm asset={asset} />,
      noPadding: true,
      defaultScroll: false,
    });
  };

  return {
    openCreate,
    openBulkCreate,
    openEdit,
  };
}


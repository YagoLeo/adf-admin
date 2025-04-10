"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import type { LogisticsItem } from "@/types/logistics"
import { useLanguage } from "@/components/language-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Trash2, Pencil, Edit, FilePlus } from 'lucide-react';
import { deleteLogisticsItems } from '@/lib/firebase-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EditLogisticsItemDialog } from '@/components/edit-logistics-item-dialog';
import { BatchEditDialog } from '@/components/batch-edit-dialog';
import { BatchGenerateDialog } from '@/components/batch-generate-dialog';

interface LogisticsTableProps {
  data: LogisticsItem[];
  onSelectionChange: (selectedItems: LogisticsItem[]) => void;
  onAddClick: () => void;
  onDataChange: () => void;
}

export function LogisticsTable({
  data,
  onSelectionChange,
  onAddClick,
  onDataChange,
}: LogisticsTableProps) {
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<LogisticsItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBatchEditDialogOpen, setIsBatchEditDialogOpen] = useState(false);
  const [isBatchGenerateDialogOpen, setIsBatchGenerateDialogOpen] =
    useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedIds(new Set());
      onSelectionChange([]);
    } else {
      // Select all filtered items
      const filteredItems = filterData(data);
      const allIds = new Set(filteredItems.map((item) => item.id));
      setSelectedIds(allIds);
      onSelectionChange(filteredItems);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: string) => {
    const newSelectedIds = new Set(selectedIds);

    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }

    setSelectedIds(newSelectedIds);

    // Update parent component with selected items
    const selectedItems = data.filter((item) => newSelectedIds.has(item.id));
    onSelectionChange(selectedItems);

    // Update selectAll state based on filtered items
    const filteredItems = filterData(data);
    setSelectAll(
      newSelectedIds.size === filteredItems.length && filteredItems.length > 0
    );
  };

  const filterData = (data: LogisticsItem[]) => {
    if (!searchTerm) return data;

    return data.filter(
      (item) =>
        item.houseBillNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.consigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.containerNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    setIsDeleting(true);
    setError(null);

    try {
      const idsToDelete = Array.from(selectedIds);
      await deleteLogisticsItems(idsToDelete);

      // 清除选择
      setSelectedIds(new Set());
      setSelectAll(false);
      onSelectionChange([]);

      // 显示成功消息
      setSuccess(t('selectedItemsDeleted'));

      // 通知父组件数据已更改
      onDataChange();

      // 3秒后隐藏成功消息
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting items:', error);
      setError(t('errorDeletingItems'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditItem = (item: LogisticsItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleItemUpdated = () => {
    setSuccess(t('itemUpdated'));
    onDataChange();
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  const handleBatchEdit = () => {
    if (selectedIds.size === 0) return;
    setIsBatchEditDialogOpen(true);
  };

  const handleBatchItemsUpdated = () => {
    setSuccess(t('itemsUpdated'));
    onDataChange();
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  const handleBatchGenerate = () => {
    setIsBatchGenerateDialogOpen(true);
  };

  const handleBatchItemsAdded = () => {
    setSuccess(t('itemsAdded'));
    onDataChange();
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  const filteredData = filterData(data);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">成功</AlertTitle>
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('searchByBillNumberOrConsignee')}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchEdit}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                {t('batchEdit')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? t('deleting') : t('deleteSelected')}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchGenerate}
            className="flex items-center gap-1"
          >
            <FilePlus className="h-4 w-4" />
            {t('batchGenerate')}
          </Button>

          <Button
            size="sm"
            onClick={onAddClick}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            {t('addNew')}
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    aria-label={t('selectAll')}
                  />
                </TableHead>
                <TableHead>{t('houseBillNumber')}</TableHead>
                <TableHead>{t('houseBillReference')}</TableHead>
                <TableHead>{t('consigneeName')}</TableHead>
                <TableHead>{t('consigneeCity')}</TableHead>
                <TableHead>{t('consigneeCountryCode')}</TableHead>
                <TableHead>{t('goodsDescription')}</TableHead>
                <TableHead>{t('weightInKG')}</TableHead>
                <TableHead>{t('pieces')}</TableHead>
                <TableHead>{t('containerNumber')}</TableHead>
                <TableHead className="w-[50px]">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => handleSelectItem(item.id)}
                      aria-label={`${t('select')} ${item.houseBillNumber}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.houseBillNumber}
                  </TableCell>
                  <TableCell>{item.houseBillReference}</TableCell>
                  <TableCell>{item.consigneeName}</TableCell>
                  <TableCell>{item.consigneeCity}</TableCell>
                  <TableCell>{item.consigneeCountryCode}</TableCell>
                  <TableCell>{item.goodsDescription}</TableCell>
                  <TableCell>{item.weightInKG}</TableCell>
                  <TableCell>{item.pieces}</TableCell>
                  <TableCell>{item.containerNumber}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditItem(item)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    {data.length === 0 ? t('noData') : t('noMatchingRecords')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditLogisticsItemDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        item={editingItem}
        onItemUpdated={handleItemUpdated}
      />

      <BatchEditDialog
        open={isBatchEditDialogOpen}
        onOpenChange={setIsBatchEditDialogOpen}
        selectedItems={data.filter((item) => selectedIds.has(item.id))}
        onItemsUpdated={handleBatchItemsUpdated}
      />

      <BatchGenerateDialog
        open={isBatchGenerateDialogOpen}
        onOpenChange={setIsBatchGenerateDialogOpen}
        onItemsAdded={handleBatchItemsAdded}
      />
    </div>
  );
}


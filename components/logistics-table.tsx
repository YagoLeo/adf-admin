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
  isAdmin: boolean;
}

export function LogisticsTable({
  data,
  onSelectionChange,
  onAddClick,
  onDataChange,
  isAdmin,
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
        item.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.status && item.status.toLowerCase().includes(searchTerm.toLowerCase()))
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

  // 获取状态标签样式
  const getStatusBadgeClass = (status: string | undefined) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 获取状态显示文本
  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'in_transit':
        return '运输中';
      case 'delivered':
        return '已送达';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

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
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchEdit}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  {t('batchEdit')}
                </Button>
              )}
              {isAdmin && (
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
              )}
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

          {isAdmin && (
            <Button
              size="sm"
              onClick={onAddClick}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              {t('addNew')}
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>{t('houseBillNumber')}</TableHead>
                <TableHead>{t('consigneeName')}</TableHead>
                <TableHead>{t('containerNumber')}</TableHead>
                <TableHead>状态</TableHead>
                {isAdmin && <TableHead className="w-24">{t('actions')}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 6 : 5}
                    className="h-24 text-center"
                  >
                    {t('noRecordsFound')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => handleSelectItem(item.id)}
                        aria-label={`Select ${item.houseBillNumber}`}
                      />
                    </TableCell>
                    <TableCell>{item.houseBillNumber}</TableCell>
                    <TableCell>{item.consigneeName}</TableCell>
                    <TableCell>{item.containerNumber}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadgeClass(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {isAdmin && editingItem && (
        <EditLogisticsItemDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          item={editingItem}
          onItemUpdated={handleItemUpdated}
        />
      )}

      {isAdmin && (
        <BatchEditDialog
          open={isBatchEditDialogOpen}
          onOpenChange={setIsBatchEditDialogOpen}
          selectedIds={Array.from(selectedIds)}
          onItemsUpdated={handleBatchItemsUpdated}
        />
      )}

      {isAdmin && (
        <BatchGenerateDialog
          open={isBatchGenerateDialogOpen}
          onOpenChange={setIsBatchGenerateDialogOpen}
          onItemsAdded={handleBatchItemsAdded}
        />
      )}
    </div>
  );
}


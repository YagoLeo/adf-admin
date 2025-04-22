'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/components/language-provider';
import { updateLogisticsItem, getLogisticsItem } from '@/lib/logistics-service';
import type { LogisticsItem } from '@/types/logistics';

interface BatchEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onItemsUpdated: () => void;
}

export function BatchEditDialog({
  open,
  onOpenChange,
  selectedIds,
  onItemsUpdated,
}: BatchEditDialogProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<LogisticsItem>>({});
  const [selectedItems, setSelectedItems] = useState<LogisticsItem[]>([]);

  // 加载选中的项目
  useEffect(() => {
    const loadSelectedItems = async () => {
      const items = await Promise.all(
        selectedIds.map((id) => getLogisticsItem(id))
      );
      setSelectedItems(items.filter((item): item is LogisticsItem => item !== null));
    };

    if (open) {
      loadSelectedItems();
    }
  }, [open, selectedIds]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;

    setIsSubmitting(true);

    try {
      // 批量更新所有选中的项目
      await Promise.all(
        selectedItems.map((item) =>
          updateLogisticsItem(item.id, {
            ...formData,
            // 保持物流订单编号不变
            houseBillNumber: item.houseBillNumber,
            // 转换数值类型
            weightInKG: formData.weightInKG
              ? Number(formData.weightInKG)
              : undefined,
            pieces: formData.pieces ? Number(formData.pieces) : undefined,
          })
        )
      );

      // 通知父组件
      onItemsUpdated();

      // 关闭对话框
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating logistics items:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('batchEdit')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="consigneeName">{t('consigneeName')}</Label>
              <Input
                id="consigneeName"
                name="consigneeName"
                value={formData.consigneeName || ''}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consigneeCity">{t('consigneeCity')}</Label>
              <Input
                id="consigneeCity"
                name="consigneeCity"
                value={formData.consigneeCity || ''}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consigneeCountryCode">
                {t('consigneeCountryCode')}
              </Label>
              <Input
                id="consigneeCountryCode"
                name="consigneeCountryCode"
                value={formData.consigneeCountryCode || ''}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goodsDescription">{t('goodsDescription')}</Label>
              <Input
                id="goodsDescription"
                name="goodsDescription"
                value={formData.goodsDescription || ''}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weightInKG">{t('weightInKG')}</Label>
                <Input
                  id="weightInKG"
                  name="weightInKG"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weightInKG || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pieces">{t('pieces')}</Label>
                <Input
                  id="pieces"
                  name="pieces"
                  type="number"
                  min="0"
                  value={formData.pieces || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="containerNumber">{t('containerNumber')}</Label>
              <Input
                id="containerNumber"
                name="containerNumber"
                value={formData.containerNumber || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { updateLogisticsItem } from '@/lib/logistics-service';
import type { LogisticsItem } from '@/types/logistics';

interface EditLogisticsItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: LogisticsItem | null;
  onItemUpdated: () => void;
}

export function EditLogisticsItemDialog({
  open,
  onOpenChange,
  item,
  onItemUpdated,
}: EditLogisticsItemDialogProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<LogisticsItem>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        houseBillNumber: item.houseBillNumber,
        houseBillReference: item.houseBillReference,
        consigneeName: item.consigneeName,
        consigneeCity: item.consigneeCity,
        consigneeCountryCode: item.consigneeCountryCode,
        goodsDescription: item.goodsDescription,
        weightInKG: item.weightInKG,
        pieces: item.pieces,
        containerNumber: item.containerNumber,
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsSubmitting(true);

    try {
      // 更新数据库
      await updateLogisticsItem(item.id, {
        ...formData,
        weightInKG: Number.parseFloat(formData.weightInKG as string) || 0,
        pieces: Number.parseInt(formData.pieces as string) || 0,
      });

      // 通知父组件
      onItemUpdated();

      // 关闭对话框
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating logistics item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editLogisticsItem')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="houseBillNumber">{t('houseBillNumber')} *</Label>
              <Input
                id="houseBillNumber"
                name="houseBillNumber"
                value={formData.houseBillNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="houseBillReference">
                {t('houseBillReference')}
              </Label>
              <Input
                id="houseBillReference"
                name="houseBillReference"
                value={formData.houseBillReference}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consigneeName">{t('consigneeName')} *</Label>
            <Input
              id="consigneeName"
              name="consigneeName"
              value={formData.consigneeName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consigneeCity">{t('consigneeCity')}</Label>
              <Input
                id="consigneeCity"
                name="consigneeCity"
                value={formData.consigneeCity}
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
                value={formData.consigneeCountryCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goodsDescription">{t('goodsDescription')}</Label>
            <Input
              id="goodsDescription"
              name="goodsDescription"
              value={formData.goodsDescription}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weightInKG">{t('weightInKG')}</Label>
              <Input
                id="weightInKG"
                name="weightInKG"
                type="number"
                step="0.01"
                min="0"
                value={formData.weightInKG}
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
                value={formData.pieces}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="containerNumber">{t('containerNumber')}</Label>
              <Input
                id="containerNumber"
                name="containerNumber"
                value={formData.containerNumber}
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

'use client';

import type React from 'react';
import { useState } from 'react';
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
import { addLogisticsItems } from '@/lib/logistics-service';
import type { LogisticsItem } from '@/types/logistics';

interface BatchGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemsAdded: () => void;
}

export function BatchGenerateDialog({
  open,
  onOpenChange,
  onItemsAdded,
}: BatchGenerateDialogProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefix, setPrefix] = useState('ERDF');
  const [startNumber, setStartNumber] = useState(1);
  const [count, setCount] = useState(100);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 生成订单列表
      const items: Omit<LogisticsItem, 'id'>[] = [];
      for (let i = 0; i < count; i++) {
        const number = startNumber + i;
        const paddedNumber = number.toString().padStart(3, '0');
        const houseBillNumber = `${prefix}${paddedNumber}`;

        items.push({
          houseBillNumber,
          houseBillReference: '',
          shipperName: '',
          shipperAddress1: '',
          shipperAddress2: '',
          shipperCity: '',
          shipperState: '',
          shipperCountryCode: '',
          shipperPostcode: '',
          consigneeName: '',
          consigneeAddress1: '',
          consigneeAddress2: '',
          consigneeCity: '',
          consigneePostcode: '',
          consigneeState: '',
          consigneeCountryCode: '',
          consigneePhone: '',
          deliveryInstructions: '',
          goodsDescription: '',
          weightInKG: 0,
          pieces: 0,
          packType: '',
          goodsValue: 0,
          currency: '',
          cbm: 0,
          sacYN: '',
          merchantARNABN: '',
          purchaserABN: '',
          containerNumber: '',
        });
      }

      // 批量添加订单
      await addLogisticsItems(items);

      // 通知父组件
      onItemsAdded();

      // 关闭对话框
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating logistics items:', error);
      setError(t('errorGeneratingItems'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('batchGenerate')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prefix">{t('prefix')}</Label>
              <Input
                id="prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                maxLength={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startNumber">{t('startNumber')}</Label>
              <Input
                id="startNumber"
                type="number"
                min="1"
                value={startNumber}
                onChange={(e) => setStartNumber(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">{t('count')}</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}
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
              {isSubmitting ? t('generating') : t('generate')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

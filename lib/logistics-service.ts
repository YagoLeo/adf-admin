import { supabase } from './supabase-client'
import type { LogisticsItem } from '@/types/logistics'

// 表名
const TABLE_NAME = 'logistics_items'

// 获取所有物流数据
export async function getAllLogisticsItems(): Promise<LogisticsItem[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(item => ({
      id: item.id,
      houseBillNumber: item.house_bill_number,
      houseBillReference: item.house_bill_reference,
      shipperName: item.shipper_name,
      shipperAddress1: item.shipper_address1,
      shipperAddress2: item.shipper_address2,
      shipperCity: item.shipper_city,
      shipperState: item.shipper_state,
      shipperCountryCode: item.shipper_country_code,
      shipperPostcode: item.shipper_postcode,
      consigneeName: item.consignee_name,
      consigneeAddress1: item.consignee_address1,
      consigneeAddress2: item.consignee_address2,
      consigneeCity: item.consignee_city,
      consigneePostcode: item.consignee_postcode,
      consigneeState: item.consignee_state,
      consigneeCountryCode: item.consignee_country_code,
      consigneePhone: item.consignee_phone,
      deliveryInstructions: item.delivery_instructions,
      goodsDescription: item.goods_description,
      weightInKG: item.weight_in_kg,
      pieces: item.pieces,
      packType: item.pack_type,
      goodsValue: item.goods_value,
      currency: item.currency,
      cbm: item.cbm,
      sacYN: item.sac_yn,
      merchantARNABN: item.merchant_arn_abn,
      purchaserABN: item.purchaser_abn,
      containerNumber: item.container_number,
      status: item.status,
      currentLocation: item.current_location,
      trackingNumber: item.tracking_number,
      estimatedDeliveryDate: item.estimated_delivery_date,
      actualDeliveryDate: item.actual_delivery_date,
      notes: item.notes
    }))
  } catch (error) {
    console.error('Error getting logistics items:', error)
    return []
  }
}

// 获取单个物流数据
export async function getLogisticsItem(id: string): Promise<LogisticsItem | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) return null

    return {
      id: data.id,
      houseBillNumber: data.house_bill_number,
      houseBillReference: data.house_bill_reference,
      shipperName: data.shipper_name,
      shipperAddress1: data.shipper_address1,
      shipperAddress2: data.shipper_address2,
      shipperCity: data.shipper_city,
      shipperState: data.shipper_state,
      shipperCountryCode: data.shipper_country_code,
      shipperPostcode: data.shipper_postcode,
      consigneeName: data.consignee_name,
      consigneeAddress1: data.consignee_address1,
      consigneeAddress2: data.consignee_address2,
      consigneeCity: data.consignee_city,
      consigneePostcode: data.consignee_postcode,
      consigneeState: data.consignee_state,
      consigneeCountryCode: data.consignee_country_code,
      consigneePhone: data.consignee_phone,
      deliveryInstructions: data.delivery_instructions,
      goodsDescription: data.goods_description,
      weightInKG: data.weight_in_kg,
      pieces: data.pieces,
      packType: data.pack_type,
      goodsValue: data.goods_value,
      currency: data.currency,
      cbm: data.cbm,
      sacYN: data.sac_yn,
      merchantARNABN: data.merchant_arn_abn,
      purchaserABN: data.purchaser_abn,
      containerNumber: data.container_number,
      status: data.status,
      currentLocation: data.current_location,
      trackingNumber: data.tracking_number,
      estimatedDeliveryDate: data.estimated_delivery_date,
      actualDeliveryDate: data.actual_delivery_date,
      notes: data.notes
    }
  } catch (error) {
    console.error('Error getting logistics item:', error)
    return null
  }
}

// 添加单个物流数据
export async function addLogisticsItem(item: Omit<LogisticsItem, 'id'>): Promise<string> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        house_bill_number: item.houseBillNumber,
        house_bill_reference: item.houseBillReference,
        shipper_name: item.shipperName,
        shipper_address1: item.shipperAddress1,
        shipper_address2: item.shipperAddress2,
        shipper_city: item.shipperCity,
        shipper_state: item.shipperState,
        shipper_country_code: item.shipperCountryCode,
        shipper_postcode: item.shipperPostcode,
        consignee_name: item.consigneeName,
        consignee_address1: item.consigneeAddress1,
        consignee_address2: item.consigneeAddress2,
        consignee_city: item.consigneeCity,
        consignee_postcode: item.consigneePostcode,
        consignee_state: item.consigneeState,
        consignee_country_code: item.consigneeCountryCode,
        consignee_phone: item.consigneePhone,
        delivery_instructions: item.deliveryInstructions,
        goods_description: item.goodsDescription,
        weight_in_kg: item.weightInKG,
        pieces: item.pieces,
        pack_type: item.packType,
        goods_value: item.goodsValue,
        currency: item.currency,
        cbm: item.cbm,
        sac_yn: item.sacYN,
        merchant_arn_abn: item.merchantARNABN,
        purchaser_abn: item.purchaserABN,
        container_number: item.containerNumber,
        status: item.status,
        current_location: item.currentLocation,
        tracking_number: item.trackingNumber,
        estimated_delivery_date: item.estimatedDeliveryDate,
        actual_delivery_date: item.actualDeliveryDate,
        notes: item.notes
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error adding logistics item:', error)
    throw error
  }
}

// 批量添加物流数据
export async function addLogisticsItems(items: Omit<LogisticsItem, 'id'>[]): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .rpc('insert_multiple_logistics_items', {
        items: items.map(item => ({
          houseBillNumber: item.houseBillNumber,
          houseBillReference: item.houseBillReference,
          shipperName: item.shipperName,
          shipperAddress1: item.shipperAddress1,
          shipperAddress2: item.shipperAddress2,
          shipperCity: item.shipperCity,
          shipperState: item.shipperState,
          shipperCountryCode: item.shipperCountryCode,
          shipperPostcode: item.shipperPostcode,
          consigneeName: item.consigneeName,
          consigneeAddress1: item.consigneeAddress1,
          consigneeAddress2: item.consigneeAddress2,
          consigneeCity: item.consigneeCity,
          consigneePostcode: item.consigneePostcode,
          consigneeState: item.consigneeState,
          consigneeCountryCode: item.consigneeCountryCode,
          consigneePhone: item.consigneePhone,
          deliveryInstructions: item.deliveryInstructions,
          goodsDescription: item.goodsDescription,
          weightInKG: item.weightInKG,
          pieces: item.pieces,
          packType: item.packType,
          goodsValue: item.goodsValue,
          currency: item.currency,
          cbm: item.cbm,
          sacYN: item.sacYN,
          merchantARNABN: item.merchantARNABN,
          purchaserABN: item.purchaserABN,
          containerNumber: item.containerNumber,
          status: item.status,
          currentLocation: item.currentLocation,
          trackingNumber: item.trackingNumber,
          estimatedDeliveryDate: item.estimatedDeliveryDate,
          actualDeliveryDate: item.actualDeliveryDate,
          notes: item.notes
        }))
      })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding multiple logistics items:', error)
    throw error
  }
}

// 删除物流数据
export async function deleteLogisticsItem(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting logistics item:', error)
    throw error
  }
}

// 批量删除物流数据
export async function deleteLogisticsItems(ids: string[]): Promise<void> {
  try {
    const { error } = await supabase
      .rpc('delete_multiple_logistics_items', {
        item_ids: ids
      })

    if (error) throw error
  } catch (error) {
    console.error('Error deleting multiple logistics items:', error)
    throw error
  }
}

// 更新物流数据
export async function updateLogisticsItem(id: string, data: Partial<LogisticsItem>): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({
        house_bill_number: data.houseBillNumber,
        house_bill_reference: data.houseBillReference,
        shipper_name: data.shipperName,
        shipper_address1: data.shipperAddress1,
        shipper_address2: data.shipperAddress2,
        shipper_city: data.shipperCity,
        shipper_state: data.shipperState,
        shipper_country_code: data.shipperCountryCode,
        shipper_postcode: data.shipperPostcode,
        consignee_name: data.consigneeName,
        consignee_address1: data.consigneeAddress1,
        consignee_address2: data.consigneeAddress2,
        consignee_city: data.consigneeCity,
        consignee_postcode: data.consigneePostcode,
        consignee_state: data.consigneeState,
        consignee_country_code: data.consigneeCountryCode,
        consignee_phone: data.consigneePhone,
        delivery_instructions: data.deliveryInstructions,
        goods_description: data.goodsDescription,
        weight_in_kg: data.weightInKG,
        pieces: data.pieces,
        pack_type: data.packType,
        goods_value: data.goodsValue,
        currency: data.currency,
        cbm: data.cbm,
        sac_yn: data.sacYN,
        merchant_arn_abn: data.merchantARNABN,
        purchaser_abn: data.purchaserABN,
        container_number: data.containerNumber,
        status: data.status,
        current_location: data.currentLocation,
        tracking_number: data.trackingNumber,
        estimated_delivery_date: data.estimatedDeliveryDate,
        actual_delivery_date: data.actualDeliveryDate,
        notes: data.notes
      })
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error updating logistics item:', error)
    throw error
  }
}

// 准备数据用于添加到数据库
export function prepareItemForDatabase(item: Partial<LogisticsItem>): Omit<LogisticsItem, 'id'> {
  return {
    houseBillNumber: item.houseBillNumber || '',
    houseBillReference: item.houseBillReference || '',
    shipperName: item.shipperName || '',
    shipperAddress1: item.shipperAddress1 || '',
    shipperAddress2: item.shipperAddress2 || '',
    shipperCity: item.shipperCity || '',
    shipperState: item.shipperState || '',
    shipperCountryCode: item.shipperCountryCode || '',
    shipperPostcode: item.shipperPostcode || '',
    consigneeName: item.consigneeName || '',
    consigneeAddress1: item.consigneeAddress1 || '',
    consigneeAddress2: item.consigneeAddress2 || '',
    consigneeCity: item.consigneeCity || '',
    consigneePostcode: item.consigneePostcode || '',
    consigneeState: item.consigneeState || '',
    consigneeCountryCode: item.consigneeCountryCode || '',
    consigneePhone: item.consigneePhone || '',
    deliveryInstructions: item.deliveryInstructions || '',
    goodsDescription: item.goodsDescription || '',
    weightInKG: item.weightInKG || 0,
    pieces: item.pieces || 0,
    packType: item.packType || '',
    goodsValue: item.goodsValue || 0,
    currency: item.currency || '',
    cbm: item.cbm || 0,
    sacYN: item.sacYN || '',
    merchantARNABN: item.merchantARNABN || '',
    purchaserABN: item.purchaserABN || '',
    containerNumber: item.containerNumber || '',
    status: item.status || 'pending',
    currentLocation: item.currentLocation || '',
    trackingNumber: item.trackingNumber || '',
    estimatedDeliveryDate: item.estimatedDeliveryDate || '',
    actualDeliveryDate: item.actualDeliveryDate || '',
    notes: item.notes || ''
  }
} 
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { getFirestoreDb } from "./firebase-client"
import type { LogisticsItem } from "@/types/logistics"

// 集合名称
const COLLECTION_NAME = "shipments"

// 获取所有物流数据
export async function getAllLogisticsItems(): Promise<LogisticsItem[]> {
  try {
    // 确保在客户端环境
    if (typeof window === "undefined") {
      console.log("getAllLogisticsItems called during SSR, returning empty array")
      return []
    }

    // 获取Firestore实例
    const db = getFirestoreDb()
    if (!db) {
      console.error("Firestore database is not available")
      return []
    }

    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
    const items: LogisticsItem[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<LogisticsItem, "id">
      items.push({
        ...data,
        id: doc.id,
      })
    })

    return items
  } catch (error) {
    console.error("Error getting logistics items:", error)
    return []
  }
}

// 添加单个物流数据
export async function addLogisticsItem(item: Omit<LogisticsItem, "id">): Promise<string> {
  try {
    const db = getFirestoreDb()
    if (!db) {
      throw new Error("Firestore database is not available")
    }

    // 确保数值字段是数字类型
    const processedItem = {
      ...item,
      weightInKG: Number(item.weightInKG),
      pieces: Number(item.pieces),
      goodsValue: Number(item.goodsValue),
      cbm: Number(item.cbm),
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), processedItem)
    return docRef.id
  } catch (error) {
    console.error("Error adding logistics item:", error)
    throw error
  }
}

// 批量添加物流数据
export async function addLogisticsItems(items: Omit<LogisticsItem, "id">[]): Promise<string[]> {
  try {
    const db = getFirestoreDb()
    if (!db) {
      throw new Error("Firestore database is not available")
    }

    const ids: string[] = []

    // 使用Promise.all并行处理所有添加操作
    await Promise.all(
      items.map(async (item) => {
        const id = await addLogisticsItem(item)
        ids.push(id)
      }),
    )

    return ids
  } catch (error) {
    console.error("Error adding multiple logistics items:", error)
    throw error
  }
}

// 删除物流数据
export async function deleteLogisticsItem(id: string): Promise<void> {
  try {
    const db = getFirestoreDb()
    if (!db) {
      throw new Error("Firestore database is not available")
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id))
  } catch (error) {
    console.error("Error deleting logistics item:", error)
    throw error
  }
}

// 批量删除物流数据
export async function deleteLogisticsItems(ids: string[]): Promise<void> {
  try {
    const db = getFirestoreDb()
    if (!db) {
      throw new Error("Firestore database is not available")
    }

    // 使用Promise.all并行处理所有删除操作
    await Promise.all(
      ids.map(async (id) => {
        await deleteLogisticsItem(id)
      }),
    )
  } catch (error) {
    console.error("Error deleting multiple logistics items:", error)
    throw error
  }
}

// 更新物流数据
export async function updateLogisticsItem(id: string, data: Partial<LogisticsItem>): Promise<void> {
  try {
    const db = getFirestoreDb()
    if (!db) {
      throw new Error("Firestore database is not available")
    }

    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, data)
  } catch (error) {
    console.error("Error updating logistics item:", error)
    throw error
  }
}

// 准备数据用于添加到Firebase
export function prepareItemForFirebase(item: Partial<LogisticsItem>): Omit<LogisticsItem, "id"> {
  // 创建一个基本的物流项目模板，所有字段都有默认值
  const defaultItem: Omit<LogisticsItem, "id"> = {
    houseBillNumber: "",
    houseBillReference: "",
    shipperName: "",
    shipperAddress1: "",
    shipperAddress2: "",
    shipperCity: "",
    shipperState: "",
    shipperCountryCode: "",
    shipperPostcode: "",
    consigneeName: "",
    consigneeAddress1: "",
    consigneeAddress2: "",
    consigneeCity: "",
    consigneePostcode: "",
    consigneeState: "",
    consigneeCountryCode: "",
    consigneePhone: "",
    deliveryInstructions: "",
    goodsDescription: "",
    weightInKG: 0,
    pieces: 0,
    packType: "",
    goodsValue: 0,
    currency: "",
    cbm: 0,
    sacYN: "",
    merchantARNABN: "",
    purchaserABN: "",
    containerNumber: "",
  }

  // 合并提供的数据与默认值
  return {
    ...defaultItem,
    ...item,
  }
}


import { jsPDF } from "jspdf"
import type { LogisticsItem } from "@/types/logistics"
import { generateBarcode } from "@/lib/barcode-generator"
import type { TranslationFunction } from "@/types/language"
import qrcode from "qrcode-generator"

// 确保所有值都转换为字符串
function ensureString(value: any): string {
  if (value === null || value === undefined) {
    return ""
  }
  return String(value)
}

// 添加中文字体支持
function addChinese(doc: jsPDF) {
  // 使用内置的中文支持
  ;(doc as any).addFont("https://cdn.jsdelivr.net/npm/pdfjs-dist@2.7.570/cmaps/", "gb-euc-h", "normal")
  ;(doc as any).addFont("https://cdn.jsdelivr.net/npm/pdfjs-dist@2.7.570/cmaps/", "gb-euc-v", "normal")
}

export async function generatePDF(items: LogisticsItem[], t: TranslationFunction) {
  // 创建PDF文档 - 使用自定义尺寸
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 200], // 收据样式的窄长格式：宽80mm，高200mm
    putOnlyUsedFonts: true,
    compress: true,
  })

  // 使用英文标签避免中文问题
  const labels = {
    houseBillNumber: "House Bill Number",
    consigneeName: "Consignee Name",
    consigneeAddress: "Consignee Address",
    consigneeCity: "Consignee City",
    consigneePostcode: "Consignee Postcode",
    consigneeState: "Consignee State",
    consigneeCountryCode: "Consignee Country",
    consigneePhone: "Consignee Phone",
    weightInKG: "Weight In KG",
    pieces: "Pieces",
    goodsValue: "Goods Value",
    cbm: "CBM",
    containerNumber: "Container Number",
    logisticsLedgerTitle: "Aodefa Logistics International Freight",
  }

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 5  // 减小边距
  const labelWidth = pageWidth - margin * 2
  const labelHeight = 190  // 调整标签高度

  // 为每个物流项生成一页
  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // 除第一页外，添加新页
    if (i > 0) {
      doc.addPage()
    }

    // 计算当前标签的位置
    const x = margin
    const y = margin

    // 绘制标签边框
    doc.setDrawColor(0)
    doc.setLineWidth(0.5)
    doc.rect(x, y, labelWidth, labelHeight)

    // 添加标签内容
    doc.setFontSize(8)  // 减小字体大小
    doc.setFont("helvetica", "bold")

    // 标题
    const title = labels.logisticsLedgerTitle
    doc.text(title, pageWidth / 2, y + 8, { align: "center" })

    // 重置字体
    doc.setFont("helvetica", "normal")

    // 调整内容布局
    let contentY = y + 15
    const lineHeight = 5  // 减小行高
    const labelX = x + 2
    const valueX = x + 30  // 减小标签和值之间的距离

    // House Bill Number
    doc.text(`${labels.houseBillNumber}:`, labelX, contentY)
    doc.text(ensureString(item.houseBillNumber), valueX, contentY)
    contentY += lineHeight

    // Consignee Name
    doc.text(`${labels.consigneeName}:`, labelX, contentY)
    doc.text(ensureString(item.consigneeName), valueX, contentY)
    contentY += lineHeight

    // Consignee Address
    doc.text(`${labels.consigneeAddress}:`, labelX, contentY)
    const address = [ensureString(item.consigneeAddress1), ensureString(item.consigneeAddress2)]
      .filter(Boolean)
      .join(", ")
    doc.text(address, valueX, contentY)
    contentY += lineHeight

    // Consignee City
    doc.text(`${labels.consigneeCity}:`, labelX, contentY)
    doc.text(ensureString(item.consigneeCity), valueX, contentY)
    contentY += lineHeight

    // Consignee Postcode
    doc.text(`${labels.consigneePostcode}:`, labelX, contentY)
    doc.text(ensureString(item.consigneePostcode), valueX, contentY)
    contentY += lineHeight

    // Consignee State
    doc.text(`${labels.consigneeState}:`, labelX, contentY)
    doc.text(ensureString(item.consigneeState), valueX, contentY)
    contentY += lineHeight

    // Consignee Country
    doc.text(`${labels.consigneeCountryCode}:`, labelX, contentY)
    doc.text(ensureString(item.consigneeCountryCode), valueX, contentY)
    contentY += lineHeight

    // Consignee Phone
    doc.text(`${labels.consigneePhone}:`, labelX, contentY)
    doc.text(ensureString(item.consigneePhone), valueX, contentY)
    contentY += lineHeight

    // Weight In KG
    doc.text(`${labels.weightInKG}:`, labelX, contentY)
    doc.text(ensureString(item.weightInKG), valueX, contentY)
    contentY += lineHeight

    // Pieces
    doc.text(`${labels.pieces}:`, labelX, contentY)
    doc.text(ensureString(item.pieces), valueX, contentY)
    contentY += lineHeight

    // Goods Value
    doc.text(`${labels.goodsValue}:`, labelX, contentY)
    doc.text(`${ensureString(item.goodsValue)} ${ensureString(item.currency)}`, valueX, contentY)
    contentY += lineHeight

    // CBM
    doc.text(`${labels.cbm}:`, labelX, contentY)
    doc.text(ensureString(item.cbm), valueX, contentY)
    contentY += lineHeight

    // Container Number
    doc.text(`${labels.containerNumber}:`, labelX, contentY)
    doc.text(ensureString(item.containerNumber), valueX, contentY)
    contentY += lineHeight + 5 // 增加一些额外空间给条形码

    // 生成条形码
    try {
      const barcodeValue = item.containerNumber || item.houseBillNumber
      const barcodeDataUrl = await generateBarcode(ensureString(barcodeValue))

      // 条形码紧跟在Container Number下方
      const barcodeX = x + labelWidth / 2 - 30
      const barcodeY = contentY - 3 // 稍微上移一点以紧贴文字
      const barcodeWidth = 60
      const barcodeHeight = 15

      doc.addImage(barcodeDataUrl, "PNG", barcodeX, barcodeY, barcodeWidth, barcodeHeight)
      contentY += barcodeHeight + 5 // 增加间距

      // 生成二维码
      const qr = qrcode(0, 'M')
      qr.addData('https://adf.eagur.com')
      qr.make()
      const qrDataUrl = qr.createDataURL(2)
      
      // 添加二维码
      const qrSize = 30
      const qrX = x + labelWidth / 2 - qrSize / 2
      const qrY = contentY
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize)
      contentY += qrSize + 5

      // 添加说明文字
      doc.setFontSize(7)
      doc.text("Scan QR code or visit https://adf.eagur.com to fill form", pageWidth / 2, contentY, { align: "center" })

    } catch (error) {
      console.error("Error generating barcode or QR code:", error)
    }
  }

  // 保存PDF
  const filename = `Aodefa-Logistics-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}


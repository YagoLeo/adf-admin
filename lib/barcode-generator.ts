import JsBarcode from "jsbarcode"

  function transformString(stringValue: string): string {
    // 取 stringValue 的最后三位
    let lastThree = stringValue.slice(-3);
    // 拼接前缀
    return "6820253043" + lastThree;
  }

export async function generateBarcode(value: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 确保值是字符串
      const stringValue = String(value || "")

      console.log("二维码编号", transformString(stringValue))

      // 如果字符串为空，使用默认值
      const barcodeValue = transformString(stringValue).trim() || "0000000000"

      // Create a canvas element
      const canvas = document.createElement("canvas")

      // Generate barcode on canvas
      JsBarcode(canvas, barcodeValue, {
        format: "CODE128",
        displayValue: true,
        fontSize: 12,
        height: 50,
        margin: 5,
      })

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/png")
      resolve(dataUrl)
    } catch (error) {
      reject(error)
    }
  })
}


export type TranslationKey =
  | "logisticsLedgerTitle"
  | "importLogisticsData"
  | "logisticsLedgerData"
  | "selected"
  | "records"
  | "generateLogisticsPDF"
  | "generating"
  | "pleaseSelectAtLeastOneRecord"
  | "errorGeneratingPDF"
  | "errorGeneratingPDFTryAgain"
  | "errorProcessingExcelFile"
  | "errorProcessingExcelFileCheckFormat"
  | "pleaseUploadExcelFile"
  | "dragAndDropExcelFile"
  | "or"
  | "browseFiles"
  | "processingExcelFile"
  | "excelTemplateFormat"
  | "excelTemplateShouldContain"
  | "searchByBillNumberOrConsignee"
  | "selectAll"
  | "houseBillNumber"
  | "houseBillReference"
  | "consigneeName"
  | "consigneeAddress"
  | "consigneeCity"
  | "consigneePostcode"
  | "consigneeState"
  | "consigneeCountryCode"
  | "consigneePhone"
  | "goodsDescription"
  | "weightInKG"
  | "pieces"
  | "goodsValue"
  | "cbm"
  | "containerNumber"
  | "select"
  | "noData"
  | "noMatchingRecords"
  | "ledger"
  | "importData"
  | "errorGeneratingBarcode"
  | "previewData"
  | "cancel"
  | "submitToDatabase"
  | "submitting"
  | "showingFirstRecords"
  | "errorSubmittingToFirebase"
  | "addNewLogisticsItem"
  | "save"
  | "saving"
  | "addNew"
  | "deleteSelected"
  | "deleting"
  | "selectedItemsDeleted"
  | "errorDeletingItems"
  | "loadingData"
  | "refreshData"
  | "error"
  | "success"

export const translations: Record<string, Record<TranslationKey, string>> = {
  zh: {
    logisticsLedgerTitle: "澳德发物流国际货运物流台账",
    importLogisticsData: "导入物流数据",
    logisticsLedgerData: "物流台账数据",
    selected: "已选择",
    records: "条记录",
    generateLogisticsPDF: "生成物流单PDF",
    generating: "生成中...",
    pleaseSelectAtLeastOneRecord: "请先选择至少一条物流记录",
    errorGeneratingPDF: "生成PDF时出错:",
    errorGeneratingPDFTryAgain: "生成PDF时出错，请重试",
    errorProcessingExcelFile: "处理Excel文件时出错:",
    errorProcessingExcelFileCheckFormat: "处理Excel文件时出错，请确保文件格式正确",
    pleaseUploadExcelFile: "请上传Excel文件 (.xlsx 或 .xls)",
    dragAndDropExcelFile: "拖放Excel文件到此处",
    or: "或",
    browseFiles: "浏览文件",
    processingExcelFile: "正在处理Excel文件，请稍候...",
    excelTemplateFormat: "Excel模板格式",
    excelTemplateShouldContain: "Excel模板应包含以下列:",
    searchByBillNumberOrConsignee: "按运单号或收件人搜索",
    selectAll: "全选",
    houseBillNumber: "运单号",
    houseBillReference: "运单参考号",
    consigneeName: "收件人",
    consigneeAddress: "收件地址",
    consigneeCity: "收件城市",
    consigneePostcode: "收件邮编",
    consigneeState: "收件州/省",
    consigneeCountryCode: "收件国家",
    consigneePhone: "收件人电话",
    goodsDescription: "货物描述",
    weightInKG: "重量(KG)",
    pieces: "件数",
    goodsValue: "货物价值",
    cbm: "体积(CBM)",
    containerNumber: "集装箱号",
    select: "选择",
    noData: "暂无数据",
    noMatchingRecords: "没有匹配的记录",
    ledger: "物流台账",
    importData: "导入数据",
    errorGeneratingBarcode: "生成条形码时出错:",
    previewData: "数据预览",
    cancel: "取消",
    submitToDatabase: "提交到数据库",
    submitting: "提交中...",
    showingFirstRecords: "显示前 {count} 条记录，共 {total} 条",
    errorSubmittingToFirebase: "提交数据到数据库时出错",
    addNewLogisticsItem: "添加新物流记录",
    save: "保存",
    saving: "保存中...",
    addNew: "新增记录",
    deleteSelected: "删除所选",
    deleting: "删除中...",
    selectedItemsDeleted: "所选记录已成功删除",
    errorDeletingItems: "删除记录时出错",
    loadingData: "加载数据中...",
    refreshData: "刷新数据",
    error: "错误",
    success: "成功",
  },
  en: {
    logisticsLedgerTitle: "Aodefa Logistics International Freight Ledger",
    importLogisticsData: "Import Logistics Data",
    logisticsLedgerData: "Logistics Ledger Data",
    selected: "Selected",
    records: "records",
    generateLogisticsPDF: "Generate Logistics PDF",
    generating: "Generating...",
    pleaseSelectAtLeastOneRecord: "Please select at least one record",
    errorGeneratingPDF: "Error generating PDF:",
    errorGeneratingPDFTryAgain: "Error generating PDF, please try again",
    errorProcessingExcelFile: "Error processing Excel file:",
    errorProcessingExcelFileCheckFormat: "Error processing Excel file, please check the format",
    pleaseUploadExcelFile: "Please upload an Excel file (.xlsx or .xls)",
    dragAndDropExcelFile: "Drag and drop Excel file here",
    or: "or",
    browseFiles: "Browse Files",
    processingExcelFile: "Processing Excel file, please wait...",
    excelTemplateFormat: "Excel Template Format",
    excelTemplateShouldContain: "Excel template should contain the following columns:",
    searchByBillNumberOrConsignee: "Search by bill number or consignee",
    selectAll: "Select All",
    houseBillNumber: "House Bill Number",
    houseBillReference: "House Bill Reference",
    consigneeName: "Consignee Name",
    consigneeAddress: "Consignee Address",
    consigneeCity: "Consignee City",
    consigneePostcode: "Consignee Postcode",
    consigneeState: "Consignee State",
    consigneeCountryCode: "Consignee Country",
    consigneePhone: "Consignee Phone",
    goodsDescription: "Goods Description",
    weightInKG: "Weight In KG",
    pieces: "Pieces",
    goodsValue: "Goods Value",
    cbm: "CBM",
    containerNumber: "Container Number",
    select: "Select",
    noData: "No data",
    noMatchingRecords: "No matching records",
    ledger: "Ledger",
    importData: "Import Data",
    errorGeneratingBarcode: "Error generating barcode:",
    previewData: "Data Preview",
    cancel: "Cancel",
    submitToDatabase: "Submit to Database",
    submitting: "Submitting...",
    showingFirstRecords: "Showing first {count} of {total} records",
    errorSubmittingToFirebase: "Error submitting data to database",
    addNewLogisticsItem: "Add New Logistics Item",
    save: "Save",
    saving: "Saving...",
    addNew: "Add New",
    deleteSelected: "Delete Selected",
    deleting: "Deleting...",
    selectedItemsDeleted: "Selected items successfully deleted",
    errorDeletingItems: "Error deleting items",
    loadingData: "Loading data...",
    refreshData: "Refresh Data",
    error: "Error",
    success: "Success",
  },
}


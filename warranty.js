const axios = require('axios');
const db = require('./db');

function isEmpty(obj) {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }
  return Object.keys(obj).length === 0;
}

async function updateWarrantyOnPrinterTable(serialNumber, warrantyStartDate, warrantyEndDate) {
  const updatePrinterWarranty = 'UPDATE printers SET warranty_start_date = $1, warranty_end_date = $2 WHERE serial_number_id = $3';
	const updatePrinterWarrantyValues = [warrantyStartDate, warrantyEndDate, serialNumber];
    try {
    const { rows } = await db.query(updatePrinterWarranty, updatePrinterWarrantyValues);
  } catch (err) {
    console.error(err);
  }
}

const setWarrantyOnPrinter = async (serialNumber) => {
  const data = {"namespace":"","classname":"@udd/01pKk000000L6Wn","method":"serialCalloutEVM","isContinuation":false,"params":{"serialNumber": serialNumber},"cacheable":false};
  const url = 'https://support-new.zebra.com/webruntime/api/apex/execute';
  const config = {
    params: {
      language: 'en-US',
      asGuest: 'true',
      htmlEncode: 'false'
    },
    headers: {
      'Accept': '*/*',
      'Accept-Language': 'en-US;en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://support-new.zebra.com/warrantycheck',
      'Content-Type': 'application/json; charset=utf-8',
      'Te': 'trailers',
      'Priority': 'u=0'
    },
    timeout: 5000,
  };

  axios.post(url, data, config)
    .then((res) => {
      const jsonZebra = JSON.parse(JSON.stringify(res.data.returnValue));
      if (isEmpty(jsonZebra.ListOfZEBSerialNumber)) {
          return null;
      } else {    
          const warrantyStartDate = jsonZebra.ListOfZEBSerialNumber.Asset[0].WarrantyStartDate;
          const warrantyEndDate = jsonZebra.ListOfZEBSerialNumber.Asset[0].WarrantyEndDate;
          updateWarrantyOnPrinterTable(serialNumber, warrantyStartDate, warrantyEndDate);
      }
    })
    .catch((err) => {
      console.error(err);
  });
}

module.exports = {
  setWarrantyOnPrinter
};
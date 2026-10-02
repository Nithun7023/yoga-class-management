const { Parser } = require('json2csv');

/**
 * Stream a CSV download to the Express response.
 * @param {Object} res - Express response
 * @param {string} filename - downloaded filename (without .csv)
 * @param {Array} fields - [{label, value}] field definitions
 * @param {Array} data - array of plain objects
 */
const exportCSV = (res, filename, fields, data) => {
  try {
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.status(200).send(csv);
  } catch (err) {
    throw new Error(`CSV export failed: ${err.message}`);
  }
};

module.exports = exportCSV;

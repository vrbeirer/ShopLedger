var test = require('node:test');
var assert = require('node:assert/strict');

var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function calculate(order) {
  return {
    invoice: invoice.computeInvoiceFigures(order),
    pricing: pricing.computeTotals(order.items, order.coupon)
  };
}

test('CURRENT BEHAVIOUR: invoice uses supplied 5% and 12% gstRate values for a mixed-slab order', function () {
  var order = {
    id: 1001,
    coupon: '',
    items: [
      { id: 2, name: 'Toor Dal', hsn: '0713', gstRate: 5, price: 165, qty: 2 },
      { id: 6, name: 'Ghee', hsn: '0405', gstRate: 12, price: 450, qty: 1 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 780,
    discount: 0,
    tax: 70.5,
    cgst: 35.25,
    sgst: 35.25,
    total: 850.5,
    rows: [
      { name: 'Toor Dal', sku: '-', hsn: '0713', qty: 2, price: 165, gstPercent: 5, line: 330, lineTax: 16.5 },
      { name: 'Ghee', sku: '-', hsn: '0405', qty: 1, price: 450, gstPercent: 12, line: 450, lineTax: 54 }
    ]
  });
  assert.equal(result.pricing.total, 850.5);
});

test('CURRENT BEHAVIOUR: SAVE10 invoice matches checkout after discounting taxable values', function () {
  var order = {
    id: 1002,
    coupon: 'SAVE10',
    items: [
      { id: 1, name: 'Rice', hsn: '1006', gstRate: 5, price: 640, qty: 1 },
      { id: 4, name: 'Sunflower Oil', hsn: '1512', gstRate: 5, price: 190, qty: 2 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      { name: 'Rice', sku: '-', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
      { name: 'Sunflower Oil', sku: '-', hsn: '1512', qty: 2, price: 190, gstPercent: 5, line: 380, lineTax: 17.1 }
    ]
  });
  assert.equal(result.pricing.discount, 102);
  assert.equal(result.pricing.tax, 45.9);
  assert.equal(result.pricing.total, 963.9);
});

test('CURRENT BEHAVIOUR: SAVE10 invoice applies the ₹150 coupon cap for a ₹2,240 order', function () {
  var order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { id: 5, name: 'Groundnut Oil', hsn: '1508', gstRate: 5, price: 1120, qty: 2 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      { name: 'Groundnut Oil', sku: '-', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  });
  assert.equal(result.pricing.discount, 150);
  assert.equal(result.pricing.tax, 104.5);
  assert.equal(result.pricing.total, 2194.5);
});

test('CURRENT BEHAVIOUR: an all-18% order without a coupon produces matching invoice and pricing figures', function () {
  var order = {
    id: 1008,
    coupon: '',
    items: [
      { id: 8, name: 'Tea', hsn: '0902', gstRate: 18, price: 140, qty: 1 },
      { id: 12, name: 'Kokum Sherbet', hsn: '2106', gstRate: 18, price: 180, qty: 2 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      { name: 'Tea', sku: '-', hsn: '0902', qty: 1, price: 140, gstPercent: 18, line: 140, lineTax: 25.2 },
      { name: 'Kokum Sherbet', sku: '-', hsn: '2106', qty: 2, price: 180, gstPercent: 18, line: 360, lineTax: 64.8 }
    ]
  });
  assert.deepEqual(result.pricing, {
    subtotal: 500,
    discount: 0,
    taxable: 500,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    lines: [
      { id: 8, name: 'Tea', hsn: '0902', gstPercent: 18, gross: 140, discount: 0, taxable: 140, tax: 25.2, net: 165.2 },
      { id: 12, name: 'Kokum Sherbet', hsn: '2106', gstPercent: 18, gross: 360, discount: 0, taxable: 360, tax: 64.8, net: 424.8 }
    ]
  });
});

test('invoice matches checkout HSN GST and capped SAVE10 figures for the stored order shape', function () {
  var order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { id: 5, name: 'Groundnut Oil', hsn: '1508', price: 1120, qty: 2 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      { name: 'Groundnut Oil', sku: '-', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  });
  assert.equal(result.pricing.total, result.invoice.total);
});

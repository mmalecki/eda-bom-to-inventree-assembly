#!/usr/bin/env node
'use strict'

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { stringify as stringifySync } from 'csv-stringify/sync';
import { transform } from 'stream-transform';

const argv = yargs(hideBin(process.argv))
  .option('pcb-part-name', { type: 'string', description: 'Include PCB with this part name in the BOM' })
  .option('pcb-part-ipn', { type: 'string', description: 'Include PCB with this part IPN in the BOM' })
  .parse()

const MPN_FIELDS = ['MPN', 'Part Number', 'Manufacturer Part Number', 'Part ID'];
const IPN_FIELD = 'IPN'

let headerRow = stringifySync([Object.keys(inventreeRecord({}))])

function inventreeRecord({ partName, partIpn, quantity, reference, note = '', optional = false, consumable = false, inherited = true }) {
  return {
    'Part_Name': partName,
    'Part_IPN': partIpn,
    'Quantity': quantity,
    'Reference': reference,
    'Note': note,
    'Optional': optional.toString(),
    'Consumable': consumable.toString(),
    'Inherited': inherited.toString(),
  }
}

let pcbRow;

if (argv['pcb-part-name'] || argv['pcb-part-ipn']) {
  pcbRow = stringifySync(
     [inventreeRecord({
       partName: argv['pcb-part-name'] || '',
       partIpn:  argv['pcb-part-ipn'] || '',
       quantity: 1,
       reference: 'PCB',
     })]
  )
}

const in_ = process.stdin
const out = process.stdout

// Write the header ourselves, so that we can insert the PCB row right
// afterwards, but before piping, where we lose control of the stream.
// I'm sure there's a "clever" way to do that, but that's what I'm
// trying to avoid here.
out.write(headerRow)

if (pcbRow) out.write(pcbRow)

in_
  .pipe(parse({ columns: true }))
  .pipe(transform((row) => {
    const ref = row['Reference'];
    const quantity = row['Qty'] || row['Quantity'] || '1';

    // Find the first available MPN field
    const partMpn = MPN_FIELDS.reduce((acc, field) => {
      return acc || row[field] || '';
    }, '');

    return inventreeRecord({
      partName: partMpn,
      partIpn: row[IPN_FIELD] || '',
      quantity,
      reference: ref,
    });
  }))
  .pipe(stringify({ header: false }))
  .pipe(out)

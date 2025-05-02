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


let pcbRow;

if (argv['pcb-part-name'] || argv['pcb-part-ipn']) {
  pcbRow = [stringifySync(
     [{
      'Part_Name': argv['pcb-part-name'] || '',
      'Part_IPN':  argv['pcb-part-ipn'] || '',
      'Quantity': 1,
      'Reference': 'PCB',
      'Note': '',
      'Optional': 'false',
      'Consumable': 'false',
      'Inherited': 'true',
    }]
  )]
}

const in_ = process.stdin
const out = process.stdout

in_
  .pipe(parse({ columns: true, delimeter: ',' }))
  .pipe(transform((row) => {
    const ref = row['Reference'];
    const quantity = row['Qty'] || row['Quantity'] || '1';

    // Find the first available MPN field
    const partMpn = MPN_FIELDS.reduce((acc, field) => {
      return acc || row[field] || '';
    }, '');

    return {
      'Part_Name': partMpn,
      'Part_IPN': row[IPN_FIELD] || '',
      'Quantity': quantity,
      'Reference': ref,
      'Note': '',
      'Optional': 'false',
      'Consumable': 'false',
      'Inherited': 'true',
    };
  }))
  .pipe(stringify({ header: true }))
  .pipe(out)

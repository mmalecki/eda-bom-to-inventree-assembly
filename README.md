# EDA BOM to InvenTree assembly
This tool takes a EDA BOM (such as one would generate using KiCad's "Tools -> Generate Bill of Materials...") and
converts it into an InventTree importable BOM.

It uses the following fields in the input:
* "MPN", "Part Number", "Manufacturer Part Number" or "Part ID" as InvenTree "Part Name"
* "IPN" - optionally, as InvenTree "Part IPN"

## Installation

```sh
npm -g i eda-bom-to-inventree-assembly
```

## Usage

```sh
eda-bom-to-inventree-assembly < kicad-bom.csv > inventree-bom.csv
```

or, without installing, using `npx`:

```
npx eda-bom-to-inventree-assembly < kicad-bom.csv > inventree-bom.csv
```

The BOM can then be imported using [InvenTree's BOM import functionality](https://docs.inventree.org/en/stable/build/bom_import/).

## Alternatives

If you prefer a GUI-based approach, check out [kinventree-bom](https://github.com/clj/kinventree-bom).

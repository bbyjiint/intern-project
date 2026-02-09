#!/usr/bin/env python3
"""
Script to extract district data from Excel file and generate SQL INSERT statements.
Requires: pip install pandas openpyxl
"""

import pandas as pd
import sys
from pathlib import Path

def escape_sql_string(s):
    """Escape single quotes in SQL strings"""
    if pd.isna(s):
        return ''
    return str(s).replace("'", "''")

def generate_sql_insert(district_name, thname, province_name):
    """Generate a single SQL INSERT statement for a district"""
    sql = f"""INSERT INTO "District" ("id", "provinceId", "name", "thname", "code", "postalCode", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  p.id,
  '{escape_sql_string(district_name)}',
  '{escape_sql_string(thname)}',
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Province" p
WHERE p.name = '{escape_sql_string(province_name)}'
ON CONFLICT ("provinceId", "name") 
DO UPDATE SET 
  "thname" = EXCLUDED."thname",
  "updatedAt" = CURRENT_TIMESTAMP;

"""
    return sql

def main():
    # Get Excel file path from command line or use default
    if len(sys.argv) > 1:
        excel_file = sys.argv[1]
    else:
        excel_file = input("Enter path to Excel file: ").strip()
    
    if not Path(excel_file).exists():
        print(f"Error: File '{excel_file}' not found!")
        sys.exit(1)
    
    print(f"Reading Excel file: {excel_file}")
    
    try:
        # Read Excel file
        # Try different possible column names
        df = pd.read_excel(excel_file)
        
        print(f"Columns found: {list(df.columns)}")
        print(f"Total rows: {len(df)}")
        
        # Try to identify columns (case-insensitive)
        district_col = None
        thname_col = None
        province_col = None
        
        for col in df.columns:
            col_lower = str(col).lower()
            if 'district' in col_lower or 'amphoe' in col_lower:
                if district_col is None:
                    district_col = col
            elif 'thname' in col_lower or 'thai' in col_lower or 'th' in col_lower:
                if thname_col is None:
                    thname_col = col
            elif 'province' in col_lower or 'changwat' in col_lower:
                if province_col is None:
                    province_col = col
        
        # If not found automatically, ask user or use first 3 columns
        if not district_col:
            print("\nCould not auto-detect columns. Please specify:")
            print(f"Available columns: {list(df.columns)}")
            district_col = input("District column name (or index): ").strip()
            if district_col.isdigit():
                district_col = df.columns[int(district_col)]
        
        if not thname_col:
            thname_col = input("Thai name column name (or index): ").strip()
            if thname_col.isdigit():
                thname_col = df.columns[int(thname_col)]
        
        if not province_col:
            province_col = input("Province column name (or index): ").strip()
            if province_col.isdigit():
                province_col = df.columns[int(province_col)]
        
        print(f"\nUsing columns:")
        print(f"  District: {district_col}")
        print(f"  Thai Name: {thname_col}")
        print(f"  Province: {province_col}")
        
        # Extract data
        districts = []
        for idx, row in df.iterrows():
            district = row[district_col] if pd.notna(row[district_col]) else ''
            thname = row[thname_col] if pd.notna(row[thname_col]) else ''
            province = row[province_col] if pd.notna(row[province_col]) else ''
            
            if district and province:  # Only add if we have required fields
                districts.append({
                    'district': str(district).strip(),
                    'thname': str(thname).strip(),
                    'province': str(province).strip()
                })
        
        print(f"\nExtracted {len(districts)} districts")
        
        # Split into 8 parts
        total = len(districts)
        num_parts = 8
        part_size = (total + num_parts - 1) // num_parts  # Round up division
        
        output_dir = Path(__file__).parent
        
        for part_num in range(1, num_parts + 1):
            start_idx = (part_num - 1) * part_size
            end_idx = min(start_idx + part_size, total)
            part_districts = districts[start_idx:end_idx]
            
            if not part_districts:  # Skip empty parts
                continue
            
            sql_content = f"""-- District Seed Part {part_num}
-- Generated from Excel file: {Path(excel_file).name}
-- Districts {start_idx + 1} to {end_idx} of {total}

"""
            
            for d in part_districts:
                sql_content += generate_sql_insert(d['district'], d['thname'], d['province'])
            
            output_file = output_dir / f"seed-districts-part{part_num}.sql"
            output_file.write_text(sql_content, encoding='utf-8')
            print(f"Generated: {output_file.name} ({len(part_districts)} districts)")
        
        print(f"\n✅ Successfully generated {num_parts} SQL files with {total} districts total!")
        print(f"Files saved in: {output_dir}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

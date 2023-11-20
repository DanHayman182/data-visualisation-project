import pycountry_convert as pc
import reverse_geocoder as rg
import csv
from multiprocessing import freeze_support
from datetime import datetime

original_rows = []
global_data = {}
processed_rows = []

# Read initial data-set
with open('Significant Earthquake Dataset 1900-2023.csv', 'r', encoding='utf-8') as csv_input:
   reader = csv.reader(csv_input)

   # Skip header row
   row = next(reader)
   for row in reader:
       original_rows.append(row)

   csv_input.close()

# Read mappings between countries, sub-continents and continents
with open('continents.csv', 'r', encoding='utf-8') as csv_input:
    reader = csv.reader(csv_input)

    # Skip header row
    row = next(reader)
    for row in reader:
        # Add country to mapping
        country_data = [row[0]]

        # Skip Antarctica
        if row[1] == 'AQ':
            continue

        # Add sub-continent
        if row[7] == '':
            country_data.append(row[6])
        elif row[7] == 'South America':
            country_data.append('Southern America')
        else:
            country_data.append(row[7])

        # Add continent
        country_data.append(row[5])

        # Add mapping to lookup table
        global_data[row[1]] = country_data

    csv_input.close()

# Reverse lookup closest city to each earthquake
coords = tuple((float(row[2]), float(row[3])) for row in original_rows)
countries = rg.search(coords)

freeze_support()
for row, country in zip(original_rows, countries):
    # Extract place from earthquake data-set and format appropriately
    if row[1] == "":
        place = ""
    else:
        place = row[1][0].upper() + row[1][1:]

    # Construct new data-set, taking relevant attributes from earthquake data-set
    new_row = [row[0], place, row[2], row[3], row[5]]

    # Convert timestamp datetime to remove data before 1973
    date = datetime.strptime(row[0], "%Y-%m-%dT%H:%M:%S.%fZ")

    if date.year >= 1973 and country is not None:
        try:
            # Extract country code of city from reverse lookup
            country_code = country['cc']

            # Lookup mappings for country code and add country and sub-continent to the new row
            country_data = global_data[country_code]

            new_row.append(country_data[0])
            new_row.append(country_data[1])

            # Use pycountry_convert when mappings give the general continent America, to divide into North and South
            if country_data[2] == 'Americas':
                country_continent_code = pc.country_alpha2_to_continent_code(country_code)
                country_continent_name = pc.convert_continent_code_to_continent_name(country_continent_code)
                new_row.append(country_continent_name)
            else:
                # Otherwise append continent
                new_row.append(country_data[2])

            # Add row to the new data-set
            processed_rows.append(new_row)
        except:
            # In case of any errors, skip the row
            pass

# Write the new rows to the output file
with open('./earthquake-dataset-1973-2023.csv', 'w+', encoding="utf-8") as csv_output:
    writer = csv.writer(csv_output, lineterminator='\n')
    writer.writerow(['time', 'place', 'latitude', 'longitude', 'mag', 'country', 'sub_continent', 'continent'])

    for row in processed_rows:
        writer.writerow(row)

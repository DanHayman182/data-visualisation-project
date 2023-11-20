import json

# Pre-process World countries TopoJSON files, at three resolutions
for detail in ['10', '50', '110']:
    # Load file
    with open(f'./ne_{detail}m_admin_0_countries.json', 'r', encoding='utf-8') as json_file:
        json_data = json.load(json_file)
        json_file.close()

    # Standardise name of main object across the three files
    json_data['objects']['countries'] = json_data['objects'][f'ne_{detail}m_admin_0_countries']
    del json_data['objects'][f'ne_{detail}m_admin_0_countries']

    # Extract only the English name of the country from the full properties
    for i in range(len(json_data['objects']['countries']['geometries'])):
        json_data['objects']['countries']['geometries'][i]['properties'] = {
            'name': json_data['objects']['countries']['geometries'][i]['properties']['NAME_EN']
        }

    # Save file
    with open(f'./countries-{detail}m.json', 'w+', encoding='utf-8') as json_file:
        json.dump(json_data, json_file, ensure_ascii=False, separators=(',', ':'))
        json_file.close()


# Pre-process World major cities files at two resolutions
for detail in ['50', '110']:
    with open(f'./ne_{detail}m_populated_places_simple.json', 'r', encoding='utf-8') as json_file:
        json_data = json.load(json_file)
        json_file.close()

    # Standardise name of main object
    json_data['objects']['cities'] = json_data['objects'][f'ne_{detail}m_populated_places_simple']
    del json_data['objects'][f'ne_{detail}m_populated_places_simple']

    # Extract name and country, and determine if the city is a capital city
    for i in range(len(json_data['objects']['cities']['geometries'])):
        data_point = json_data['objects']['cities']['geometries'][i]['properties']
        
        json_data['objects']['cities']['geometries'][i]['properties'] = {
            'name': data_point['nameascii'],
            'country': data_point['adm0name'],
            'capital': data_point['featurecla'] == 'Admin-0 capital',            
        }
        
    with open(f'./cities-{detail}m.json', 'w+', encoding='utf-8') as json_file:
        json.dump(json_data, json_file, ensure_ascii=False, separators=(',', ':'))
        json_file.close()



# Pre-processing of tectonic plates file
with open('./PB2002_plates.json', 'r', encoding='utf-8') as json_file:
    json_data = json.load(json_file)
    json_file.close()

json_data['objects']['plates'] = json_data['objects']['PB2002_plates']
del json_data['objects']['PB2002_plates']

# No properties of the plates are needed here
for i in range(len(json_data['objects']['plates']['geometries'])):
    del json_data['objects']['plates']['geometries'][i]['properties']
    
with open('./tectonic-plates.json', 'w+', encoding='utf-8') as json_file:
    json.dump(json_data, json_file, ensure_ascii=False, separators=(',', ':'))
    json_file.close()

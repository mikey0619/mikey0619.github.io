import json
import os

directory = 'players'

# Define the updated field-to-node mapping
field_to_node = {
    " ": "TotalPoss",
    "Shot": ["FG2A", "FG3A"],  # Shot = FG2A + FG3A
    "Pass": ["Assists", "BadPassTurnovers", "BadPassOutOfBoundsTurnovers"], # Pass = Assists + BadPassTurnovers + BadPassOutOfBoundsTurnovers
    "Foul": ["Fouls", "Offensive Fouls"], # Foul = Fouls + Offensive Fouls
    "2P": "FG2A",
    "3P": "FG3A",
    "2P Make": "FG2M",
    "3P Make": "FG3M",
    "2P Miss": ["FG2A", "FG2M"],  # Miss = FG2A - FG2M
    "3P Miss": ["FG3A", "FG3M"],  # Miss = FG3A - FG3M
    "Assist": "Assists",
    "Turnover": ["BadPassTurnovers", "BadPassOutOfBoundsTurnovers"], # Turnover = BadPassTurnovers + BadPassOutOfBoundsTurnovers
    "Bad Pass (Steal)": "BadPassTurnovers",
    "Bad Pass (OB)": "BadPassOutOfBoundsTurnovers",
    "Shooting Foul": "ShootingFouls",
    "FT Make": "FtPoints",
    "FT Miss": ["FTA", "FtPoints"], # Miss = FTA - FtPoints
    "Dead Ball": ["Fouls", "ShootingFouls"], # Dead Ball = Fouls - ShootingFouls
    "TO": "Turnovers",
    "Offensive Foul": "Offensive Fouls",
    "Getting Fouled": "Fouls",
    "Charge": "Charge Fouls",
    "Loose Ball": ["Charge Fouls", "Offensive Fouls"], # Loose Ball = Offensive Fouls - Charge Fouls
}

for filename in os.listdir(directory):
    if filename.endswith(".json"):
        with open(f'{directory}/{filename}', 'r') as f:
            data = json.load(f)
            player_name = os.path.splitext(filename)[0]
            print(f"Loaded {filename} with {len(data)} fields")

            filepath = os.path.join(directory, filename)

            # Step 1: Load the two JSON files
            with open('dataset1.json', 'r') as f1, open(filepath, 'r') as f2:
                data1 = json.load(f1)  # The first JSON with nodes and links
                data2 = json.load(f2)  # The second JSON with stats and values

            # Step 2: Update the links in data1 with values from data2
            for link in data1['links']:

                source_node = data1['nodes'][link['source']]['name']
                target_node = data1['nodes'][link['target']]['name']
                
                # Initialize values for source and target
                source_value = 0
                target_value = 0

                # Find the corresponding data from data2 using the mapping
                if source_node in field_to_node:
                    if isinstance(field_to_node[source_node], list):
                        # If the mapping is a list (like Shot, Make, Miss), sum the values
                        source_value = sum([data2.get(field, 0) for field in field_to_node[source_node]])
                    else:
                        # Otherwise, fetch the value directly
                        source_value = data2.get(field_to_node[source_node], 0)
                
                if target_node in field_to_node:
                    if isinstance(field_to_node[target_node], list):
                        # If the mapping is a list (like Shot, Make, Miss), sum the values
                        target_value = sum([data2.get(field, 0) for field in field_to_node[target_node]])
                    else:
                        # Otherwise, fetch the value directly
                        target_value = data2.get(field_to_node[target_node], 0)

                    # For "Miss", apply the custom logic (FG2A - FG2M + FG3A - FG3M)
                    if source_node == "3P Miss":
                        source_value = (data2.get("FG3A", 0) - data2.get("FG3M", 0))
                    if target_node == "3P Miss":
                        target_value = (data2.get("FG3A", 0) - data2.get("FG3M", 0))

                    # For "Shot" and "Make", adjust the values
                    if source_node == "Shot":
                        source_value = data2.get("FG2A", 0) + data2.get("FG3A", 0)
                    if target_node == "Shot":
                        target_value = data2.get("FG2A", 0) + data2.get("FG3A", 0)

                    if source_node == "2P Miss":
                        source_value = data2.get("FG2A", 0) - data2.get("FG2M", 0)
                    if target_node == "2P Miss":
                        target_value = data2.get("FG2A", 0) - data2.get("FG2M", 0)

                    if source_node == "FT Miss":
                        source_value = data2.get("FTA", 0) - data2.get("FtPoints", 0)
                    if target_node == "FT Miss":
                        target_value = data2.get("FTA", 0) - data2.get("FtPoints", 0)

                    if source_node == "Dead Ball":
                        source_value = data2.get("Fouls", 0) - data2.get("ShootingFouls", 0)
                    if target_node == "Dead Ball":
                        target_value = data2.get("Fouls", 0) - data2.get("ShootingFouls", 0)

                    if source_node == "Loose Ball":
                        source_value = data2.get("Offensive Fouls", 0) - data2.get("Charge Fouls", 0)
                    if target_node == "Loose Ball":
                        target_value = data2.get("Offensive Fouls", 0) - data2.get("Charge Fouls", 0)

                    if source_node == "Turnover":
                        source_value = data2.get("BadPassTurnovers", 0) + data2.get("BadPassOutOfBoundsTurnovers", 0)
                    if target_node == "Turnover":
                        target_value = data2.get("BadPassTurnovers", 0) + data2.get("BadPassOutOfBoundsTurnovers", 0)

                    if source_node == "Foul":
                        source_value = data2.get("Fouls", 0) + data2.get("Offensive Fouls", 0)
                    if target_node == "Foul":
                        target_value = data2.get("Fouls", 0) + data2.get("Offensive Fouls", 0)


                # Link value is set based on minimum of source and target values
                link['value'] = min(source_value, target_value)  # Adjust logic as needed

            # Step 4: Save the updated data to a new file
            newfile = f"{player_name}_updated.json"
            with open(newfile, 'w') as f:
                json.dump(data1, f, indent=4)

            print("Updated JSON written to file:", newfile)

import requests
import json

# API endpoint
url = "https://api.pbpstats.com/get-all-season-stats/nba"

# API parameters (change EntityId to get different players)
params = {
    "EntityType": "Player",
    "EntityId": "201142"  # Change this to the player's ID you want
}

# Make the API request
response = requests.get(url, params=params)

# Check if the request was successful
if response.status_code == 200:
    try:
        response_json = response.json()

        # Extract player's name for the filename
        player_name = response_json.get("header", "Unknown_Player").replace(" ", "_")

        # Extract the "RegularSeason" data
        regular_season_data = response_json.get("results", {}).get("Regular Season", [])

        # Filter for only the 2023-24 season
        season_2023_24 = next((season for season in regular_season_data if season["Season"] == "2023-24"), None)

        if season_2023_24:
            # Save the filtered data to a JSON file
            file_path = f"{player_name}.json"
            with open(file_path, "w") as json_file:
                json.dump(season_2023_24, json_file, indent=4)
            
            print(f"JSON file saved successfully as {file_path}")
        else:
            print("No regular season data found for 2023-24.")
    except requests.exceptions.JSONDecodeError as e:
        print(f"Failed to decode JSON: {e}")
else:
    print(f"Request failed with status code {response.status_code}")

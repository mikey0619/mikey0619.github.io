import json
import sys

def merge_datasets(file1, file2, output_file):
    print("Loading datasets...")  # Debugging line
    # Load datasets
    try:
        with open(file1, 'r') as f:
            data1 = json.load(f)
        with open(file2, 'r') as f:
            data2 = json.load(f)
    except Exception as e:
        print(f"Error loading files: {e}")
        return
    
    # Preserve node order while ensuring uniqueness
    node_index = {}
    nodes = []

    # Add nodes from data1 (preserving order)
    for node in data1["nodes"]:
        if node["name"] not in node_index:
            node_index[node["name"]] = len(nodes)
            nodes.append(node)

    # Add nodes from data2 (preserving order)
    for node in data2["nodes"]:
        if node["name"] not in node_index:
            node_index[node["name"]] = len(nodes)
            nodes.append(node)

    # Create separate links for each dataset
    links = []
    
    # Process links from LeBron's dataset (Red)
    for link in data1["links"]:
        source = node_index[data1["nodes"][link["source"]]["name"]]
        target = node_index[data1["nodes"][link["target"]]["name"]]
        links.append({"source": source, "target": target, "value": link["value"], "color": "#FF0000"})  # Red for LeBron

    # Process links from Jokic's dataset (Blue)
    for link in data2["links"]:
        source = node_index[data2["nodes"][link["source"]]["name"]]
        target = node_index[data2["nodes"][link["target"]]["name"]]
        links.append({"source": source, "target": target, "value": link["value"], "color": "#0000FF"})  # Blue for Jokic

    # Save merged dataset
    merged_data = {"nodes": nodes, "links": links}
    try:
        with open(output_file, 'w') as f:
            json.dump(merged_data, f, indent=4)
        print(f"Merged dataset saved to {output_file}")
    except Exception as e:
        print(f"Error saving the merged file: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python merge_datasets.py <file1> <file2> <output_file>")
    else:
        merge_datasets(sys.argv[1], sys.argv[2], sys.argv[3])

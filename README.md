**Final Visualization Project**

**Summary**

Our final project was a data visualization of NBA MVP statistics from the 2023-2024 season. The visualization contains basic statistics such as shot results, pass results, fouls, and turnovers.

**Libraries**

The only library we utilized for this project was d3. We implemented the rest on our own.

**Important Links**

Data - [https://www.pbpstats.com](https://www.pbpstats.com)

Screencast - [https://youtu.be/sgERB6i5zaI](https://youtu.be/sgERB6i5zaI)

Host Site - [https://mikey0619.github.io](https://mikey0619.github.io)

^ the data, screencast, process book, and summary can be accessed from the host site by clicking on the underlined title on the top of the screen

**Data Scraping (implemented in getPlayer.py)**

1. Download raw .json file from pbpstats.com based on player ID.
2. Design a format .json file to provide a template for the player data (dataset1.json).
3. Combine the raw player .json file with the template to achieve a properly formatted player data file (combineDatasets.py)

**Visualization Features**

Sankey Diagram - Our visualization utilizes two Sankey diagrams back to back to display a contrast between the two players selected.

Player Selection - Player selection is done by clicking on a player image to load their visualization, depending on what side of the screen was selected. Additionally, when hovered over, the player image enlargens, and when selected, a gold border is present to indicate that the selection occurred.

Interactive Visualization - The actual diagrams themselves contain logic so that when a link is hovered over, it will darken and the rest of the graph will lighten. In addition, the corresponding link on the other graph will highlight to better display a comparison. The statistic that is being compared will appear in a bubble, showing the two values of said statistic.


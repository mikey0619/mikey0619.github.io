const margin = { top: 20, right: 50, bottom: 20, left: 50 };  
const width = 1200 - margin.left - margin.right;  
const height = 800 - margin.top - margin.bottom;  

const svg = d3.select(".visualization-container")
    .append("svg")
    .attr("width", 10000) // Keep the original width
    .attr("height", height)
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet") // Keeps it centered and maintains aspect ratio
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


const datasetMapping = {
    "LeBron James": "LeBron_James_updated",
    "Nikola Jokic": "Nikola_Jokic_updated",
    "Giannis Antetokounmpo": "Giannis_Antetokounmpo_updated",
    "Kevin Durant": "Kevin_Durant_updated",
    "Domantas Sabonis": "Domantas_Sabonis_updated",
    "Jalen Brunson": "Jalen_Brunson_updated",
    "Jayson Tatum": "Jayson_Tatum_updated",
    "Luka Doncic": "Luka_Doncic_updated",
    "Shai Gilgeous-Alexander": "Shai_Gilgeous-Alexander_updated",
    "Anthony Edwards": "Anthony_Edwards_updated"
};

// Function to draw two mirrored Sankey diagrams
// Create a tooltip div (add this in your HTML body)
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid black")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("visibility", "hidden")
    .style("font-size", "12px");

// Function to draw two mirrored Sankey diagrams
function drawDualSankey(data1, data2) {
    svg.selectAll("*").remove();  // Clear previous visualization

    const sankeyRight = d3.sankey()
        .nodeWidth(20)
        .nodePadding(10)
        .extent([[width / 2, 10], [width - 10, height - 10]]);  

    const sankeyLeft = d3.sankey()
        .nodeWidth(20)
        .nodePadding(10)
        .extent([[10, 10], [width / 2 - 10, height - 10]]);  

    const graphRight = sankeyRight({
        nodes: data1.nodes.map(d => ({ ...d })), 
        links: data1.links.map(d => ({ ...d }))
    });

    const graphLeft = sankeyLeft({
        nodes: data2.nodes.map(d => ({ ...d })), 
        links: data2.links.map(d => ({
            ...d,
            source: d.target,
            target: d.source
        }))
    });

    const leftGroup = svg.append("g");
    const rightGroup = svg.append("g");

    // Function to handle mouse hover effects for both groups
    function handleMouseOver(event, d) {
        // Highlight the corresponding link in the opposite group
        const correspondingLink = findCorrespondingLink(d, this);
        
        // Get the data of the corresponding link if it exists
        let correspondingData = null;
        if (correspondingLink) {
            correspondingData = d3.select(correspondingLink).datum();
        }
        
        // Reduce opacity of all links
        d3.selectAll(".link")
            .transition().duration(200)
            .style("opacity", 0.2);
            
        // Highlight the current link
        d3.select(this)
            .transition().duration(200)
            .style("opacity", 1)
            .style("stroke-width", d.width * 1.5);
            
        // Highlight the corresponding link if found
        if (correspondingLink) {
            d3.select(correspondingLink)
                .transition().duration(200)
                .style("opacity", 1)
                .style("stroke-width", correspondingData.width * 1.5);
        }
        
        // Determine which group the current link belongs to
        const currentGroup = d3.select(this).attr("stroke");
        const isLeftGroup = currentGroup === "green";
        
        // Show tooltip
        tooltip.style("visibility", "visible");
        
        // Set the tooltip content based on the group
        tooltip.html(`
            <strong>${isLeftGroup ? d.source.name : d.target.name}</strong><br>
            <strong>Selected:</strong><br>
            Value: ${d.value}<br><br>
            ${correspondingData ? 
                `<strong>Corresponding:</strong><br>
                Value: ${correspondingData.value}` : 
                ''}
        `);
        
        // Adjust tooltip position dynamically
        tooltip.style("top", `${event.pageY + 10}px`)
            .style("left", `${event.pageX + 10}px`)
            .style("z-index", 1000); // Set a high z-index to ensure it appears above other elements
    }

    // Function to handle mouse out for both groups
    function handleMouseOut(event, d) {
        // Reset opacity for all links
        d3.selectAll(".link")
            .transition().duration(200)
            .style("opacity", 0.7);

        // Reset the stroke width for the current link
        d3.select(this)
            .transition().duration(200)
            .style("stroke-width", d.width);

        // Hide the tooltip
        tooltip.style("visibility", "hidden");
    }


    // Find the corresponding link in the opposite group
    function findCorrespondingLink(d, element) {
        const sourceName = d.source.name;
        const targetName = d.target.name;
        
        // Determine which group the current link belongs to
        const currentGroup = d3.select(element).attr("stroke");
        const isLeftGroup = currentGroup === "green";
        
        // Define the selector for the opposite group
        const oppositeGroupSelector = isLeftGroup ? '[stroke="teal"]' : '[stroke="green"]';
        
        // Find all links in the opposite group
        const oppositeGroupLinks = d3.selectAll(`.link${oppositeGroupSelector}`);
        
        // Search for the matching link
        let matchingLink = null;
        oppositeGroupLinks.each(function(linkData) {
            if (isLeftGroup) {
                // If we're on a left link, find the right link where source=source and target=target
                if (linkData.source.name === targetName && linkData.target.name === sourceName) {
                    matchingLink = this;
                }
            } else {
                // If we're on a right link, find the left link where source=target and target=source
                if (linkData.source.name === targetName && linkData.target.name === sourceName) {
                    matchingLink = this;
                }
            }
        });
        
        return matchingLink;
    }

    // Draw left-side links
    leftGroup.append("g")
        .selectAll("path")
        .data(graphLeft.links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", "green")
        .attr("stroke-width", d => d.width)
        .attr("fill", "none")
        .attr("opacity", 0.7)
        .on("mouseover", handleMouseOver)  // Attach to left group links
        .on("mouseout", handleMouseOut);

    // Draw right-side links
    rightGroup.append("g")
        .selectAll("path")
        .data(graphRight.links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", "teal")
        .attr("stroke-width", d => d.width)
        .attr("fill", "none")
        .attr("opacity", 0.7)
        .on("mouseover", handleMouseOver)  // Attach to right group links
        .on("mouseout", handleMouseOut);



    // Draw left-side nodes
    leftGroup.append("g")
        .selectAll("rect")
        .data(graphLeft.nodes)
        .enter()
        .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "#e74c3c");  

    // Draw right-side nodes
    rightGroup.append("g")
        .selectAll("rect")
        .data(graphRight.nodes)
        .enter()
        .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "#3498db");  
    
    // Add labels for left-side nodes
    leftGroup.append("g")
        .selectAll("text")
        .data(graphLeft.nodes)
        .enter()
        .append("text")
        .attr("x", d => d.x1 + 10)  
        .attr("y", d => (d.y0 + d.y1) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text(d => d.name)
        .attr("font-size", "14px")
        .attr("fill", "#000");

    // Add labels for right-side nodes
    rightGroup.append("g")
        .selectAll("text")
        .data(graphRight.nodes)
        .enter()
        .append("text")
        .attr("x", d => d.x0 - 10)  
        .attr("y", d => (d.y0 + d.y1) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => d.name)
        .attr("font-size", "14px")
        .attr("fill", "#000");
}


// Function to load dataset and update Sankey diagram
function loadDataset(datasetName, slot) {
    const datasetFileName = datasetMapping[datasetName];

    if (!datasetFileName) {
        console.error("Dataset not found for:", datasetName);
        return;
    }

    const filePath = `datasets/${datasetFileName}.json`;
    console.log("Loading dataset from:", filePath);

    d3.json(filePath).then(data => {
        console.log("Dataset loaded:", data);
        
        if (slot === 1) {
            data2 = data;
        } else {
            data1 = data;
        }

        if (data1 && data2) {
            drawDualSankey(data1, data2);
        }
    }).catch(error => {
        console.error("Error loading dataset:", error);
    });
}

// Function to handle image selection
function selectPlayer(player, slot) {
    console.log(`Selected Player ${slot}:`, player);
    loadDataset(player, slot);

    // Determine the correct container class
    let containerClasses = slot === 1 
        ? [".left-container", ".left-container2"] 
        : [".right-container", ".right-container2"];

    // Remove selection from all images in both containers
    containerClasses.forEach(containerClass => {
        document.querySelectorAll(`${containerClass} .player img`).forEach(img => {
            img.style.border = "3px solid transparent";
        });
    });

    // Highlight selected player's image in both containers
    containerClasses.forEach(containerClass => {
        document.querySelectorAll(`${containerClass} .player`).forEach(p => {
            if (p.innerText.trim() === player) {
                p.querySelector("img").style.border = "3px solid gold";
            }
        });
    });
}



// Load initial datasets
loadDataset("LeBron James", 1);
loadDataset("Nikola Jokic", 2);

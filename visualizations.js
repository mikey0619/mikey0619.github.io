const generateTrialData = () => {
    let numPoints = Math.floor(Math.random() * 6) + 5;
    let data = Array.from({ length: numPoints }, () => Math.floor(Math.random() * 100) + 1);
    data.sort((a, b) => a - b);
    let markedIndices = [Math.floor(Math.random() * numPoints), Math.floor(Math.random() * numPoints)];
    while (markedIndices[0] === markedIndices[1]) {
        markedIndices[1] = Math.floor(Math.random() * numPoints);
    }
    return { data, markedIndices };
};

const drawBarChart = (data, markedIndices, svgId) => {
    const width = 400;
    const barHeight = 40;
    const margin = 30;
    const spacing = 10;
    const chartHeight = data.length * (barHeight + spacing);

    const svg = d3.select(svgId)
                  .attr("width", width)
                  .attr("height", chartHeight);

    svg.selectAll("*").remove();  

    const xScale = d3.scaleLinear()
                     .domain([0, d3.max(data) * 1.1])
                     .range([10, width - margin]);

    svg.selectAll("rect")
       .data(data)
       .enter()
       .append("rect")
       .attr("x", margin)
       .attr("y", (_, i) => i * (barHeight + spacing))
       .attr("width", d => xScale(d))
       .attr("height", barHeight)
       .attr("fill", "steelblue");

    svg.selectAll("circle")
       .data(markedIndices)
       .enter()
       .append("circle")
       .attr("cx", margin - 10)
       .attr("cy", d => (d * (barHeight + spacing)) + (barHeight / 2))
       .attr("r", 3)
       .attr("fill", "black");

};


//StackedBar
const drawStackedBarChart = (data, markedIndices, svgId) => {
    const width = 400;
    const margin = 20;
    const minSectionHeight = 10;

    const totalSum = d3.sum(data);
    const dynamicHeight = Math.max(300, data.length * minSectionHeight * 2); 
    const svg = d3.select(svgId)
                  .attr("width", width)
                  .attr("height", dynamicHeight);

    svg.selectAll("*").remove();

    const yScale = d3.scaleLinear()
                     .domain([0, totalSum])
                     .range([dynamicHeight, 0]);

    let stackStart = 0;
    let stackPositions = [];
    svg.selectAll("rect")
       .data(data)
       .enter()
       .append("rect")
       .attr("x", margin)
       .attr("y", d => {
           let y = yScale(stackStart + d);
           let sectionHeight = Math.max(minSectionHeight, yScale(stackStart) - yScale(stackStart + d));
           stackPositions.push(y + sectionHeight / 2);
           stackStart += d;
           return y;
       })
       .attr("width", 100)
       .attr("height", d => Math.max(minSectionHeight, yScale(stackStart - d) - yScale(stackStart))) 
       .attr("fill", "steelblue")
       .attr("stroke", "white")
       .attr("stroke-width", 1);

    svg.selectAll("circle")
       .data(markedIndices)
       .enter()
       .append("circle")
       .attr("cx", margin - 10)
       .attr("cy", d => stackPositions[d])
       .attr("r", 3)
       .attr("fill", "black");
};


const drawPieChart = (data, markedIndices, svgId) => {
    const width = 300, height = 300, radius = Math.min(width, height) / 2;
    
    const svg = d3.select(svgId)
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie()
                  .sort(null)
                  .value(d => Math.max(d, 5)); 

    const arc = d3.arc()
                  .innerRadius(0)
                  .outerRadius(radius);

    svg.selectAll("path")
       .data(pie(data))
       .enter()
       .append("path")
       .attr("d", arc)
       .attr("fill", "steelblue")
       .attr("stroke", "white")
       .attr("stroke-width", 2);

    svg.selectAll("circle")
       .data(markedIndices)
       .enter()
       .append("circle")
       .attr("transform", d => `translate(${arc.centroid(pie(data)[d])[0] * 1.3}, ${arc.centroid(pie(data)[d])[1] * 1.3})`)
       .attr("r", 3)
       .attr("fill", "black");
};

let trials = [];
let currentTrial = 0;
let results = [];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start-button").addEventListener("click", startExperiment);
    document.getElementById("submit-button").addEventListener("click", submitResponse);
    document.getElementById("download-button").addEventListener("click", downloadResults);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("submit-button").click();
        }
        });
});


function startExperiment() {
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("experiment-screen").style.display = "block";
    
    generateTrials();
    runTrial();
}

function updateProgressBar() {
    let progressPercentage = ((currentTrial + 1) / trials.length) * 100;
    document.getElementById("progress-bar").style.width = progressPercentage + "%";
}

function generateTrials() {
    const visualizationTypes = ["bar", "pie", "stacked"];
    for (let i = 0; i < 20; i++) {
        visualizationTypes.forEach(type => {
            let { data, markedIndices } = generateTrialData();
            trials.push({ type, data, markedIndices });
        });
    }
    trials = shuffleArray(trials);
}

function runTrial() {
    if (currentTrial >= trials.length) {
        endExperiment();
        return;
    }

    document.getElementById("trial-count").innerText = `Trial: ${currentTrial + 1} / ${trials.length}`;

    updateProgressBar();
    
    const { type, data, markedIndices } = trials[currentTrial];

    d3.select("#chart").selectAll("*").remove();

    if (type === "bar") drawBarChart(data, markedIndices, "#chart");
    else if (type === "pie") drawPieChart(data, markedIndices, "#chart");
    else if (type === "stacked") drawStackedBarChart(data, markedIndices, "#chart");
}


function calculateTruePercentage(data, markedIndices) {
    let value1 = data[markedIndices[0]];
    let value2 = data[markedIndices[1]];
    let smaller = Math.min(value1, value2);
    let larger = Math.max(value1, value2);

    if (larger === 0) return 0;

    let truePercentage = (smaller / larger) * 100;
    let roundedTruePercentage = Math.round(truePercentage);
    return roundedTruePercentage;
}

function submitResponse() {
    let response = parseFloat(document.getElementById("response").value);
    if (isNaN(response)) {
        alert("Please enter a valid number.");
        return;
    }

    let { data, markedIndices } = trials[currentTrial];
    let truePercentage = calculateTruePercentage(data, markedIndices);
    let error = calculateError(truePercentage, response); 
    results.push({ trial: currentTrial + 1, visualization: trials[currentTrial].type, truePercentage, response, error });

    currentTrial++;
    document.getElementById("response").value = "";
    runTrial();
}

function endExperiment() {
    document.getElementById("experiment-screen").style.display = "none";
    document.getElementById("thank-you-screen").style.display = "block";
}

function downloadResults() {
    let csvContent = "Trial,Visualization,TruePercentage,Response,Log2Error\n";
    results.forEach(row => {
        csvContent += `${row.trial},${row.visualization},${row.truePercentage},${row.response},${row.error}\n`;
    });

    let blob = new Blob([csvContent], { type: "text/csv" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "experiment_results.csv";
    a.click();
}

function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}
//calculate error
function calculateError(truePercentage, reportedPercentage) {
    let error = Math.abs(reportedPercentage - truePercentage);
    return Math.log2((error)+ 1/ 8);
}

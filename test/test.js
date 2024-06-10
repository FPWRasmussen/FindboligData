// const githubUsername = 'FPWRasmussen';
// const repositoryName = 'FindboligData';
// const csvFilePath = 'city_data.csv';


// $.ajax({
//     url: `https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/master/${csvFilePath}`,
//     success: function(csv) {
//         const output = Papa.parse(csv, {
//             header: true, // Convert rows to Objects using headers as properties
//         });
//         if (output.data) {
//             // Filter out empty rows
//             filteredData = output.data.filter(row => {
//                 return Object.values(row).some(value => value.trim() !== "");
//             });
//             console.log(filteredData);
//             renderTable(filteredData);
//             createScatterPlot(filteredData)

//         } else {
//             console.log(output.errors);
//         }
//     },
//     error: function(jqXHR, textStatus, errorThrown) {
//         console.log(textStatus);
//     }




// });


function renderTable(data) {
    // Infer columns from data
    const columns = Object.keys(data[0]).map(key => ({ title: key, data: key }));
    // Clear any existing table content
    $('#dataTable').empty();
    // Initialize DataTables
    $('#dataTable').DataTable({
        data: data,
        columns: columns,
        destroy: true,
        searching: true,
        paging: true,
        info: true,
        ordering: true
    });
}

// function createScatterPlot(data) {

//     const xAxisSelector = document.getElementById('x-axis');
//     const yAxisSelector = document.getElementById('y-axis');
    
//     const xColumn = xAxisSelector.value;
//     const yColumn = yAxisSelector.value;

//     const xValues = data.map(row => parseFloat(row[xColumn]));
//     const yValues = data.map(row => parseFloat(row[yColumn]));

//     const axisOptions = {
//         avgTemp: { data: c => c.avgTemp, label: 'Average Temperature (°C)' },
//         population: { data: c => c.population, label: 'Population' },
//         lat: { data: c => c.lat, label: 'Latitude' },
//         long: { data: c => c.long, label: 'Longitude' },
//         elevation: { data: c => c.elevation, label: 'Elevation (m)' },
//         air_pressure: { data: c => c.air_pressure, label: 'Air Pressure (hPa)' }
//     };

//   const trace = {
//     x: xValues,
//     y: yValues,
//     mode: 'markers',
//     type: 'scatter',
//     marker: {
//       size: 10,
//       color: 'rgba(75, 192, 192, 0.7)', // Adjust color and opacity as needed
//     }
//   };

//   const layout = {
//     title: 'Scatter Plot',
//     xaxis: { title: 'X-axis Label' },
//     yaxis: { title: 'Y-axis Label' }
//   };

//   const plotData = [trace];

//   // Create the plot in a div with id 'scatter-plot'
//   Plotly.newPlot('scatter-plot', plotData, layout);
// }


// document.getElementById('x-axis').addEventListener('change', createScatterPlot);
// document.getElementById('y-axis').addEventListener('change', createScatterPlot);

const githubUsername = 'FPWRasmussen';
const repositoryName = 'FindboligData';
const csvFilePath = 'city_data.csv';

let csvData = []; // Global variable to store the CSV data

// Function to fetch CSV data
function fetchCSVData() {
  $.ajax({
    url: `https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/master/${csvFilePath}`,
    success: function(csv) {
      const output = Papa.parse(csv, {
        header: true, // Convert rows to Objects using headers as properties
      });

      if (output.data) {
        // Filter out empty rows
        csvData = output.data.filter(row => {
          return Object.values(row).some(value => value.trim() !== "");
        });

        console.log(csvData);
        renderTable(csvData);
        updatePlot(); // Initial plot
      } else {
        console.log(output.errors);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus);
    }
  });
}

// Function to update the plot
function updatePlot() {
  const xAxisSelector = document.getElementById('x-axis');
  const yAxisSelector = document.getElementById('y-axis');
  
  const xColumn = xAxisSelector.value;
  const yColumn = yAxisSelector.value;

  createScatterPlot(csvData, xColumn, yColumn);
}

function createScatterPlot(data, xColumn, yColumn) {
  // Parse values to numbers (assuming all are numeric)
  const xValues = data.map(row => parseFloat(row[xColumn]));
  const yValues = data.map(row => parseFloat(row[yColumn]));

  const trace = {
    x: xValues,
    y: yValues,
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: 10,
      color: 'rgba(75, 192, 192, 0.7)', // Adjust color and opacity as needed
    },
    text: data.map(row => `City: ${row.city}<br>${xColumn}: ${row[xColumn]}<br>${yColumn}: ${row[yColumn]}`),
    hoverinfo: 'text'
  };

  const layout = {
    title: `${getColumnLabel(yColumn)} vs. ${getColumnLabel(xColumn)}`,
    xaxis: { 
      title: getColumnLabel(xColumn),
      type: xColumn === 'lat' || xColumn === 'long' ? 'linear' : 'auto'
    },
    yaxis: { 
      title: getColumnLabel(yColumn),
      type: 'auto'
    }
  };

  const plotData = [trace];

  // Create the plot in a div with id 'scatter-plot'
  Plotly.newPlot('scatter-plot', plotData, layout);
}

// Helper function to get readable labels for columns
function getColumnLabel(column) {
  const labels = {
    'avgTemp': 'Average Temperature (°C)',
    'population': 'Population',
    'elevation': 'Elevation (m)',
    'lat': 'Latitude',
    'long': 'Longitude',
    'air_pressure': 'Air Pressure (hPa)'
  };
  return labels[column] || column;
}

// Event listeners for dropdown changes
document.getElementById('x-axis').addEventListener('change', updatePlot);
document.getElementById('y-axis').addEventListener('change', updatePlot);

// Fetch CSV data when the page loads
fetchCSVData();
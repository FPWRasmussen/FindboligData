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
        updateScatterPlot(); // Initial plot
        update3DPlot()
      } else {
        console.log(output.errors);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus);
    }
  });
}


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
        scrollX: true,
        paging: true,
        info: true,
        ordering: true
    });
}


// Function to update the plot
function updateScatterPlot() {

  const xColumn = document.getElementById('x-axis').value;
  const yColumn = document.getElementById('y-axis').value;
  const colorColumn = document.getElementById('color-attr').value;
  const sizeColumn = document.getElementById('size-attr').value;

  createScatterPlot(csvData, xColumn, yColumn, colorColumn, sizeColumn);
}

function createScatterPlot(data, xColumn, yColumn, colorColumn, sizeColumn) {
  // Parse values to numbers (assuming all are numeric)
  const xValues = data.map(row => parseFloat(row[xColumn]));
  const yValues = data.map(row => parseFloat(row[yColumn]));
  const colorValues = data.map(row => parseFloat(row[colorColumn]));
  const sizeValues = data.map(row => parseFloat(row[sizeColumn]));

  const maxSizeValue = Math.max(...sizeValues);


  const trace = {
    x: xValues,
    y: yValues,
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: data.map(row => parseFloat(row[sizeColumn]) / maxSizeValue * 200),
      sizemode: 'area',
      sizeref: 1,
      opacity: 0.7,
      color: colorValues,
      colorscale: 'Viridis',
      colorbar: {title : getColumnLabel(colorColumn)},
      line: { color: 'black', width: 1 }


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
      title: yColumn,
      type: 'auto'
    }
  };

  // Create the plot in a div with id 'scatter-plot'
  Plotly.newPlot('scatter-plot', [trace], layout);
}


function update3DPlot() {
    const categoryColumn = document.getElementById('3d-category').value;
    const colorColumn = document.getElementById('3d-color-attr').value;
    const sizeColumn = document.getElementById('3d-size-attr').value;

    create3DPlot(csvData, categoryColumn, colorColumn, sizeColumn)
}
function create3DPlot(data, categoryColumn, colorColumn, sizeColumn){

    const filteredData = data.filter(c => c.category === categoryColumn);
    const colorValues = filteredData.map(row => parseFloat(row[colorColumn]));
    const sizeValues = filteredData.map(row => parseFloat(row[sizeColumn]));
  
    const maxSizeValue = Math.max(...sizeValues);


    const trace = {
        x: filteredData.map(c => c.latitude),
        y: filteredData.map(c => c.longitude),
        z: filteredData.map(c => c.elevation),
        mode: 'markers',
        type: 'scatter3d',
        text: filteredData.map(c => `${c.city}, ${c.country}`),
        marker: {
            size: filteredData.map(row => parseFloat(row[sizeColumn]) / maxSizeValue * 200),
            sizemode: 'area',
            sizeref: 1,
            color: colorValues,
            colorscale: 'Viridis',
            colorbar: {title : getColumnLabel(colorColumn)},
            line: { color: 'black', width: 1 }
        }
    };

    const layout = {
        scene: {
            xaxis: { title: 'Latitude' },
            yaxis: { title: 'Longitude' },
            zaxis: { title: 'Elevation (m)' }
        },
        title: `${categoryColumn} <br><sub>Size:  | Color: </sub>`,

    };

    Plotly.newPlot('3d-plot', [trace], layout);
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
document.getElementById('x-axis').addEventListener('change', updateScatterPlot);
document.getElementById('y-axis').addEventListener('change', updateScatterPlot);
document.getElementById('size-attr').addEventListener('change', updateScatterPlot);
document.getElementById('color-attr').addEventListener('change', updateScatterPlot);
document.getElementById('3d-category').addEventListener('change', update3DPlot);
document.getElementById('3d-color-attr').addEventListener('change', update3DPlot);
document.getElementById('3d-size-attr').addEventListener('change', update3DPlot);

// Fetch CSV data when the page loads
fetchCSVData();
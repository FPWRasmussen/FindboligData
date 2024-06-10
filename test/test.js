const githubUsername = 'FPWRasmussen';
const repositoryName = 'Gantt-Chart';
const csvFilePath = 'gantt.csv';

$.ajax({
    url: `https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/master/${csvFilePath}`,
    success: function(csv) {
        const output = Papa.parse(csv, {
            header: true, // Convert rows to Objects using headers as properties
        });
        if (output.data) {
            // Filter out empty rows
            filteredData = output.data.filter(row => {
                return Object.values(row).some(value => value.trim() !== "");
            });
            console.log(filteredData);
            renderTable(filteredData);
            createScatterPlot(filteredData)



        } else {
            console.log(output.errors);
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
    }
});


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

function createScatterPlot(data) {

    const axisOptions = {
        avgTemp: { data: c => c.avgTemp, label: 'Average Temperature (°C)' },
        population: { data: c => c.population, label: 'Population' },
        lat: { data: c => c.lat, label: 'Latitude' },
        long: { data: c => c.long, label: 'Longitude' },
        elevation: { data: c => c.elevation, label: 'Elevation (m)' },
        air_pressure: { data: c => c.air_pressure, label: 'Air Pressure (hPa)' }
    };


  // Assuming your CSV has columns 'x' and 'y' for x and y coordinates
  const xAxis = document.getElementById('x-axis').value;

  const xValues = data.map(row => row.Completion);
  
  const yValues = data.map(row => row.Completion);

  const trace = {
    x: xValues,
    y: yValues,
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: 10,
      color: 'rgba(75, 192, 192, 0.7)', // Adjust color and opacity as needed
    }
  };

  const layout = {
    title: 'Scatter Plot',
    xaxis: { title: 'X-axis Label' },
    yaxis: { title: 'Y-axis Label' }
  };

  const plotData = [trace];

  // Create the plot in a div with id 'scatter-plot'
  Plotly.newPlot('scatter-plot', plotData, layout);
}

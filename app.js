document.addEventListener('DOMContentLoaded', () => {

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
                const filteredData = output.data.filter(row => {
                    return Object.values(row).some(value => value.trim() !== "");
                });
                
                const columns = Object.keys(data[0]).map(key => ({ title: key, data: key }));
                const rows = data.trim().split('\n').map(row => row.trim().split(','));
                const headers = rows.shift();


                console.log(filteredData);
                renderTable(filteredData);
            } else {
                console.log(output.errors);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        }
    }); 


function renderTable(data) {
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


    const columns = Object.keys(data[0]).map(key => ({ title: key, data: key }));
    const rows = data.trim().split('\n').map(row => row.trim().split(','));
    const headers = rows.shift();

    const cities = rows.map(row => ({
        city: row[0],
        country: row[1],
        population: +row[2],
        avgTemp: +row[3],
        lat: +row[4],
        long: +row[5],
        category: row[6],
        elevation: +row[7],
        air_pressure: +row[8]
    }));

    const axisOptions = {
        avgTemp: { data: c => c.avgTemp, label: 'Average Temperature (°C)' },
        population: { data: c => c.population, label: 'Population' },
        lat: { data: c => c.lat, label: 'Latitude' },
        long: { data: c => c.long, label: 'Longitude' },
        elevation: { data: c => c.elevation, label: 'Elevation (m)' },
        air_pressure: { data: c => c.air_pressure, label: 'Air Pressure (hPa)' }
    };

    function updateScatterPlot() {
        const xAxis = document.getElementById('x-axis').value;
        const yAxis = document.getElementById('y-axis').value;
        const sizeAttr = document.getElementById('size-attr').value;
        const colorAttr = document.getElementById('color-attr').value;
    
        const maxSizeValue = Math.max(...cities.map(axisOptions[sizeAttr].data));
    
        const trace = {
            x: cities.map(axisOptions[xAxis].data),
            y: cities.map(axisOptions[yAxis].data),
            mode: 'markers',
            type: 'scatter',
            text: cities.map(c => `${c.city}, ${c.country}<br>Population: ${c.population.toLocaleString()}`),
            marker: {
                size: cities.map(c => axisOptions[sizeAttr].data(c) / maxSizeValue * 50),
                sizemode: 'area',
                sizeref: 1,
                opacity: 0.7,
                color: cities.map(axisOptions[colorAttr].data),
                colorscale: 'Viridis',
                colorbar: {title: axisOptions[colorAttr].label},
                line: { color: 'black', width: 1 }
            }
        };
    
        const layout = {
            title: `${axisOptions[yAxis].label} vs ${axisOptions[xAxis].label}<br><sub>Bubble size: ${axisOptions[sizeAttr].label} | Color: ${axisOptions[colorAttr].label}</sub>`,
            xaxis: { title: axisOptions[xAxis].label },
            yaxis: { title: axisOptions[yAxis].label },
            hovermode: 'closest'
        };
    
        Plotly.newPlot('scatter-plot', [trace], layout);
    }

    function update3DPlot() {
        const category = document.getElementById('3d-category').value;
        const colorAttr = document.getElementById('3d-color-attr').value;
        const sizeAttr = document.getElementById('3d-size-attr').value;
        const filteredCities = cities.filter(c => c.category === category);

        const maxSizeValue = Math.max(...filteredCities.map(axisOptions[sizeAttr].data));

        const trace = {
            x: filteredCities.map(c => c.lat),
            y: filteredCities.map(c => c.long),
            z: filteredCities.map(c => c.elevation),
            mode: 'markers',
            type: 'scatter3d',
            text: filteredCities.map(c => `${c.city}, ${c.country}`),
            marker: {
                size: cities.map(c => axisOptions[sizeAttr].data(c) / maxSizeValue * 1000),
                sizemode: 'area',
                sizeref: 1,
                color: filteredCities.map(axisOptions[colorAttr].data),
                colorscale: 'Viridis',
                colorbar: {title: axisOptions[colorAttr].label}
            }
        };

        const layout = {
            scene: {
                xaxis: { title: 'Latitude' },
                yaxis: { title: 'Longitude' },
                zaxis: { title: 'Elevation (m)' }
            },
            title: `${category} <br><sub>Size: ${axisOptions[sizeAttr].label} | Color: ${axisOptions[colorAttr].label}</sub>`,

        };

        Plotly.newPlot('3d-plot', [trace], layout);
    }

   // Initialize map
    const map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    const markers = {};

    function updateMap() {
    const selectedCategories = ['A', 'B', 'C'].filter(cat => 
        document.getElementById(`map-cat-${cat.toLowerCase()}`).checked
    );

    const maxPopulation = Math.max(...cities.map(c => c.population));

    cities.forEach(city => {
        const markerId = `${city.lat}-${city.long}`;
        if (selectedCategories.includes(city.category)) {
            if (!markers[markerId]) {
                const radius = Math.sqrt(city.population / maxPopulation) * 30;
                markers[markerId] = L.circleMarker([city.lat, city.long], {
                    radius: radius,
                    fillColor: `hsl(${city.avgTemp * 3}, 70%, 50%)`,
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map).bindPopup(`
                    <b>${city.city}, ${city.country}</b><br>
                    Population: ${city.population.toLocaleString()}<br>
                    Avg. Temp: ${city.avgTemp}°C<br>
                    Elevation: ${city.elevation}m<br>
                    Air Pressure: ${city.air_pressure} hPa
                `);
            }
        } else if (markers[markerId]) {
            map.removeLayer(markers[markerId]);
            delete markers[markerId];
        }
    });
}
document.getElementById('x-axis').addEventListener('change', updateScatterPlot);
document.getElementById('y-axis').addEventListener('change', updateScatterPlot);
document.getElementById('color-attr').addEventListener('change', updateScatterPlot);
document.getElementById('size-attr').addEventListener('change', updateScatterPlot);
document.getElementById('3d-category').addEventListener('change', update3DPlot);
document.getElementById('3d-color-attr').addEventListener('change', update3DPlot);
document.getElementById('3d-size-attr').addEventListener('change', update3DPlot);
document.getElementById('map-cat-a').addEventListener('change', updateMap);
document.getElementById('map-cat-b').addEventListener('change', updateMap);
document.getElementById('map-cat-c').addEventListener('change', updateMap);
document.getElementById('fileInput').addEventListener('change', updateScatterPlot);
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        Papa.parse(file, {
            complete: function(results) {
                const data = results.data;
                // console.log(data)
                renderTable(data);            },
            header: true
        });
    }
});

updateScatterPlot();
update3DPlot();
updateMap();

});
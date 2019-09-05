/* eslint-disable no-unused-vars */
/**
 * Programming for Online Assignment
 *
 * Author: #######
 * Student ID: #####
 * Class: #####
 *
 * Teacher: #######
 * (Names blank for privacy)
 *
 * Credits:
 * Chart.js - Used for the graph and looks of the graph
 * https://www.chartjs.org/
 */

/**
 * Gets the Airport information from the Airports API
 * First it makes a counter to properly add location values (The counter starts at 1 as the first value (0) in the API data can be skipped)
 * Then it assigns the value of the Key and Title of the airports to a variable so it can be used later on
 * It later on calls upon the next API for the actual data
 *
 * @param {object} airportsNL Stores the airports from the array according to their Key as well as a made up code from my part
 * @param {object} location Looks up the array from the API and gets their key and title and stores it within
 */
function getAirports(airportsNL) {
	// Airports
	$.ajax({
		method: 'GET',
		url: 'https://opendata.cbs.nl/ODataApi/odata/37478eng/Airports',
		success: function(location) {
			/**
             * Start by making a counter so I can add the proper location value
             * This counter starts at 1 because the first value is not needed in my case since it mentions all of Airport names
             */
			let i = 1;
			$.each(airportsNL, function(key) {
				// This sets the current filter property to the Airports data
				airportsNL[key] = location.value[i];
				i++;
			});

			// After getting the Airports successfuly it proceeds onto geting the actual list of Data
			getData(airportsNL);
		},
		// If it is unable to get the Airports from the API an error handler will display that it could not get Airports information
		error: function(giveError) {
			$('body').addClass('error');
			$('.error-msg').text('Something went wrong with obtaining Airport information, please refresh.');
		},
	});
}

/**
 * Gets the actual Data from the API
 * Firstly it filters through the Airports provided by the Key we obtained
 * And searches within a spesfifc year type (JJ00)
 * Which then returns it to airport data
 *
 * @param {object} airportsNL.data Now holds the actual data for each airport depending on the Key
 */
function getData(airportsNL) {
	// Data
	$.ajax({
		method: 'GET',
		url:'http://opendata.cbs.nl/ODataApi/odata/37478eng/TypedDataSet',
		success: function(data) {
			/**
             * Loops through the filters object with the provided Keys
             */
			$.each(airportsNL, function(key) {
				// It then sets the current filter property to the airports data
				airportsNL[key].data = data.value.filter(function(res) {
					return res.Airports === airportsNL[key].Key && res.Periods.indexOf('JJ00') > -1;
				});
			});

			// I made a seprate function to sort the data so I can easily use it at update/removing data from my graphs
			sortAirportsData(airportsNL);

			// After all those informations are acquired I then proceed to disable the loading screen and show the webpage
			showPage();
		},
		// If it is unable to get the actual Data from the API an error handler will display that it could not get Airports Data information
		error: function(giveError) {
			$('body').addClass('error');
			$('.error-msg').text('Something went wrong with obtaining Airport Data information, please refresh.');
		},
	});
}

/**
 * This function easily sorts all the data into their categories that is needed for ChartJS
 * Doing so I can make use of one canvas in my HTML and easily use it in the graphs
 * It gets the current Key for each airport and sorts accordingly pushing the relevant data onto the empty arrays.
 *
 * @param {Array} airportsData Holds the actual data from the API
 */
function sortAirportsData(airportsData) {
	$.each(airportsData, function(key) {
		$.each(airportsData[key].data, function(i, item) {
			if(!airportsData[key].graphsData) {
				/**
                 * Here we initiate the graphsData and store the needed parts for a chart in there
                 * This layout is required for ChartJS
                 */
				airportsData[key].graphsData = {
					years: [],
					flights: {
						total: [],
						cc: [],
					},
					passenger: {
						total: [],
						arrival: [],
						departue: [],
					},
					inter: {
						total: [],
						africa: [],
						america: [],
						asia: [],
					},
					cargo: {
						total: [],
						europe: [],
						inter: [],
					},
				};
			}

			airportsData[key].graphsData.years.push(item.Periods.substr(0, 4));
			airportsData[key].graphsData.flights.total.push(item.TotalFlights_3);
			airportsData[key].graphsData.flights.cc.push(item.CrossCountryFlights_1);

			airportsData[key].graphsData.passenger.total.push(item.TotalPassengers_12);
			airportsData[key].graphsData.passenger.arrival.push(item.TotalArrivalsPassengers_15);
			airportsData[key].graphsData.passenger.departue.push(item.TotalDeparturesPassengers_18);

			airportsData[key].graphsData.inter.total.push(item.TotalIntercontinentalPassengers_25);
			airportsData[key].graphsData.inter.africa.push(item.Africa_26);
			airportsData[key].graphsData.inter.america.push(item.America_32);
			airportsData[key].graphsData.inter.asia.push(item.Asia_36);

			airportsData[key].graphsData.cargo.total.push(item.TotalCargo_43);
			airportsData[key].graphsData.cargo.europe.push(item.EuropeTotalCargo_53);
			airportsData[key].graphsData.cargo.inter.push(item.TotalIntercontinentalCargo_56);
		});

		// After pushing it onto the graphData we do not need the actual Data anymore therefore we delete them
		delete airportsData[key].data;

		// Here we set the graph data to display them on the charts
		setGraphicData(airportsData[key]);
	});
}

/**
 * This function layout is required by ChartJS
 * We organize each chart to how I like of type and push the data we filtered onto the correct fields
 *
 * @param {Array} data Holds the actual data for each Airport depending on the key
 */
// sets the data for the graphs for each
function setGraphicData(data) {
	const uniqueData = {
		// Flights Chart
		flights: {
			type: 'line',
			data: {
				datasets: [{
					label: 'Total Flights',
					data: data.graphsData.flights.total,
					backgroundColor: '#B370B0',
					borderColor: '#B370B0',
					fill: false,
					borderWidth: 1.5,
					steppedLine: true,
				},
				{
					label: 'Cross Country Flights',
					data: data.graphsData.flights.cc,
					backgroundColor: '#87255B',
					borderColor: '#87255B',
					fill: false,
					borderWidth: 1.5,
					steppedLine: true,
				}],
			},
			options: {
				title: {
					text: data.Title + ' - ' + '(Total Flights & Cross Country Flights)',
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'Years',
						},
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: '# of Flights',
						},
					}],
				},
			},
		},
		// Passengers Chart
		passenger: {
			type: 'bar',
			data: {
				datasets: [{
					label: 'Total Passengers',
					data: data.graphsData.passenger.total,
					backgroundColor: '#003BB0',
					borderColor: '#003BB0',
					fill: false,
					borderWidth: 1.5,
				},
				{
					label: 'Arrival Passengers',
					data: data.graphsData.passenger.arrival,
					backgroundColor: '#FF4922',
					borderColor: '#FF4922',
					fill: false,
					borderWidth: 1.5,
				},
				{
					label: 'Departures Passengers',
					data: data.graphsData.passenger.departue,
					backgroundColor: '#7D00B0',
					borderColor: '#7D00B0',
					fill: false,
					borderWidth: 1.5,
				},
				],
			},
			options: {
				title: {
					text: data.Title + ' - ' + 'Total Passengers',
				},
				scales: {

					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: '# of Passengers',
						},
					}],
				},
			},
		},
		// Intercontiental Passengers Chart
		inter: {
			type: 'bar',
			data: {
				datasets: [{
					label: 'Total Intercontinental Passengers',
					data: data.graphsData.inter.total,
					backgroundColor: '#003BB0',
					borderColor: '#003BB0',
					fill: false,
					type: 'line',
					borderWidth: 1.5,
				},
				{
					label: 'Africa',
					data: data.graphsData.inter.africa,
					backgroundColor: '#F07D00',
					borderColor: '#F07D00',
					fill: false,
					borderWidth: 1.5,
				},
				{
					label: 'American',
					data: data.graphsData.inter.america,
					backgroundColor: '#00963F',
					borderColor: '#00963F',
					fill: false,
					borderWidth: 1.5,
				},
				{
					label: 'Asia',
					data: data.graphsData.inter.asia,
					backgroundColor: '#AF8A01',
					borderColor: '#AF8A01',
					fill: false,
					borderWidth: 1.5,
				}],
			},
			options: {
				title: {
					text: data.Title + ' - ' + 'Intercontinental Passengers',
				},
				scales: {
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: '# of Passengers',
						},
					}],
				},
			},
		},
		// Cargo Chart
		cargo: {
			type: 'line',
			data: {
				datasets: [{
					label: 'Total Cargo',
					data: data.graphsData.cargo.total,
					backgroundColor: '#003BB0',
					borderColor: '#003BB0',
					fill: false,
					borderWidth: 1.5,
				},
				{
					label: 'Europe Cargo',
					data: data.graphsData.cargo.europe,
					backgroundColor: '#F07D00',
					borderColor: '#F07D00',
					fill: false,
					borderWidth: 1.5,
				},
				{
					label: 'Intercontinental Cargo',
					data: data.graphsData.cargo.inter,
					backgroundColor: '#00963F',
					borderColor: '#00963F',
					fill: false,
					borderWidth: 1.5,
				},
				],
			},
			options: {
				title: {
					text: data.Title + ' - ' + 'Cargo Flights',
				},
				scales: {
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: '# of Cargo',
						},
					}],
				},
			},
		},
	};
	/**
     * Here we loop through all the data [i] that is already gone through the graphs
     * Where here we will be updating the main type and years for each graph since each Airport has unique dataset for that
     * As well as putting the general options section (from ChartJS)
     */
	$.each(data.graphsData, function(key, value) {
		if(key === 'years') {
			// Continues to the next itterate if it happens to match
			return true;
		}

		data.graphsData[key].graph = {
			type: uniqueData[key].type,
			data: {
				labels: data.graphsData.years,
				datasets: uniqueData[key].data.datasets,
			},
			options: {
				responsive: true,
				title: {
					display: true,
					text: uniqueData[key].options.title.text,
				},
				tooltips: {
					mode: 'index',
					intersect: false,
				},
				hover: {
					mode: 'nearest',
					intersect: true,
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'Years',
						},
					}],
					yAxes: uniqueData[key].options.scales.yAxes,
				},
			},
		};
	});
}

/**
 * Disable the loading screen and show the page content
 * This will run when the AJAX requests have been finshed
 */
function showPage() {
	document.getElementById('loader').style.display = 'none';
	document.getElementById('content').style.display = 'block';
}

/**
 * We have a refresh button that will reload the page
 * (This is only visible when the error handle function gets called)
 *
 * I then store the data of Key and Title into the location of Airports
 * (AMS, RTM, EIN, MST, GRQ are madeup short hand object names to make easier for myself)
 *
 * I then call the getAirports function to store all the data inside the objects
 *
 * Everything from and below creating a new canvas point will run before the AJAX request are done
 * But since we are not hiding the page loader until the AJAX request is done
 * It wont matter much as the user can not see it, especially since they are DOM events.
 *
 * It then creates an empty chart canvas that we can use to update with the data later on
 *
 * And runs through some .on click event where if it happens it will show the chart according to the
 * location the user has clicked getting the Key and going through the functions
 */
$(document).ready(function() {
	// Refresh button incase the user runs into an issue loading the webpage
	$('.refresh-btn').on('click', function() {
		location.reload();
	});

	// Store the data we got of Key and Title onto the location for Airports
	const airportsNL = {
		AMS: {},
		RTM: {},
		EIN: {},
		MST: {},
		GRQ: {},
	};

	// Gets all the data we need for the graphs
	getAirports(airportsNL);

	// Create an empty chart in the canvas that we can update later on
	const canvas = $('#graph-canvas');
	const graph = new Chart(canvas, {
		data: {},
		options: {},
		type: 'line',
	});

	// Hover effect when hovering over the map
	$('#map').children('.enabled').hover(function() {
		$(this).toggleClass('hover-clr');
	});

	/**
     * A map click where it will showcase you clicked it visually and enable the
     * Category buttons
     */
	$('#map').children().on('click', function() {
		// If current map part is not enabled
		if(!$(this).hasClass('enabled')) {
			// Disable all graph category buttons
			$('#graphs').children('.graph-button').prop('disabled', true);
			// Do nothing else
			return;
		}

		// This sets the active property so we can easily access it everywhere
		const currentLocation = $(this).attr('location');
		airportsNL.active = airportsNL[currentLocation];
		// Then toggle the selected class for the map area
		$(this).toggleClass('selected-clr');
		$('#map').children().not(this).removeClass('selected-clr');

		// This enables all graph category buttons
		$('#graphs').children('.graph-button').prop('disabled', false);

		// If the chart is already visible it updates it instead with the new data
		const currentButton = $('.graphs-wrapper').attr('active');
		if(currentButton) {
			updateGraph(airportsNL.active.graphsData[currentButton].graph, graph);
			extraInfo(currentButton);
		}
	});

	// This enables the graph button
	$('.graph-button').on('click', function() {
		// This will allow me to get the current button from the use attirbute
		const currentButton = $(this).attr('use');
		/**
         * Then add the current button as the active attribute to the graph-wrapper
         * This way so I can show the proper elements through the css
         */
		$('.graphs-wrapper').attr('active', currentButton);

		// Depending on what category is pressed the graph gets updated upon that
		updateGraph(airportsNL.active.graphsData[currentButton].graph, graph);
		// Updates the paragraph info under the graph
		extraInfo(currentButton);
	});
	/**
     * Checks what is the current button is showing information wise
     * And according to that displays the correct math infomration
     *
     * @param {string} currentButton Holds the press of category for the airport information to provide
     */
	function extraInfo(currentButton) {
		if (currentButton === 'flights') {
			let totalFlights = 0;
			$.each(airportsNL.active.graphsData[currentButton].total, function(index, value) {
				totalFlights += value;
			});
			$('.extra-info-h, .extra-info-p').fadeOut(200);
			$('.extra-info-h').text(`${airportsNL.active.Title} - Total Flights`);
			$('.extra-info-p').text(`There was a total of ${totalFlights} flights within the Netherlands from 1997 to 2018, which gives us an average of ${Math.round(totalFlights / 22)} flights per year. That is some useful information!`);
			$('.extra-info-h, .extra-info-p').fadeIn(200);
		}
		else if (currentButton === 'passenger') {
			let totalPassengers = 0;
			$.each(airportsNL.active.graphsData[currentButton].total, function(index, value) {
				totalPassengers += value;
			});
			$('.extra-info-h, .extra-info-p').fadeOut(200);
			$('.extra-info-h').text(`${airportsNL.active.Title} - Total Passengers`);
			$('.extra-info-p').text(`There was a total of ${totalPassengers} passengers within the Netherlands from 1997 to 2018, which gives us an average of ${Math.round(totalPassengers / 22)} passengers per year. That is some kind of useful information!`);
			$('.extra-info-h, .extra-info-p').fadeIn(200);
		}
		else if (currentButton === 'inter') {
			let interPass = 0;
			$.each(airportsNL.active.graphsData[currentButton].total, function(index, value) {
				interPass += value;
			});
			$('.extra-info-h, .extra-info-p').fadeOut(200);
			$('.extra-info-h').text(`${airportsNL.active.Title} - Intercontiental Passengers`);
			$('.extra-info-p').text(`There was a total of ${interPass} intercontiental passengers within the Netherlands from 1997 to 2018, which gives us an average of ${Math.round(interPass / 22)} intercontiental passenger per year. That is some very very useful information!`);
			$('.extra-info-h, .extra-info-p').fadeIn(200);
		}
		else if (currentButton === 'cargo') {
			let cargo = 0;
			$.each(airportsNL.active.graphsData[currentButton].total, function(index, value) {
				cargo += value;
			});
			$('.extra-info-h, .extra-info-p').fadeOut(200);
			$('.extra-info-h').text(`${airportsNL.active.Title} - Cargo Flights`);
			$('.extra-info-p').text(`There was a total of ${cargo} cargo flights within the Netherlands from 1997 to 2018, which gives us an average of ${Math.round(cargo / 22)} cargo flights per year. That is some very very superb useful information!`);
			$('.extra-info-h, .extra-info-p').fadeIn(200);
		}
	}
});

/**
 * Updates the ChartJS graph sets with thew new options to the current graph
 * That is depending on where the user clicks on which airport
 *
 * @param {string} graphData Get the options and data as well as the type of the graph
 * @param {string} graph Obtains the basic structure of the chartjs graph
 */
function updateGraph(graphData, graph) {
	graph.options = graphData.options;
	graph.data = graphData.data;
	graph.type = graphData.type;
	graph.update();
}
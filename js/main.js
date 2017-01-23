$(document).ready(function() {
	const
		$form = $(".form"),
		$titleInput = $(".form-input-title"),
		$search = $(".form-submit-regular"),
		/*$remove = $(".button-remove"),*/
		$movies = $(".movies"),
		$sort = $(".select-sort"),
		$statusMessage = $(".control-submit > .help"),
		$statusIcon = $(".icon i");

	let data;

	$search.on("click", getData);
	$sort.on("change", sortData);
	/*$remove.on("click", removeData);*/
	$titleInput.on("keypress", resetInput);

	// Get data from API
	function getData(e) {
		e.preventDefault();
		$movies.children().remove();
		let $title = $titleInput.val();

		$.ajax({
			method: "GET",
			url: "http://www.omdbapi.com/",
			data: {
				s: $title
			},
			jsonp: "callback",
			dataType: "jsonp"
		}).then(function(response) {
			if (response.Response !== "False") {
				data = response;
				$titleInput.removeClass("is-danger").addClass("is-primary");
				$statusMessage.removeClass("is-danger").addClass("is-success");
				$statusMessage.html("Found <em>" + $title + "</em>!");
				$statusIcon.removeClass("fa-warning").addClass("fa-check");
				displayData();
			} else {
				$titleInput.removeClass("is-primary").addClass("is-danger");
				$statusMessage.removeClass("is-success").addClass("is-danger");
				$statusMessage.html("Sorry, couldn't find <em>" + $title + "</em>!");
				$statusIcon.removeClass("fa-check").addClass("fa-warning");
			}
		}).catch(function(error) {
			console.log(error);
			$titleInput.removeClass("is-primary").addClass("is-danger");
			$statusMessage.removeClass("is-success").addClass("is-danger");
			$statusMessage.text("No response!");
			$statusIcon.removeClass("fa-check").addClass("fa-warning");
		});

		// Reset form
		$form.trigger("reset");
		$titleInput.focus();
	}

	// Search the response and add results to the page
	function displayData() {
		data.Search.forEach(function(movie) {
			let movieId = movie.imdbID;

			$.ajax({
				method: "GET",
				url: "http://www.omdbapi.com/",
				data: {
					i: movieId,
					plot: "full"
				},
				jsonp: "callback",
				dataType: "jsonp"
			}).then(function(response) {
				let $movie = $("<div>", {
					class: "columns movie"
				}).appendTo($movies);

				// Poster data
				let
					$movieImage = $("<div>", {
						class: "column is-2 content"
					}).appendTo($movie),
					$imageContainer = $("<p>", {
						class: "image"
					}).appendTo($movieImage),
					$image = $("<img>", {
						src: response.Poster,
						onerror: "this.onerror=null; this.src=\"images/image-error.png\";"

					}).appendTo($imageContainer);

				// General info
				let
					$movieInfo = $("<div>", {
						class: "column is-3 content"
					}).appendTo($movie),
					$title = $("<h1>", {
						class: "title",
						html: "<a href=\"http://www.imdb.com/title/" + response.imdbID + "\">" + response.Title + "</a>" + "<small> (" + response.Year + ")</small>"
					}).appendTo($movieInfo),
					$imdbRating = $("<h3>", {
						class: "title",
						html: "IMDb rating: <span class=\"span-green\"><strong>" + response.imdbRating + "</strong></span>" + "<p><small> " + response.imdbVotes + "</small></p>"
					}).appendTo($movieInfo),
					$generalInfo = $("<p>", {
						class: "capitalize",
						html: response.Type + " | " + response.Rated + " | " + response.Runtime + " | " + response.Genre + " | " + response.Released + " " + "(" + response.Country + ")"
					}).appendTo($movieInfo),
					$directors = $("<p>", {
						html: "<span class=\"span-green\">Directors: </span>" + response.Director
					}).appendTo($movieInfo),
					$writers = $("<p>", {
						html: "<span class=\"span-green\">Writers: </span>" + response.Writer
					}).appendTo($movieInfo),
					$actors = $("<p>", {
						html: "<span class=\"span-green\">Actors: </span>" + response.Actors
					}).appendTo($movieInfo),
					$awards = $("<p>", {
						html: response.Awards
					}).appendTo($movieInfo),
					$metascore = $("<p>", {
						html: "Metascore: " + response.Metascore
					}).appendTo($movieInfo),
					$type = $("<p>", {
						html: "Type: " + response.Type
					});

				// Plot data
				let
					$moviePlot = $("<div>", {
						class: "column is-6 content"
					}).appendTo($movie),
					$plotTitle = $("<h1>", {
						class: "title",
						html: "Plot"
					}).appendTo($moviePlot),
					$plot = $("<p>", {
						html: "<em>" + response.Plot + "</em>"
					}).appendTo($moviePlot);

				// Call sort
				sortData();
			});
		});
	}

	// Sort data
	function sortData() {
		switch ($sort.val()) {
			case "Popularity":
				$movies.children().detach().sort(function(a, b) {
					let $firstEntry = parseInt($(a).children().eq(1).children().eq(1).children().eq(1).text().split(",").join("").replace("N/A", "0"));
					let $secondEntry = parseInt($(b).children().eq(1).children().eq(1).children().eq(1).text().split(",").join("").replace("N/A", "0"));
					return $firstEntry < $secondEntry;
				}).appendTo($movies);
				break;
			case "Release":
				$movies.children().detach().sort(function(a, b) {
					let $firstEntry = $(a).children().eq(1).children().eq(0).children().eq(1).text();
					let $secondEntry = $(b).children().eq(1).children().eq(0).children().eq(1).text();
					return $firstEntry > $secondEntry;
				}).appendTo($movies);
				break;
			case "Rating":
				$movies.children().detach().sort(function(a, b) {
					let $firstEntry = $(a).children().eq(1).children().eq(1).children().eq(0).text().replace("N/A", "0");
					let $secondEntry = $(b).children().eq(1).children().eq(1).children().eq(0).text().replace("N/A", "0");
					return $firstEntry < $secondEntry;
				}).appendTo($movies);
				break;
			case "Name":
				$movies.children().detach().sort(function(a, b) {
					let $firstEntry = $(a).children().eq(1).children().eq(0).children().eq(0).text();
					let $secondEntry = $(b).children().eq(1).children().eq(0).children().eq(0).text();
					return $firstEntry > $secondEntry;
				}).appendTo($movies);
				break;
			default:
				console.log("Something went wrong");
		}
	}

	// Remove data from the page
	/*function removeData(e) {
		e.preventDefault();
		$movies.children().remove();
		$form.trigger("reset");
		$titleInput.removeClass("is-primary is-danger");
		$statusMessage.html("&nbsp;");
		$statusIcon.removeClass("fa-check fa-warning");
		$titleInput.focus();
	}*/

	function resetInput() {
		$titleInput.removeClass("is-primary is-danger");
		$statusMessage.html("&nbsp;");
		$statusIcon.removeClass("fa-check fa-warning");
	}

});

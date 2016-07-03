// var data = results.result.rows;
var canvas = d3.select("body")
				.append("svg")
				.attr("width", 1500)
				.attr("height", 1500);
function visualize() {
	d3.json("data/comment_data.json", function(response){
		comments = response.rows
		aggregateData(comments);
		addHeaders();
		addTimeSeries();
	}
	);
}

function utcToDate(timestamp){
	var a = new Date(timestamp*1000);
  	var year = a.getFullYear();
  	var month = a.getMonth();
  	var date = a.getDate();
  	return year + '-' + month + '-' + date;
}

function aggregateData(comments){
	bySubreddit = {}
	byPost = {}
	byDate = {}
	totalLength = 0
	totalScore = 0

	totalComments = Object.keys(comments).length
	//creates a few aggregations in JSON objects: 
	//sr_name:num_comments, post:num_comments
	//day:num_comments. Also sums length
	for (i=0; i < Object.keys(comments).length; i++){
		thisDate = utcToDate(comments[i].f[0].v);
		console.log(thisDate);
		thisPost = comments[i].f[2].v
		thisSr = comments[i].f[3].v;
		thisScore = parseInt(comments[i].f[4].v)
		thisLength = parseInt(comments[i].f[5].v)

		if (thisDate in byDate){
			byDate[thisDate]["count"]++;
			byDate[thisDate]["score"] += thisScore;
			byDate[thisDate]["length"] += thisLength;
		} else {
			byDate[thisDate] = {}
			byDate[thisDate]["date"] = thisDate;
			byDate[thisDate]["count"] = 1;
			byDate[thisDate]["score"] = thisScore;
			byDate[thisDate]["length"] = thisLength;
		}
		if (thisSr in bySubreddit){
			bySubreddit[thisSr]++;
		} else {
			bySubreddit[thisSr] = 1;
		}
		if (thisPost in byPost){
			byPost[thisPost]++;
		} else {
			byPost[thisPost] = 1;
		}
		totalLength += thisLength;
		totalScore += thisScore;

	}
}

function addHeaders(){
	anchorX = 20;
	anchorY = 50;
	xSpacing = 250;
	yLabelSpacing=20;
	yLineSpacing = 100;
	duration = 2000; //the duration of the "counting" transition

	x = anchorX;
	y = anchorY;
	canvas.append("text")
			.classed('header-number', true)
			.attr('transform', 'translate(' + x + ',' + y + ')')
			.transition()
     			.duration(duration)
        		.tween( 'text', tweenText(totalComments));
	canvas.append("text")
			.classed('header-label', true)
			.attr('transform', 'translate(' + x + ',' + (y+yLabelSpacing) + ')')
			.text("comments")
	
	x = x+xSpacing		
	canvas.append("text")
			.classed('header-number', true)
			.attr('transform', 'translate(' + x + ',' + y + ')')
			.transition()
     			.duration(duration)
        		.tween( 'text', tweenText(Object.keys(byPost).length));
	canvas.append("text")
			.classed('header-label', true)
			.attr('transform', 'translate(' + x + ',' + (y+yLabelSpacing) + ')')
			.text("unique posts")

	x = x+xSpacing
	canvas.append("text")
			.classed('header-number', true)
			.attr('transform', 'translate(' + x + ',' + y + ')')
			.transition()
     			.duration(duration)
        		.tween( 'text', tweenText(Object.keys(bySubreddit).length));
	canvas.append("text")
			.classed('header-label', true)
			.attr('transform', 'translate(' + x + ',' + (y+yLabelSpacing) + ')')
			.text("subreddits")

	x = anchorX+25;
	y = anchorY+yLineSpacing;
	canvas.append("text")
			.classed('header-number', true)
			.attr('transform', 'translate(' + x + ',' + y + ')')
			.transition()
     			.duration(duration)
        		.tween( 'text', tweenText(totalScore));
	canvas.append("text")
			.classed('header-label', true)
			.attr('transform', 'translate(' + x + ',' + (y+yLabelSpacing) + ')')
			.text("total score");			

	x = x+(xSpacing+100)
	canvas.append("text")
			.classed('header-number', true)
			.attr('transform', 'translate(' + x + ',' + y + ')')
			.transition()
     			.duration(duration)
        		.tween( 'text', tweenText(totalLength));
	canvas.append("text")
			.classed('header-label', true)
			.attr('transform', 'translate(' + x + ',' + (y+yLabelSpacing) + ')')
			.text("total length")	
}

function addTimeSeries(){
	canvas.append("rect");

}

function tweenText( newValue ) {
    return function() {
      var currentValue = this.textContent;
      
      var i = d3.interpolateRound( currentValue, newValue );
      
      return function(t) {
        this.textContent = i(t);
      };
    }
  }
var width = window.innerWidth;
var height = window.innerHeight;

var canvas = d3.select("body")
				.append("svg")
				.attr("width", width)
				.attr("height", height);

function visualize() {
	d3.json("data/comment_data.json", function(response){ //reading dummy data file for now to avoid costly API calls in testing
		duration = 2000; //the duration of the transitions
		comments = response.rows
		console.log("version 2")
		aggregateData(comments);
		addHeaders();
		addHistogram(dateArray);
		
	});
}

function timestampToDate(timestamp){
	var a = new Date(timestamp*1000);
  	return a.toISOString().slice(0,10);
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
	//day:[num_comments,sum score, sum length]
	//also sums score and length globally
	for (i=0; i < Object.keys(comments).length; i++){
		thisDate = timestampToDate(comments[i].f[0].v);
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
			bySubreddit[thisSr]["count"]++;
			bySubreddit[thisSr]["score"] += thisScore;
			bySubreddit[thisSr]["length"] += thisLength;
		} else {
			bySubreddit[thisSr] = {};
			bySubreddit[thisSr]["subreddit"] = thisSr;
			bySubreddit[thisSr]["count"] = 1;
			bySubreddit[thisSr]["score"] = thisScore;
			bySubreddit[thisSr]["length"] = thisLength;
		}

		if (thisPost in byPost){
			byPost[thisPost]["count"]++;
			byPost[thisPost]["score"] += thisScore;
			byPost[thisPost]["length"] += thisLength;
		} else {
			byPost[thisPost] = {};
			byPost[thisPost]["post"] = thisPost;
			byPost[thisPost]["link"] = "https://redd.it/"+thisPost.substring(3)
			byPost[thisPost]["count"] = 1;
			byPost[thisPost]["score"] = thisScore;
			byPost[thisPost]["length"] = thisLength;
		}

		totalLength += thisLength;
		totalScore += thisScore;

	}
	dateArray = dictToArray(byDate);
	dateArray.sort(function(a,b) {return (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0);} );
	srArray = dictToArray(bySubreddit);
	srArray.sort(function(a,b) {return (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0);} );
	postArray = dictToArray(byPost);
	postArray.sort(function(a,b) {return (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0);} );
	
}

function dictToArray(inputDict){
	keys = [];
	returnArray = [];
	keys = Object.keys(inputDict);
	for (i=0; i < keys.length; i++){
		returnArray.push(inputDict[keys[i]])
	};
	return returnArray
}

function addHeaders(){
	anchorX = 20;
	anchorY = 50;
	xSpacing = width/3-20;
	yLabelSpacing=20;
	yLineSpacing = 100;

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
        		.tween( 'text', tweenText(postArray.length));
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
        		.tween( 'text', tweenText(srArray.length));
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

function addHistogram(dateArray){
	anchorX = 20;
	anchorY = 350;
	yScale = 20;
	y = anchorY;
	x = anchorX;
	xSpacing = width/(dateArray.length+2);

	canvas.selectAll("rect")
		.data(dateArray)
		.enter()
			.append("rect")
			.attr('width', xSpacing-4)
			.classed("histogram", true)
			.attr('y', function(d){
				return y;
			})
			.attr('x', function(d,i){
				return i * xSpacing+anchorX;
			})
			.attr('height',0)
			.transition()
				.duration(duration)
				.attr('height', function(d){
					return d.count*yScale;
				})
				.attr('y', function(d){
					return y-(d.count*yScale);
				})
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
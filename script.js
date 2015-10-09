function HeatMap(times, data, options) {
	
	var _this = this;
	this.data = data;
	this.time = times;
	
	this.a = document.getElementById( options.container );
	this.canvas = document.createElement('canvas');
	this.a.appendChild(this.canvas);

	this.ctx = this.canvas.getContext('2d');
	
	this.config = {
		font : "10px serif",
		unit : 'kW',
		blockScale : true,
		spacing : 3,
		roundedEdge : true,
		colorArrArr : 
			this.colorArr = [
				'#5BB2A6',
				'#00D5B2',
				'#66E9B0',
				'#D8FAA2',
				'#F2FDB3',
				'#FFE396',
				'#FFB071',
				'#FF7656',
				'#EC372A',
				'#BF0000',
				'#8A0000'
			],
		screwyTime : 0
	};

	for ( var key in this.config ) {
		this[key] = this.config[key];
	}
	for ( var key in options ) {
		this[key] = options[key];
	}


	this.organizeData = function() {
		
		this.days = [];
		var counter = 0;
		for ( var i = 1; i < this.data.length; i++ ) {
			
			//inserts the first day //only runs once
			if ( this.days.length === 0 ) {
				
				this.days.push({});
				var a = new Date(this.time[0]).getHours() - this.screwyTime;

				var dateDisplay = (new Date(this.time[0]).getMonth()+1) + '/' + (new Date(this.time[0]).getDate());

				this.days[0].date = (dateDisplay);

				this.days[this.days.length-1]['hour' + a] = [];
				this.days[this.days.length-1]['hour' + a].push(this.data[0]);

			}
				
			var currentPoint = new Date(this.time[i]);
			var lastPoint = new Date(this.time[i-1]);

			currentPoint = new Date(currentPoint.setHours(currentPoint.getHours() - this.screwyTime));
			lastPoint = new Date(lastPoint.setHours(lastPoint.getHours() - this.screwyTime));

			
			// creates a new object if date is in a new day
			if ( currentPoint.getDate() !== lastPoint.getDate() ) {
				this.days.push({date:(new Date(this.time[i]).getMonth()+1) + '/' + (new Date(this.time[i]).getDate())});
			}

			// b is every second except for the first
			var b = new Date(this.time[i]);

			b = (new Date(b.setHours(b.getHours() - this.screwyTime))).getHours();
		
			// creates a new hour array
			if ( currentPoint.getHours() !== lastPoint.getHours() ) {
				this.days[this.days.length-1]['hour' + b] = [];
			}

			
			this.days[this.days.length-1]['hour' + b].push(this.data[i]);

		}

	};

	
	this.averageData = function() {

		for ( var i = 0; i < this.days.length; i++ ) {
			for ( var key in this.days[i] ) {
				if ( key !== 'date') {

					var sum = 0;
					for ( var j = 0; j < this.days[i][key].length; j++ ) {
						sum += this.days[i][key][j];
					}

					// change the array to the average of the array
					this.days[i][key] = sum/this.days[i][key].length;
				
				}
			}
		}

	};


	this.createScale = function() {
		
		this.highPower = this.data[0];
		this.lowPower = this.data[0];
		
		for ( var i = 0; i < this.data.length; i++ ) {
			if ( this.data[i] > this.highPower ) {
				this.highPower = this.data[i];
			}
			if ( this.data[i] < this.lowPower ) {
				this.lowPower = this.data[i];
			}
		}

		this.scaleRange = this.highPower - this.lowPower;
		this.scaleIncrement = this.scaleRange/this.colorArr.length;
		
		this.scaleStart = this.lowPower;

		for ( var i = 0; i < this.colorArr.length; i++ ) {
			this.scaleArr.push((this.scaleStart += this.scaleIncrement));
		}
		this.scaleStart = this.lowPower;
	};

	this.displayScale = function() {
		
		this.ctx.fillText(parseInt(this.scaleStart/1000)+ ' ' + this.unit, this.currentX-12, this.currentY + 47);
		
		// need to add an every other option if width is too small;
		if ( options.blockScale === false ) {
			
			var grd = this.ctx.createLinearGradient( this.currentX, this.currentY, this.incrementX * this.colorArr.length, this.incrementY );
			for (var i = 0; i < this.colorArr.length; i++) {
				if (i !== 0) {
					grd.addColorStop((i)/(this.colorArr.length+1), this.colorArr[i]);
				}else {
					grd.addColorStop(0, this.colorArr[i]);
				}
			}
			
			this.ctx.fillStyle = grd;
			this.ctx.fillRect( this.currentX, this.currentY+50, this.incrementX* this.colorArr.length, this.incrementY-3 );
			
			for ( var i = 0; i < this.colorArr.length; i++ ) {
				this.ctx.fillStyle = '#000';
				this.currentX += this.incrementX;
				this.ctx.fillText(parseInt(this.scaleArr[i]/1000)+ ' ' + this.unit, this.currentX-12, this.currentY + 47);
			}
		
		} else {
			
			for ( var i = 0; i < this.colorArr.length; i++ ) {
				this.ctx.fillStyle = this.colorArr[i];
				this.drawBoxes(this.ctx, this.currentX, this.currentY + 50, this.incrementX-this.spacing, this.incrementY-this.spacing, 5);
				this.ctx.fillStyle = '#000';
				this.currentX += this.incrementX;
				this.ctx.fillText(parseInt(this.scaleArr[i]/1000)+ ' ' + this.unit, this.currentX-12, this.currentY + 47);
			}
		
		}
	
	};

	this.addColor = function(dataPoint) {


		for ( var i = 0; i < this.colorArr.length; i++ ) {
			this.scaleStart += this.scaleIncrement;
			if ( dataPoint < this.scaleStart ) {
				
				this.scaleStart = this.lowPower;
				return this.colorArr[i];
			}
		}
	};


	this.drawBoxes = function(ctx, x, y, width, height, radius) {
		console.log('roundedEdge',this.roundedEdge);
		if ( this.roundedEdge === true ) {

			if (typeof radius === "undefined") {
				radius = 5;
			}
			this.ctx.beginPath();
			this.ctx.moveTo(x + radius, y);
			this.ctx.lineTo(x + width - radius, y);
			this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
			this.ctx.lineTo(x + width, y + height - radius);
			this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			this.ctx.lineTo(x + radius, y + height);
			this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
			this.ctx.lineTo(x, y + radius);
			this.ctx.quadraticCurveTo(x, y, x + radius, y);
			this.ctx.closePath();

			this.ctx.fill();
		} else {
			this.ctx.fillRect( x, y, width, height );
		}
      
	};

	this.createGrid = function(day) {
		var alternateTime;
		
		for ( var i = 0; i < 24; i++ ) {

			//create a square in here
			// move to the next one
			for ( var key in day ) {
				if ( key === "hour" + i ) {
					
					this.ctx.fillStyle = this.addColor(day[key]);
					this.drawBoxes( this.ctx, this.currentX, this.currentY, this.incrementX-this.spacing, this.incrementY-this.spacing, 5);
					
					
					// below needs to be added to top of the chart
					// dates need to be added to side of chart
					if (this.writing === true) {
						
						if ( key.slice(4) === '0' ) {
							alternateTime = '12am';
						} else if ( parseInt(key.slice(4)) < 12) {
							alternateTime = key.slice(4) + 'am';
						} else if ( parseInt(key.slice(4)) === 12 ) {
							alternateTime = key.slice(4) + 'pm';
						} else {
							alternateTime = (parseInt(key.slice(4)) - 12) + 'pm';
						}
						
						this.ctx.fillStyle = '#000';
						this.ctx.fillText(alternateTime, this.currentX, 17);
					}
				}
			}
			this.currentX += this.incrementX;
		}
		this.writing = false;
	};


	this.resizeWindow = function() {
		_this.ctx.clearRect( 0, 0, _this.a.offsetWidth, _this.a.offsetHeight );

		_this.draw();
	};


	this.draw = function() {

		this.ctx = this.canvas.getContext('2d');
		this.ctx.font = "10px serif";

		this.writing = true;

		this.scaleArr = [];

		this.createScale();
		this.organizeData();

		// sets the canvas to the size of its container
		this.canvas.setAttribute('width', this.a.offsetWidth - 50);
		this.canvas.setAttribute('height', (this.a.offsetWidth/8) + ((this.a.offsetWidth * 0.04) * this.days.length));
		this.a.style.height = (this.a.offsetWidth/8) + (48* this.days.length);

		this.averageData();

	    this.currentX = 50;
	    this.currentY = 20;
	    this.incrementX = (this.canvas.offsetWidth-50)/24;
	    this.incrementY = this.incrementX;

		for ( var j = 0; j < this.days.length; j++ ) {
			this.createGrid(this.days[j]);
			this.currentX = 50;
			this.ctx.fillStyle = '#000';
			this.ctx.fillText(this.days[j].date, 27, this.currentY + 22);
			this.currentY += this.incrementY;
		}
		
		this.displayScale();
	};


	this.draw();

	window.addEventListener('resize', _this.resizeWindow);
}

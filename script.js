


function HeatMap(data, options) {
	var _this = this;
	this.data = data;
	this.a = document.getElementById(options.container);
	this.canvas = document.createElement('canvas');
	this.a.appendChild(this.canvas);

	this.padding = 50;

	// sets the canvas to the size of its container
	this.canvas.setAttribute('width', this.a.offsetWidth - this.padding);
	this.canvas.setAttribute('height', this.a.offsetHeight);

	this.ctx = this.canvas.getContext('2d');
	
	if ( !options.font ) {
		this.ctx.font = "10px serif";
	} else {
		this.ctx.font = options.font;
	}

	//colorArr exists????
	if ( !options.colorArr ) {
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
		];
	} else {
		this.colorArr = colorArr;
	}

	if ( !options.screwyTime ) {
		screwyTime = 0;
	} else {
		screwyTime = options.screwyTime;
	}


	this.organizeData = function() {
		
		this.days = [];

		for ( var i = 1; i < this.data.length; i++ ) {
			
			//inserts the first day //only runs once
			if ( this.days.length === 0 ) {
				this.days.push({});
				var a = new Date(this.data[0].created).getHours() - screwyTime;

				var dateDisplay = (new Date(this.data[0].created).getMonth()+1) + '/' + (new Date(this.data[0].created).getDate());

				this.days[0].date = (dateDisplay);

				this.days[this.days.length-1]['hour' + a] = [];
				this.days[this.days.length-1]['hour' + a].push(this.data[0].power_total);
			}
				
			var currentPoint = new Date(this.data[i].created);
			var lastPoint = new Date(this.data[i-1].created);
			currentPoint = new Date(currentPoint.setHours(currentPoint.getHours() - screwyTime));
			lastPoint = new Date(lastPoint.setHours(lastPoint.getHours() - screwyTime));

			
			// creates a new object if date is in a new day
			if ( currentPoint.getDate() !== lastPoint.getDate() ) {
				this.days.push({date:(new Date(this.data[i].created).getMonth()+1) + '/' + (new Date(this.data[i].created).getDate())});
			}

			var b = new Date(this.data[i].created);

			b = (new Date(b.setHours(b.getHours() - screwyTime))).getHours();

			// creates a new hour array
			if ( currentPoint.getHours() !== lastPoint.getHours() ) {
				this.days[this.days.length-1]['hour' + b] = [];
			}
			
			this.days[this.days.length-1]['hour' + b].push(this.data[i].power_total);

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
		
		this.highPower = this.data[0].power_total;
		this.lowPower = this.data[0].power_total;
		
		for ( var i = 0; i < this.data.length; i++ ) {
			if ( this.data[i].power_total > this.highPower ) {
				this.highPower = this.data[i].power_total;
			}
			if ( this.data[i].power_total < this.lowPower ) {
				this.lowPower = this.data[i].power_total;
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
		
		this.ctx.fillText(parseInt(this.scaleStart/1000)+' kW', this.currentX-12, this.currentY + 47);
		
		// need to add an every other option if width is too small;
		for ( var i = 0; i < this.colorArr.length; i++ ) {
			this.ctx.fillStyle = this.colorArr[i];
			this.drawBoxes(this.ctx, this.currentX, this.currentY + 50, this.incrementX-3, this.incrementY-3, 5);
			this.ctx.fillStyle = '#000';
			this.currentX += this.incrementX;
			this.ctx.fillText(parseInt(this.scaleArr[i]/1000)+' kW', this.currentX-12, this.currentY + 47);
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
      
	};

	this.createGrid = function(day) {
		var alternateTime;
		
		for ( var i = 0; i < 24; i++ ) {

			//create a square in here
			// move to the next one
			for ( var key in day ) {
				if ( key === "hour" + i ) {
					
					this.ctx.fillStyle = this.addColor(day[key]);
					this.drawBoxes( this.ctx, this.currentX, this.currentY, this.incrementX-3, this.incrementY-3, 5);
					
					
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

		this.canvas.setAttribute('width', this.a.offsetWidth - this.padding);
		this.canvas.setAttribute('height', this.a.offsetHeight);

		this.ctx = this.canvas.getContext('2d');
		this.ctx.font = "10px serif";

		this.writing = true;

		this.scaleArr = [];

		this.createScale();
		this.organizeData();
		this.averageData();

	    this.currentX = this.padding;
	    this.currentY = 20;
	    this.incrementX = (this.canvas.offsetWidth-this.padding)/24;
	    this.incrementY = this.incrementX;
		

	    

		for ( var j = 0; j < this.days.length; j++ ) {
			this.createGrid(this.days[j]);
			this.currentX = this.padding;
			this.ctx.fillStyle = '#000';
			this.ctx.fillText(this.days[j].date, this.padding - 20, this.currentY + 22);
			this.currentY += this.incrementY;
		}
		
		this.displayScale();
	};

	this.draw();

	window.addEventListener('resize', _this.resizeWindow);
}


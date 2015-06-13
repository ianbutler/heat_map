# heat_map
Heat map.  Meant to create a color coded heat map to compare data over an hourly basis.  Shows the comparison over a 24 hour period.

Takes in an array of time in milliseconds, and an array of data you want to compare.  It also takes an object of configurable options.  

Initialized like this:

var heatMap = new HeatMap( time, powerArr, heatMapOptions );

Options can be set up like below.  Most are optional:

var heatMapOptions = {
    container : 'heatMap', //the id you want heatMap to use.  this is a neccesary input
    
    screwyTime : 7, // this is a dirty fix that is needed to make up for the difference in time of the data I was using vs the way the timestamp read it.  7 is for the number of hours difference.  defaults to 0
    
    font : '10px FuturaLight', // set the fonts of the labels, and units.  defauts to '10px serif'
    
    blockScale : true, //sets the scale as blocks or as a gradient.  Takes true or false.  defaults to true
    
    spacing : 3, //how much space you want around each block.  defaults to 3
    
    roundedEdge : true,  // do you want each block to be rounded or square.  defaults to true
    
    colorArr : [
        '#eee',
        '#ccc',
        '#999',
        '#777',
        '#444',
        '#111'
    ],  // allows you to change the color scale, and the number of difference markers
    
    unit : 'kW' // set the units.  It's default is kW.
}

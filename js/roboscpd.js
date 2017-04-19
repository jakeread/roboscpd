// ROBOSCPD
/*
TBD
lots
apres serial structure is done on the F4, do some tests - with a virtual bot - lights on & off
re-implement maths: function fitting, search, 
some more clarity on CLI->Serial and CLI->Roboscpd !! ?
*/

var roboconsole = new SocketConsole(); // has a websocketlayer
var graphix = new Graphix(); // doin a display
var dataone = new DataSet("chartOne"); // pass context

graphix.init();

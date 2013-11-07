var ps = require('./ps');



function monitor(socket,config){
	//console.log(arguments);
	if (typeof config['scale']=='undefined'){
		config['scale'] = 1;
	}
	scale = config['scale'];
	ps()
	.args('aux')
	.exec(function (err,str,str_err){
		if (err){
		
		}else{
			var timestamp = Math.round(new Date().getTime()); // JS Timestamp
			var pslist = parsePS(str);
			if (config['cpu-all'] === true){
				var sum = 0; 
				for(var i in pslist){ sum+=pslist[i].cpu }
				var item = { 
					program: 'cpu',
					tag: 'cpu-all',
					time: timestamp,
					value: sum*scale
				};
				socket.emit('put', item);
			}
			/*
			if (config['all-processes-memory'] === true){
				var sum = 0; 
				for(var i in pslist){ sum+=pslist[i].memory }
				var item = { 
					program: 'cpu',
					tag: 'all-processes-memory',
					time: timestamp,
					value: sum*scale
				};
				socket.emit('put', item);
			}
			*/
			if (typeof config['programms'] !== 'undefined'){
				var programms =  config['programms'];
				for(var p in programms){
					if (typeof programms[p].regex!=='undefined'){
						var regEx = new RegExp(programms[p].regex);
						var sum = 0; 
						for(var i in pslist){
							if (regEx.test(pslist[i].command)){
								sum+=pslist[i].cpu;
							}
						}
						var item = { 
							program: 'cpu',
							tag: 'cpu-'+programms[p].tag,
							time: timestamp,
							value: sum*scale
						};
						socket.emit('put', item);
					}
					
					if (typeof programms[p].indexOf!=='undefined'){
						var indexOf =  programms[p].indexOf ;
						var sum = 0; 
						for(var i in pslist){
							if (pslist[i].command.indexOf(indexOf)>=0){
								sum+=pslist[i].cpu;
							}
						}
						var item = { 
							program: 'cpu',
							tag: 'cpu-'+programms[p].tag,
							time: timestamp,
							value: sum*scale
						};
						socket.emit('put', item);
					}
				}
			}
			
		}
	})
	
}

function parsePS(output) {
  var lines = output.trim().split('\n');
   
  var labelsMap = {};
  var labels = lines[0].trim().split(/[ \t]+/g);
	for (var i = 0; i < labels.length; i++){
    labelsMap[labels[i]] = i;
	}

	var list = [];
	 
	for(var i=1; i<lines.length;i++){
		var values = lines[i].trim().split(/[ \t]+/g);
	
		var foundPID = parseInt(values[labelsMap['PID']], 10);
		var rss = 1024 * parseInt(values[labelsMap['RSS']], 10);
		var cpu = parseFloat( values[labelsMap['%CPU']].replace(/,/g,".") );
		var command = values[labelsMap['COMMAND']];
		var vi = labelsMap['COMMAND']+1;
		while(vi<values.length){
			command+=' '+values[vi];
			vi++;
		}
	
		list.push({ command: command,memory: rss, cpu: cpu });
	}
	return list;
}

module.exports.monitor=monitor;
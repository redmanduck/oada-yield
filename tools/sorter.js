function comparator(a,b) {
  if (Number(a.t) < Number(b.t))
     return -1;
  if (Number(a.t) > Number(b.t))
    return 1;
  return 0;
}

 var raw  = require('../public/wetmass.json');
sorted = raw.flows.sort(comparator);
V = []
for(i=0;i<sorted.length - 1;i++){
	var A = Number(sorted[i].t)
	var B = Number(sorted[i+1].t)
	var diff = B-A;
	// console.log(diff);
}
console.log(sorted);
define(['oss/opb/topo/lib/ht/ht.js',
        ],function(tmpHt) {
	if (tmpHt) {
		console.log(tmpHt);
	}
	var HT = 'ht';
	if (window[HT] ){
		console.log('ht load ok!');
	}
	return {};
});
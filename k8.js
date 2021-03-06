/*********************************************
 * getopt(): translated from the BSD version *
 *********************************************/

var getopt = function(args, ostr) {
	var oli; // option letter list index
	if (typeof(getopt.place) == 'undefined')
		getopt.ind = 0, getopt.arg = null, getopt.place = -1;
	if (getopt.place == -1) { // update scanning pointer
		if (getopt.ind >= args.length || args[getopt.ind].charAt(getopt.place = 0) != '-') {
			getopt.place = -1;
			return null;
		}
		if (getopt.place + 1 < args[getopt.ind].length && args[getopt.ind].charAt(++getopt.place) == '-') { // found "--"
			++getopt.ind;
			getopt.place = -1;
			return null;
		}
	}
	var optopt = args[getopt.ind].charAt(getopt.place++); // character checked for validity
	if (optopt == ':' || (oli = ostr.indexOf(optopt)) < 0) {
		if (optopt == '-') return null; //  if the user didn't specify '-' as an option, assume it means null.
		if (getopt.place < 0) ++getopt.ind;
		return '?';
	}
	if (oli+1 >= ostr.length || ostr.charAt(++oli) != ':') { // don't need argument
		getopt.arg = null;
		if (getopt.place < 0 || getopt.place >= args[getopt.ind].length) ++getopt.ind, getopt.place = -1;
	} else { // need an argument
		if (getopt.place >= 0 && getopt.place < args[getopt.ind].length)
			getopt.arg = args[getopt.ind].substr(getopt.place);
		else if (args.length <= ++getopt.ind) { // no arg
			getopt.place = -1;
			if (ostr.length > 0 && ostr.charAt(0) == ':') return ':';
			return '?';
		} else getopt.arg = args[getopt.ind]; // white space
		getopt.place = -1;
		++getopt.ind;
	}
	return optopt;
}

/* // getopt() example
var c;
while ((c = getopt(arguments, "i:xy")) != null) {
	switch (c) {
		case 'i': print(getopt.arg); break;
		case 'x': print("x"); break;
		case 'y': print("y"); break;
	}
}
*/

/*********************
 * Matrix operations *
 *********************/

Math.m = {};

Math.m.T = function(a) { // matrix transpose
	var b = [], m = a.length, n = a[0].length; // m rows and n cols
	for (var j = 0; j < n; ++j) b[j] = [];
	for (var i = 0; i < m; ++i)
		for (var j = 0; j < n; ++j)
			b[j].push(a[i][j]);
	return b;
}

Math.m.print = function(a) { // print a matrix to stdout
	var m = a.length, n = a[0].length;
	for (var i = 0; i < m; ++i) {
		var line = '';
		for (var j = 0; j < n; ++j)
			line += (j? "\t" : '') + a[i][j];
		print(line);
	}
}

Math.m.mul = function(a, b) { // matrix mul
	var m = a.length, n = a[0].length, s = b.length, t = b[0].length;
	if (n != s) return null;
	var x = [], c = Math.m.T(b);
	for (var i = 0; i < m; ++i) {
		x[i] = [];
		for (var j = 0; j < t; ++j) {
			var sum = 0;
			var ai = a[i], cj = c[j];
			for (var k = 0; k < n; ++k) sum += ai[k] * cj[k];
			x[i].push(sum);
		}
	}
	return x;
}

Math.m.add = function(a, b) { // matrix add
	var m = a.length, n = a[0].length, s = b.length, t = b[0].length;
	var x = [];
	if (m != s || n != t) return null; // different dimensions
	for (var i = 0; i < m; ++i) {
		x[i] = [];
		var ai = a[i], bi = b[i];
		for (var j = 0; j < n; ++j)
			x[i].push(ai[j] + bi[j]);
	}
	return x;
}

Math.m.solve = function(a, b) { // Gauss-Jordan elimination, translated from gaussj() in Numerical Recipes in C.
	// on return, a[n][n] is the inverse; b[n][m] is the solution
	var n = a.length, m = (b)? b[0].length : 0;
	if (a[0].length != n || (b && b.length != n)) return -1; // invalid input
	var xc = [], xr = [], ipiv = [];
	var i, ic, ir, j, l, tmp;

	for (j = 0; j < n; ++j) ipiv[j] = 0;
	for (i = 0; i < n; ++i) {
		var big = 0;
		for (j = 0; j < n; ++j) {
			if (ipiv[j] != 1) {
				for (k = 0; k < n; ++k) {
					if (ipiv[k] == 0) {
						if (Math.abs(a[j][k]) >= big) {
							big = Math.abs(a[j][k]);
							ir = j; ic = k;
						}
					} else if (ipiv[k] > 1) return -2; // singular matrix
				}
			}
		}
		++ipiv[ic];
		if (ir != ic) {
			for (l = 0; l < n; ++l) tmp = a[ir][l], a[ir][l] = a[ic][l], a[ic][l] = tmp;
			if (b) for (l = 0; l < m; ++l) tmp = b[ir][l], b[ir][l] = b[ic][l], b[ic][l] = tmp;
		}
		xr[i] = ir; xc[i] = ic;
		if (a[ic][ic] == 0) return -3; // singular matrix
		var pivinv = 1. / a[ic][ic];
		a[ic][ic] = 1.;
		for (l = 0; l < n; ++l) a[ic][l] *= pivinv;
		if (b) for (l = 0; l < m; ++l) b[ic][l] *= pivinv;
		for (var ll = 0; ll < n; ++ll) {
			if (ll != ic) {
				var dum = a[ll][ic];
				a[ll][ic] = 0;
				for (l = 0; l < n; ++l) a[ll][l] -= a[ic][l] * dum;
				if (b) for (l = 0; l < m; ++l) b[ll][l] -= b[ic][l] * dum;
			}
		}
	}
	for (l = n - 1; l >= 0; --l)
		if (xr[l] != xc[l])
			for (var k = 0; k < n; ++k)
				tmp = a[k][xr[l]], a[k][xr[l]] = a[k][xc[l]], a[k][xc[l]] = tmp;
	return 0;
}

/* // Math.m example
x = [[1,2],[3,4]]; y = [[1,2],[3,4]];
Math.m.print(Math.m.add(Math.m.mul(x,y), x));
a = [[1,1],[1,-1]]; b = [[2],[0]];
a = [[1,2],[3,4]];
print(Math.m.solve(a));
Math.m.print(a);
*/

/**************************
 * Bioinformatics related *
 **************************/

Bio = {};

Bio.Seq = function(_seq) {
	this.seq = (typeof(_seq) == 'undefined')? null : _seq;
	this.read = function(next_func) {
		var line, match;
		if (this._finished) return null;
		if (!this._last) { // the first record
			while ((line = next_func()) != null) {
				if (/^>\S/.test(line)) {
					this._last = line;
					break;
				}
			}
		}
		if ((match = /^>(\S+)(\s+(\S+))?/.exec(this._last)))
			this.name = match[1], this.comment = match[3];
		this.seq = '';
		while ((line = next_func()) != null) {
			if (/^>\S/.test(line)) {
				this._last = line;
				break;
			}
			line.replace(/\s/g, '');
			this.seq += line;
		}
		if (line == null) this._finished = true;
		return this;
	}
	this.print = function(_linelen) {
		var linelen = (typeof(_linelen) != 'number')? 60 : _linelen;
		print(">"+this.name+(this.comment? ' '+this.comment : ''));
		for (var i = 0; i < this.seq.length; i += linelen)
			print(this.seq.substr(i, linelen));
	}
}

Bio.Seq.comp_pair = ['WSATUGCYRKMBDHVNwsatugcyrkmbdhvn', 'WSTAACGRYMKVHDBNwstaacgrymkvhdbn'];
Bio.Seq.ts_table = {'AG':1, 'GA':1, 'CT':2, 'TC':2};

/* // Bio.Seq example
var s = new Bio.Seq();
var f = new File(arguments[0]);
while (s.next(function(){return f.next()}) != null) s.print();
*/

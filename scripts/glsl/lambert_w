// Plan: ctet(z,100) should look like W(-ln(z))/-ln(z)
// Test: cmul(lambert_w(z),cexp(lambert_w(z)))-z
// Is this supposed to look interesting? cdiv(lambert_w(-clog(z)),-clog(z))
#function lambert_w
#requires clog cpow cexp
vec2 lambert_w(vec2 x) {
	// This tries a few easy convergence patches, then if x doesn't lie in them
	// it runs a ton of more complicated ones and returns the closest one
	if (cmag2(x)<0.13) { // annoyingly low effective convergence radius
								   // 1/e (squared)
		vec2 summer = ZERO;
		vec2 xn = x;
		// \sum_n (-n)^(n-1)/n! x^n
		summer += 1.0 * xn; xn = cmul(xn,x);
		summer += -1.0 * xn; xn = cmul(xn,x);
		summer += 1.5 * xn; xn = cmul(xn,x);
		summer += -2.6666666666666665 * xn; xn = cmul(xn,x);
		summer += 5.208333333333333 * xn; xn = cmul(xn,x);
		summer += -10.8 * xn; xn = cmul(xn,x);
		summer += 23.343055555555555 * xn; xn = cmul(xn,x);
		summer += -52.01269841269841 * xn; xn = cmul(xn,x);
		summer += 118.62522321428571 * xn; xn = cmul(xn,x);
		summer += -275.5731922398589 * xn; xn = cmul(xn,x);
		summer += 649.7871723434745 * xn; xn = cmul(xn,x);
		summer += -1551.1605194805195 * xn; xn = cmul(xn,x);
		summer += 3741.4497029592385 * xn; xn = cmul(xn,x);
		summer += -9104.500241158019 * xn; xn = cmul(xn,x);
		summer += 22324.3085127066 * xn; xn = cmul(xn,x);
		summer += -55103.621972903835 * xn; xn = cmul(xn,x);
		summer += 136808.86090394293 * xn; xn = cmul(xn,x);
		summer += -341422.05066583835 * xn; xn = cmul(xn,x);
		summer += 855992.9659966076 * xn;
		return summer;
	} else {
		// this can use a touch up
		vec2 L1 = clog(x);
		vec2 L12 = cpow(L1,2.0);
		vec2 L13 = cpow(L1,3.0);
		vec2 L14 = cpow(L1,4.0);
		vec2 L15 = cpow(L1,5.0);

		vec2 L2 = clog(L1);
		vec2 L22 = cpow(L2,2.0);
		vec2 L23 = cpow(L2,3.0);
		vec2 L24 = cpow(L2,4.0);
		vec2 L25 = cpow(L2,5.0);

		vec2 summer = ZERO;
		// can reduce these a bit
		summer += L1;
		summer -= L2;
		summer += cdiv(L2,L1);
		summer += cdiv(-2.0*L2+ L22,2.0*L12);
		summer += cdiv(6.0*L2 -9.0*L22 +2.0*L23,6.0*L13);
		summer += cdiv(-12.0*L2 + 36.0*L22-22.0*L23+3.0*L24,12.0*L14);
		summer += cdiv(60.0*L2-300.0*L22+350.0*L23-125.0*L24+12.0*L25,60.0*L15);
		if (cmag2(x) > 9000.0) {
			return summer;
		}

		// method 0: above
		vec2 sol0 = summer;
		float err0 = cmag2(cmul(sol0,cexp(sol0))-x);
		float best_err = err0;

		// try a few methods, find the one with least error in magnitude
		// method 1: simple continued fraction
		summer = 190.0*ONE +13582711.0/94423.0*x;
		summer = 17.0*ONE + 1927.0*cdiv(x,summer);
		summer = 10.0*ONE + 133.0*cdiv(x,summer);
		summer = 3.0*ONE + 17.0*cdiv(x,summer);
		summer = 2.0*ONE + 5.0*cdiv(x,summer);
		summer = ONE + cdiv(x,summer);
		summer = ONE + cdiv(x,summer);
		summer = cdiv(x,summer);
		vec2 sol1 = summer;
		float err1 = cmag2(cmul(sol1,cexp(sol1))-x);

		if (err1 < best_err) {
			best_err = err1;
		}

		// method 2: exponential continued fraction--good for |W(x)|<1 in principle,
		// bad in practice

		// summer = ZERO;
		// for (int i = 0; i < 10; i++) {
		// 	summer = cdiv(x,cexp(summer));
		// }

		// vec2 sol2 = summer;
		// float err2 = cmag2(cmul(sol2,cexp(sol2))-x);
		// if (err2 < best_err) {
		// 	best_err = err2;
		// }

		// method 3: logarithmic continued fraction--good for |W(x)|>e in theory
		// I think this one's busted
		// summer = x;
		// for (int i = 0; i < 2; i++) {
		// 	summer = cdiv(x,clog(summer));
		// }
		// summer = clog(summer);
		// vec2 sol3 = summer;
		// float err3 = cmag2(cmul(sol3,cexp(sol3))-x);
		// if (err3 < best_err) {
		// 	best_err = err3;
		// }

		vec2 sol4 = sol0;
		float err4 = 1000.0;
		vec2 sol5 = x;
		float err5 = 100.0;
		if ((x.x>-0.4) && cabs(x.y)>0.4) { //it's got some confusion about the branch cut otherwise
			// Method 4: Numerical evaluation using Newton's method: https://en.wikipedia.org/wiki/Lambert_W_function#Numerical_evaluation
			vec2 w = ONE; //picking ONE makes the answer unstable elsewhere...
			vec2 ew = ONE;
			vec2 wew = ONE;
			for (int j = 0; j < 100; j++) {
				ew = cexp(w);
				wew = cmul(w,ew);
				w -= cdiv(wew-x,ew + wew-cdiv(cmul(w+2.0*ONE,wew-x),2.0*w+2.0*ONE));
				// TODO: add something to kill this early if it's close
			}
			sol4 = w;

			err4 = cmag2(wew-x);
			if (err4 < best_err) {
				best_err = err4;
			}
			// I honestly don't understand why this works
		} else if ((x.x<-0.4) || (x.x>2.2) || (x.y>.41) || (x.y<-.41)) { //here's some goofy heuristics
			// Method 4 v2: Numerical evaluation using Newton's method: https://en.wikipedia.org/wiki/Lambert_W_function#Numerical_evaluation
			vec2 w = sol0; 
			vec2 ew = ONE;
			vec2 wew = ONE;
			for (int j = 0; j < 100; j++) {
				ew = cexp(w);
				wew = cmul(w,ew);
				w -= cdiv(wew-x,ew + wew-cdiv(cmul(w+2.0*ONE,wew-x),2.0*w+2.0*ONE));
			}
			sol5 = w;

			err5 = cmag2(wew-x);
			if (err5 < best_err) {
				if ((x.y<0.0 && w.y<0.0) || (x.y>0.0 && w.y>0.0)) {
					best_err = err5;
				}
			}
		}

		vec2 sol6 = x;
		float err6 = 100.0;
		// manual patches around bad spots
		if (cmag2(x+.37*ONE)<.01) {
			vec2 w = ONE; 
			vec2 ew = ONE;
			vec2 wew = ONE;
			for (int j = 0; j < 100; j++) {
				ew = cexp(w);
				wew = cmul(w,ew);
				w -= cdiv(wew-x,ew + wew-cdiv(cmul(w+2.0*ONE,wew-x),2.0*w+2.0*ONE));
			}
			sol6 = w;

			err6 = cmag2(wew-x);
			if (err6 < best_err) {
				if ((x.y<0.0 && w.y<0.0) || (x.y>0.0 && w.y>0.0) || (cabs(x.y)<.00000001)) {
					best_err = err6;
				}
			}
		}

		// Now return best method
		if (best_err == err0) {
			return sol0;
		} else if (best_err == err1) {
			return sol1;
		// } else if (best_err == err2) {
			// this one is pretty useless
			// return sol2;
		// } else if (best_err == err3) {
		// 	return sol3;
		} else if (best_err == err4) {
			return sol4;
		} else if (best_err == err5) {
			return sol5;
		} else if (best_err == err6) {
			return sol6;
		}
	}
	return ZERO;
}
#endfunction